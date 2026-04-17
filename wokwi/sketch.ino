#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// --- Configurações Wokwi ---
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// --- Configurações da API ---

const String LOCKER_ID = "c39b918f-cc05-4a3a-b8fb-48fe2762e883"; //lck-26
const String API_URL = "https://fast-lock-monolito.ambitiousriver-98471daa.eastus.azurecontainerapps.io/api/lockers/" + LOCKER_ID + "/public-context";

// --- Pinos de Hardware ---
const int SERVO_PIN = 18;

Servo lockerServo;
LiquidCrystal_I2C* lcd = nullptr;
bool lcdReady = false;
uint8_t lcdAddress = 0;

// Variáveis para evitar atualizar o hardware desnecessariamente
String currentState = ""; 

bool i2cDeviceExists(uint8_t address) {
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}

uint8_t scanI2cBus() {
  Serial.println("Escaneando barramento I2C...");
  uint8_t firstFound = 0;

  for (uint8_t addr = 1; addr < 127; addr++) {
    if (i2cDeviceExists(addr)) {
      Serial.print("I2C device encontrado em 0x");
      if (addr < 16) {
        Serial.print("0");
      }
      Serial.println(addr, HEX);

      if (firstFound == 0) {
        firstFound = addr;
      }
    }
  }

  if (firstFound == 0) {
    Serial.println("Nenhum dispositivo I2C encontrado.");
  }

  return firstFound;
}

void lcdPrint(const String& line1, const String& line2 = "") {
  if (!lcdReady || lcd == nullptr) {
    return;
  }

  lcd->clear();
  lcd->setCursor(0, 0);
  lcd->print(line1);
  lcd->setCursor(0, 1);
  lcd->print(line2);
}

void initLcd() {
  // No ESP32, inicializar o barramento I2C explicitamente evita LCD "apagado".
  Wire.begin(21, 22, 100000);
  delay(50);

  lcdAddress = scanI2cBus();
  if (lcdAddress == 0) {
    lcdReady = false;
    return;
  }

  Serial.print("Inicializando LCD no endereco 0x");
  if (lcdAddress < 16) {
    Serial.print("0");
  }
  Serial.println(lcdAddress, HEX);

  if (lcd != nullptr) {
    delete lcd;
    lcd = nullptr;
  }
  lcd = new LiquidCrystal_I2C(lcdAddress, 16, 2);

  lcd->init();
  lcd->backlight();
  lcd->clear();
  lcd->setCursor(0, 0);
  lcd->print("LCD OK");
  lcd->setCursor(0, 1);
  lcd->print("Addr 0x");
  if (lcdAddress < 16) {
    lcd->print("0");
  }
  lcd->print(lcdAddress, HEX);

  lcdReady = true;
  delay(500);
}

void setup() {
  Serial.begin(115200);
  
  // Inicializa o Servo (Trancado = 0 graus)
  lockerServo.attach(SERVO_PIN);
  lockerServo.write(0);
  
  // Inicializa o Display LCD
  initLcd();
  lcdPrint("Iniciando...");

  // Conecta ao Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nConectado ao WiFi!");
  lcdPrint("Conectado API!");
  delay(1000);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(API_URL);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode == 200) {
      String payload = http.getString();
      
      // Parse do JSON usando o tamanho dinâmico (ideal para respostas complexas)
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error) {
        String lockerStatus = doc["locker"]["status"].as<String>();
        String rentalStatus = "";
        
        // Verifica se há um aluguel ativo associado
        if (!doc["active_rental"].isNull()) {
          rentalStatus = doc["active_rental"]["status"].as<String>();
        }

        // Lógica de Estados baseada no seu openapi.yaml
        String newState = "";
        String msgLinha1 = "";
        String msgLinha2 = "";
        int targetAngle = 0;

        if (lockerStatus == "maintenance") {
          newState = "MAINTENANCE";
          msgLinha1 = "Manutencao";
          msgLinha2 = "Indisponivel";
          targetAngle = 0; // Trancado
        } 
        else if (lockerStatus == "free") {
          newState = "FREE";
          msgLinha1 = "Locker Livre";
          msgLinha2 = "Pronto para uso";
          targetAngle = 0; // Trancado
        } 
        else if (lockerStatus == "occupied") {
          // Se está ocupado, o estado do aluguel dita se a porta está aberta ou fechada
          if (rentalStatus == "active") {
            // O usuário acabou de alugar (ou destrancou), esperando colocar o item
            newState = "OPEN";
            msgLinha1 = "Locker Aberto";
            msgLinha2 = "Guarde seu item";
            targetAngle = 90; // Aberto!
          } 
          else if (rentalStatus == "storing") {
            // Item guardado e trancado
            newState = "STORING";
            msgLinha1 = "Em Uso";
            msgLinha2 = "Trancado Seguro";
            targetAngle = 0; // Trancado
          } 
          else if (rentalStatus == "pending_retrieval_payment") {
            // Aguardando taxa extra para retirar
            newState = "PAYMENT_PENDING";
            msgLinha1 = "Aguardando Pgto";
            msgLinha2 = "Trancado";
            targetAngle = 0; // Trancado
          }
          else {
            // Fallback genérico para ocupado
            newState = "OCCUPIED_UNKNOWN";
            msgLinha1 = "Ocupado";
            msgLinha2 = "Trancado";
            targetAngle = 0;
          }
        }

        // Só atualiza o hardware físico se o estado mudou (evita "flicker" no LCD e vibração no servo)
        if (newState != currentState) {
          currentState = newState;

          lcdPrint(msgLinha1, msgLinha2);
          
          lockerServo.write(targetAngle);
          
          Serial.println(">>> Estado mudou para: " + newState);
        }
      }
    } else {
      Serial.println("Erro na requisição: " + String(httpResponseCode));
    }
    http.end();
  }
  
  // Delay de 3 segundos para não espancar o backend de chamadas (Polling)
  delay(3000); 
}