export type UnlockBody = {
  access_code: string;
};

export const unlockSchema = {
  body: {
    type: "object",
    required: ["access_code"],
    properties: {
      access_code: { type: "string", pattern: "^[0-9]{6}$" }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: "object",
      required: ["message", "rental_id", "locker_id"],
      properties: {
        message: { type: "string", const: "Locker aberto" },
        rental_id: { type: "string", format: "uuid" },
        locker_id: { type: "string", format: "uuid" }
      }
    }
  }
} as const;
