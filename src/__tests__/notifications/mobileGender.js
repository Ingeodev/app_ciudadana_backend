const request = require("supertest");

// Deployed
// const usedHost = `${global.usersMicroserviceOnlineHost}/api/mobile/v1/users/categories`;
// Local
const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/gender`;

describe("Mobile - Gender equality management API points: ", () => {
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

  describe("GET /gender ", () => {
    test("should respond with status 200 and a list of gender equality attention lines and categories", async () => {
      const response0 = await request(usedHost).get("/").set(requestHeaders);
      // .query({ page: { number: 1, size: 2 }, lat, lon });
      expect(response0.statusCode).toBe(200);
      // expect(response0.body).toEqual(expect.any(Array));
      // expect(response0.body.length).toBe(2);
      expect(response0.body).toHaveProperty("info");
      expect(response0.body).toHaveProperty("genderLines");
    });

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost)
        .get("/");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("DISABLED - (gender equality attention lines and categories) table must not have any records. should fail with status 404 and an error with a message of gender equality attention lines and categories not found.", async () => {
      // 1. ------------------------------------------------
      // const response0 = await request(usedHost)
      //   .get("/")
      //   .set(requestHeaders);
      // expect(response0.statusCode).toBe(404);
      // expect(response0.body).not.toHaveProperty("meta");
      // expect(response0.body).not.toHaveProperty("data");
      // expect(response0.body).toHaveProperty("status", 404);
      // expect(response0.body).toHaveProperty("code");
      // expect(response0.body).toHaveProperty("detail");
    });
  });
});
