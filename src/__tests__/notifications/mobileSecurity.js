const request = require("supertest");

// Deployed
// const usedHost = `${global.notificationsMicroserviceOnlineHost}/mobile/v1/notifications/security`;
// Local
const usedHost = `${global.notificationsMicroserviceLocalHost}/mobile/v1/notifications/security`;
describe("Mobile - Security management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const testCategory0 = {
    name: "Comida",
    imageUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    siteUri: "http://test.site.url",
    color: 0,
  };

  const testCategory1 = {
    name: "Ropa",
    imageUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    siteUri: "http://test.site.url",
    color: 1,
  };

  beforeAll(async () => {
    const firebaseAuth = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken;
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

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get("/");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });
});
