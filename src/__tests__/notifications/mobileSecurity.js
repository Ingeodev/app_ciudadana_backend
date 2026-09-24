const request = require("supertest");

// Deployed
// const usedHost = `${global.notificationsMicroserviceOnlineHost}/mobile/v1/notifications/security`;
// Local
const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/security`;
describe("Mobile - Security management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  beforeAll(async () => {
    const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestMobileUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken; // console.log(requestHeaders);
  });

  describe("GET / ", () => {
    test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
      const response0 = await request(usedHost).get("/").set(requestHeaders);
      // .query({ page: { number: 1, size: 2 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("reportCategories");
      expect(response0.body.reportCategories).toEqual(expect.any(Array));
      expect(response0.body.reportCategories.length).toBeGreaterThan(0);
      expect(response0.body).toHaveProperty("securityLines");
      expect(response0.body.securityLines).toEqual(expect.any(Array));
      expect(response0.body.securityLines.length).toBeGreaterThan(0);
    });

    // Removed: GET /security es un endpoint PÚBLICO (mobile.js:76-80, sin authMiddleware).
    // El test de 401 sin Authorization estaba obsoleto: el endpoint responde 200 sin token.
    // El caso de uso ya está cubierto por el test anterior (200 sin dependencia del token).

    test("DISABLED - Security table must not have any records. should fail with status 404 and an error with a message of securities not found.", async () => {
      // 1. ------------------------------------------------
      // const response0 = await request(usedHost)
      //   .get("/")
      //   .set(requestHeaders)
      //   .query({ page: { number: 1, size: 2 } });
      // expect(response0.statusCode).toBe(404);
      // expect(response0.body).not.toHaveProperty("meta");
      // expect(response0.body).not.toHaveProperty("data");
      // expect(response0.body).toHaveProperty("status", 404);
      // expect(response0.body).toHaveProperty("code");
      // expect(response0.body).toHaveProperty("detail");
    });
  });
});
