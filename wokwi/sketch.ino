#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <string.h>

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

const char* API_BASE = "https://fast-lock-monolito.ambitiousriver-98471daa.eastus.azurecontainerapps.io/api";
const char* LOCATION_ID = "2a5c4947-f038-4bea-b1c8-b676461053bd";

const unsigned long LOCKERS_POLL_INTERVAL_MS = 4000;
const unsigned long CONTEXT_SLOT_INTERVAL_MS = 750;
const unsigned long CONTEXT_REFRESH_OPEN_MS = 2000;
const unsigned long CONTEXT_REFRESH_CLOSED_MS = 12000;
const unsigned long CONTEXT_RETRY_MS = 5000;
const unsigned long WIFI_RETRY_INTERVAL_MS = 5000;
const unsigned long SERVO_STEP_DELAY_MS = 12;
const int SERVO_STEP_DEGREES = 3;

const int SERVO_LOCKED_ANGLE = 90;
const int SERVO_OPEN_ANGLE = 0;
const uint8_t LCD_COLUMNS = 16;
const uint8_t LCD_ROWS = 2;

enum LockerStatusCode : uint8_t {
  STATUS_UNKNOWN,
  STATUS_FREE,
  STATUS_OCCUPIED,
  STATUS_MAINTENANCE
};

enum LockerVisualState : uint8_t {
  VISUAL_UNKNOWN,
  VISUAL_FREE,
  VISUAL_RESERVED,
  VISUAL_OCCUPIED,
  VISUAL_MAINTENANCE
};

struct LockerNode {
  const char* id;
  const char* code;
  uint8_t servoPin;
  uint8_t greenLedPin;
  uint8_t redLedPin;
  Servo servo;
  LockerStatusCode status;
  LockerVisualState renderedState;
  bool contextKnown;
  bool doorOpen;
  int currentAngle;
  unsigned long nextContextDueAt;

  LockerNode(const char* lockerId, const char* lockerCode, uint8_t servoPinValue, uint8_t greenLedPinValue, uint8_t redLedPinValue)
    : id(lockerId),
      code(lockerCode),
      servoPin(servoPinValue),
      greenLedPin(greenLedPinValue),
      redLedPin(redLedPinValue),
      status(STATUS_UNKNOWN),
      renderedState(VISUAL_UNKNOWN),
      contextKnown(false),
      doorOpen(false),
      currentAngle(-1),
      nextContextDueAt(0) {}
};

LockerNode lockers[] = {
  LockerNode("65ddd4ee-226f-46c1-88e8-a49a21c4930b", "ANL-001", 13, 2, 25),
  LockerNode("4e01bca6-88f6-4169-8976-136cbf0c2d52", "ANL-002", 14, 4, 26),
  LockerNode("dabf29da-c3b7-48b5-a80b-8b63be946f21", "ANL-003", 16, 5, 27),
  LockerNode("c2cc0a66-8386-48d7-b2e4-e0977fc8353d", "ANL-004", 17, 19, 32),
  LockerNode("d43ad7b6-ce53-457c-a6a8-12aa67664b87", "ANL-005", 18, 23, 33)
};

LiquidCrystal_I2C lockerLcds[] = {
  LiquidCrystal_I2C(0x27, LCD_COLUMNS, LCD_ROWS),
  LiquidCrystal_I2C(0x26, LCD_COLUMNS, LCD_ROWS),
  LiquidCrystal_I2C(0x25, LCD_COLUMNS, LCD_ROWS),
  LiquidCrystal_I2C(0x24, LCD_COLUMNS, LCD_ROWS),
  LiquidCrystal_I2C(0x23, LCD_COLUMNS, LCD_ROWS)
};

const size_t LOCKER_COUNT = sizeof(lockers) / sizeof(lockers[0]);

bool lcdsReady = false;
bool hasSuccessfulPoll = false;
size_t nextContextIndex = 0;

unsigned long nextLockersPollAt = 0;
unsigned long nextContextSlotAt = 0;
unsigned long nextWifiRetryAt = 0;

char lastLcdLine1[LOCKER_COUNT][LCD_COLUMNS + 1] = { { 0 } };
char lastLcdLine2[LOCKER_COUNT][LCD_COLUMNS + 1] = { { 0 } };

bool isDue(unsigned long now, unsigned long deadline) {
  return static_cast<long>(now - deadline) >= 0;
}

size_t lockerIndexOf(const LockerNode* locker) {
  return static_cast<size_t>(locker - lockers);
}

LockerNode* findLockerById(const char* id) {
  for (size_t index = 0; index < LOCKER_COUNT; index++) {
    if (strcmp(lockers[index].id, id) == 0) {
      return &lockers[index];
    }
  }

  return nullptr;
}

LockerStatusCode parseLockerStatus(const char* status) {
  if (strcmp(status, "free") == 0) {
    return STATUS_FREE;
  }

  if (strcmp(status, "occupied") == 0) {
    return STATUS_OCCUPIED;
  }

  if (strcmp(status, "maintenance") == 0) {
    return STATUS_MAINTENANCE;
  }

  return STATUS_UNKNOWN;
}

LockerVisualState resolveVisualState(const LockerNode& locker) {
  if (locker.status == STATUS_MAINTENANCE) {
    return VISUAL_MAINTENANCE;
  }

  if (locker.status == STATUS_FREE) {
    return VISUAL_FREE;
  }

  if (locker.status == STATUS_OCCUPIED) {
    return locker.doorOpen ? VISUAL_RESERVED : VISUAL_OCCUPIED;
  }

  return VISUAL_UNKNOWN;
}

const char* buildDisplayStatus(const LockerNode& locker) {
  if (locker.status == STATUS_OCCUPIED && !locker.contextKnown) {
    return "SINCRONIZANDO";
  }

  switch (resolveVisualState(locker)) {
    case VISUAL_FREE:
      return "LIVRE FECHADO";
    case VISUAL_RESERVED:
      return "RESERV ABERTO";
    case VISUAL_OCCUPIED:
      return "OCUP FECHADO";
    case VISUAL_MAINTENANCE:
      return "MANUT FECHADO";
    default:
      return "SEM DADOS";
  }
}

void copyPaddedLine(char* destination, const char* source) {
  const size_t maxLength = LCD_COLUMNS;
  const size_t sourceLength = strlen(source);
  const size_t copyLength = sourceLength < maxLength ? sourceLength : maxLength;

  memset(destination, ' ', maxLength);
  memcpy(destination, source, copyLength);
  destination[maxLength] = '\0';
}

void renderLockerLcd(size_t index, const char* line1, const char* line2) {
  if (!lcdsReady) {
    return;
  }

  char paddedLine1[LCD_COLUMNS + 1];
  char paddedLine2[LCD_COLUMNS + 1];
  copyPaddedLine(paddedLine1, line1);
  copyPaddedLine(paddedLine2, line2);

  if (strcmp(lastLcdLine1[index], paddedLine1) != 0) {
    lockerLcds[index].setCursor(0, 0);
    lockerLcds[index].print(paddedLine1);
    memcpy(lastLcdLine1[index], paddedLine1, sizeof(lastLcdLine1[index]));
  }

  if (strcmp(lastLcdLine2[index], paddedLine2) != 0) {
    lockerLcds[index].setCursor(0, 1);
    lockerLcds[index].print(paddedLine2);
    memcpy(lastLcdLine2[index], paddedLine2, sizeof(lastLcdLine2[index]));
  }
}

void renderAllDisplaysMessage(const char* message) {
  for (size_t index = 0; index < LOCKER_COUNT; index++) {
    renderLockerLcd(index, lockers[index].code, message);
  }
}

void renderLockerDisplay(size_t index) {
  if (WiFi.status() != WL_CONNECTED) {
    renderLockerLcd(index, lockers[index].code, "WIFI OFFLINE");
    return;
  }

  if (!hasSuccessfulPoll) {
    renderLockerLcd(index, lockers[index].code, "AGUARDANDO API");
    return;
  }

  renderLockerLcd(index, lockers[index].code, buildDisplayStatus(lockers[index]));
}

void renderAllLockerDisplays() {
  for (size_t index = 0; index < LOCKER_COUNT; index++) {
    renderLockerDisplay(index);
  }
}

void moveServo(LockerNode& locker, int targetAngle) {
  if (locker.currentAngle == targetAngle) {
    return;
  }

  const int startAngle = locker.currentAngle < 0 ? SERVO_LOCKED_ANGLE : locker.currentAngle;
  const int direction = targetAngle >= startAngle ? 1 : -1;

  locker.servo.attach(locker.servoPin, 500, 2400);

  for (int angle = startAngle; angle != targetAngle; angle += direction * SERVO_STEP_DEGREES) {
    locker.servo.write(angle);
    delay(SERVO_STEP_DELAY_MS);
  }

  locker.servo.write(targetAngle);
  delay(SERVO_STEP_DELAY_MS * 2);
  locker.servo.detach();
  locker.currentAngle = targetAngle;
}

void applyHardware(LockerNode& locker) {
  if (locker.status == STATUS_OCCUPIED && !locker.contextKnown) {
    return;
  }

  const LockerVisualState targetState = resolveVisualState(locker);

  uint8_t greenLevel = LOW;
  uint8_t redLevel = LOW;
  int targetAngle = SERVO_LOCKED_ANGLE;

  switch (targetState) {
    case VISUAL_FREE:
      greenLevel = HIGH;
      redLevel = LOW;
      targetAngle = SERVO_LOCKED_ANGLE;
      break;
    case VISUAL_RESERVED:
      greenLevel = LOW;
      redLevel = HIGH;
      targetAngle = SERVO_OPEN_ANGLE;
      break;
    case VISUAL_OCCUPIED:
      greenLevel = LOW;
      redLevel = HIGH;
      targetAngle = SERVO_LOCKED_ANGLE;
      break;
    case VISUAL_MAINTENANCE:
      greenLevel = LOW;
      redLevel = HIGH;
      targetAngle = SERVO_LOCKED_ANGLE;
      break;
    default:
      greenLevel = LOW;
      redLevel = LOW;
      targetAngle = SERVO_LOCKED_ANGLE;
      break;
  }

  if (locker.renderedState == targetState && locker.currentAngle == targetAngle) {
    return;
  }

  moveServo(locker, targetAngle);
  digitalWrite(locker.greenLedPin, greenLevel);
  digitalWrite(locker.redLedPin, redLevel);
  locker.renderedState = targetState;
}

void applyHardwareToAll() {
  for (size_t index = 0; index < LOCKER_COUNT; index++) {
    applyHardware(lockers[index]);
  }
}

void initLcds() {
  Wire.begin(21, 22, 100000);
  delay(20);

  for (size_t index = 0; index < LOCKER_COUNT; index++) {
    lockerLcds[index].init();
    lockerLcds[index].backlight();
    lockerLcds[index].clear();
  }

  lcdsReady = true;
  renderAllDisplaysMessage("BOOT FASTLOCK");
}

void initHardware() {
  for (size_t index = 0; index < LOCKER_COUNT; index++) {
    pinMode(lockers[index].greenLedPin, OUTPUT);
    pinMode(lockers[index].redLedPin, OUTPUT);
    digitalWrite(lockers[index].greenLedPin, LOW);
    digitalWrite(lockers[index].redLedPin, LOW);
    moveServo(lockers[index], SERVO_LOCKED_ANGLE);
    lockers[index].renderedState = VISUAL_UNKNOWN;
  }
}

void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  renderAllDisplaysMessage("CONECT WIFI");
  Serial.print("Conectando ao WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi conectado.");
  renderAllDisplaysMessage("SINCRONIZANDO");
}

void ensureWiFi(unsigned long now) {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  if (!isDue(now, nextWifiRetryAt)) {
    return;
  }

  Serial.println("WiFi offline. Tentando reconectar...");
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  renderAllDisplaysMessage("WIFI OFFLINE");
  nextWifiRetryAt = now + WIFI_RETRY_INTERVAL_MS;
}

bool fetchLockersSnapshot() {
  char url[256];
  snprintf(url, sizeof(url), "%s/lockers?location_id=%s&limit=20", API_BASE, LOCATION_ID);

  HTTPClient http;
  http.setReuse(false);
  http.setTimeout(3000);
  http.begin(url);

  const int httpResponseCode = http.GET();
  if (httpResponseCode != 200) {
    Serial.printf("Erro ao listar lockers: HTTP %d\n", httpResponseCode);
    http.end();
    return false;
  }

  JsonDocument doc;
  const DeserializationError error = deserializeJson(doc, http.getStream());
  if (error) {
    Serial.printf("Falha no JSON da lista: %s\n", error.c_str());
    http.end();
    return false;
  }

  bool seen[LOCKER_COUNT] = { false };
  const unsigned long now = millis();
  JsonArray data = doc["data"].as<JsonArray>();

  for (JsonObject item : data) {
    const char* id = item["id"] | "";
    LockerNode* locker = findLockerById(id);
    if (locker == nullptr) {
      continue;
    }

    const size_t lockerIndex = lockerIndexOf(locker);
    seen[lockerIndex] = true;

    const LockerStatusCode newStatus = parseLockerStatus(item["status"] | "");
    if (locker->status != newStatus) {
      Serial.printf("%s -> status %s\n", locker->code, item["status"] | "unknown");
    }

    locker->status = newStatus;

    if (newStatus == STATUS_OCCUPIED) {
      if (!locker->contextKnown) {
        locker->nextContextDueAt = now;
      }
    } else {
      locker->contextKnown = false;
      locker->doorOpen = false;
      locker->nextContextDueAt = 0;
    }
  }

  for (size_t index = 0; index < LOCKER_COUNT; index++) {
    if (seen[index]) {
      continue;
    }

    lockers[index].status = STATUS_UNKNOWN;
    lockers[index].contextKnown = false;
    lockers[index].doorOpen = false;
    lockers[index].nextContextDueAt = 0;
  }

  http.end();

  for (size_t index = 0; index < LOCKER_COUNT; index++) {
    if (lockers[index].status == STATUS_OCCUPIED && !lockers[index].contextKnown) {
      refreshLockerContext(lockers[index]);
    }
  }

  hasSuccessfulPoll = true;
  applyHardwareToAll();
  renderAllLockerDisplays();
  return true;
}

bool refreshLockerContext(LockerNode& locker) {
  char url[256];
  snprintf(url, sizeof(url), "%s/lockers/%s/public-context", API_BASE, locker.id);

  HTTPClient http;
  http.setReuse(false);
  http.setTimeout(3000);
  http.begin(url);

  const int httpResponseCode = http.GET();
  if (httpResponseCode != 200) {
    Serial.printf("Erro ao atualizar %s: HTTP %d\n", locker.code, httpResponseCode);
    locker.nextContextDueAt = millis() + CONTEXT_RETRY_MS;
    http.end();
    return false;
  }

  JsonDocument doc;
  const DeserializationError error = deserializeJson(doc, http.getStream());
  if (error) {
    Serial.printf("Falha no JSON de %s: %s\n", locker.code, error.c_str());
    locker.nextContextDueAt = millis() + CONTEXT_RETRY_MS;
    http.end();
    return false;
  }

  const LockerStatusCode previousStatus = locker.status;
  const bool previousDoorOpen = locker.doorOpen;
  const bool previousContextKnown = locker.contextKnown;

  locker.status = parseLockerStatus(doc["locker"]["status"] | "occupied");

  bool newDoorOpen = false;
  if (locker.status == STATUS_OCCUPIED) {
    JsonVariant activeRental = doc["active_rental"];
    if (!activeRental.isNull()) {
      const char* rentalStatus = activeRental["status"] | "";
      newDoorOpen = strcmp(rentalStatus, "active") == 0;
    }

    locker.contextKnown = true;
    locker.doorOpen = newDoorOpen;
    locker.nextContextDueAt = millis() + (locker.doorOpen ? CONTEXT_REFRESH_OPEN_MS : CONTEXT_REFRESH_CLOSED_MS);
  } else {
    locker.contextKnown = false;
    locker.doorOpen = false;
    locker.nextContextDueAt = 0;
  }

  http.end();

  const bool visualChanged =
    previousStatus != locker.status ||
    previousDoorOpen != locker.doorOpen ||
    previousContextKnown != locker.contextKnown;

  if (visualChanged) {
    Serial.printf("%s -> %s\n", locker.code, locker.doorOpen ? "RESERVADO/ABERTO" : "TRANCADO");
    applyHardware(locker);
    renderLockerDisplay(lockerIndexOf(&locker));
  }

  return true;
}

void refreshNextDueContext(unsigned long now) {
  for (size_t offset = 0; offset < LOCKER_COUNT; offset++) {
    const size_t index = (nextContextIndex + offset) % LOCKER_COUNT;
    LockerNode& locker = lockers[index];

    if (locker.status != STATUS_OCCUPIED) {
      continue;
    }

    if (locker.contextKnown && !isDue(now, locker.nextContextDueAt)) {
      continue;
    }

    nextContextIndex = (index + 1) % LOCKER_COUNT;
    refreshLockerContext(locker);
    return;
  }
}

void setup() {
  Serial.begin(115200);
  initLcds();
  initHardware();
  connectToWiFi();

  nextLockersPollAt = millis();
  nextContextSlotAt = millis();
  nextWifiRetryAt = millis();
}

void loop() {
  const unsigned long now = millis();
  ensureWiFi(now);

  if (WiFi.status() == WL_CONNECTED) {
    if (isDue(now, nextLockersPollAt)) {
      fetchLockersSnapshot();
      nextLockersPollAt = now + LOCKERS_POLL_INTERVAL_MS;
    }

    if (isDue(now, nextContextSlotAt)) {
      refreshNextDueContext(now);
      nextContextSlotAt = now + CONTEXT_SLOT_INTERVAL_MS;
    }
  } else {
    renderAllDisplaysMessage("WIFI OFFLINE");
  }
}
