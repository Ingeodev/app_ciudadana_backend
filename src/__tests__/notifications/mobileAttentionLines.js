const request = require("supertest");

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/attention_lines`;
describe("Mobile - Attention Lines management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  beforeAll(async () => {
    const firebaseAuth = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestMobileUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken;
  });

  describe("GET /attention_lines/ ", () => {
    test("should respond with status 200 and an object containing the phone and whatsapp properties.", async () => {
      // No pagination
      const response0 = await request(usedHost).get("/").set(requestHeaders);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("phone");
      expect(response0.body).toHaveProperty("whatsapp");
    });

    // Removed: GET /attention_lines/ es un endpoint PÚBLICO (mobile.js:113-117, sin auth).
    // El test de 401 sin Authorization estaba obsoleto: responde 200 sin token.
  });
});
