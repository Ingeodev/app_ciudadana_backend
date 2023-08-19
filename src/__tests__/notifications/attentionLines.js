const request = require("supertest");

const usedHost = `${global.notificationsMicroserviceLocalHost}/web/v1/notifications/attention_lines`;
describe("Web - Attention Lines management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const testAttLine0 = {
    phone: "3122334455",
    whatsapp: "3122334466",
  };

  const testAttLine1 = {
    phone: "3122334455",
    whatsapp: "3122334466",
  };

  beforeAll(async () => {
    const firebaseAuth = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestWebUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken;
  });

  describe("POST /attentionLines/ ", () => {
    test("should respond with status 201 and the new object (data) after creating a new attention line", async () => {
      // {
      //     "meta": null,
      //     "data": {
      //         "id": 1,
      //         "phone": "3122223344",
      //         "whatsapp": "3122223355",
      //         "updatedAt": "2023-08-09T21:23:51.128Z",
      //         "createdAt": "2023-08-09T21:23:51.128Z",
      //         "deletedAt": null
      //     }
      // }
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testAttLine0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      // testDocType0.id = response0.body.data.id;

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testAttLine1);
      expect(response1.statusCode).toBe(201);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("id");
      // testDocType0.id = response1.body.data.id;
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // {
      // "status": 400,
      // "detail": "\"phone\" must be a number",
      // "code": "Bad Request"
      // }
      // const response0 = await request(usedHost)
      //   .post("/")
      //   .set(requestHeaders)
      //   .send({
      //     ...testAttLine0,
      //     phone: "should be a number",
      //   });
      // expect(response0.statusCode).toBe(400);
      // expect(response0.body).not.toHaveProperty("meta");
      // expect(response0.body).not.toHaveProperty("data");
      // expect(response0.body).toHaveProperty("status", 400);
      // expect(response0.body).toHaveProperty("code");
      // expect(response0.body).toHaveProperty("detail");

      // {
      //     "status": 400,
      //     "detail": "\"phone\" is required",
      //     "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testAttLine0,
          phone: "        ",
        });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    // {
    // "status": 500,
    // "detail": "Validation error",
    // "code": "Internal Server Error"
    // }
    // test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
    //   const response0 = await request(usedHost)
    //     .post("/")
    //     .set(requestHeaders)
    //     .send(testDocType0);
    //   // .send({
    //   //   ...testDocType0,
    //   //   code: -5,
    //   // });
    //   expect(response0.statusCode).toBe(500);
    //   expect(response0.body).not.toHaveProperty("meta");
    //   expect(response0.body).not.toHaveProperty("data");
    //   expect(response0.body).toHaveProperty("status", 500);
    //   expect(response0.body).toHaveProperty("code");
    //   expect(response0.body).toHaveProperty("detail");

    //   const response1 = await request(usedHost)
    //     .post("/")
    //     .set(requestHeaders)
    //     .send({
    //       ...testDocType1,
    //       code: 22,
    //     });
    //   expect(response1.statusCode).toBe(500);
    //   expect(response1.body).not.toHaveProperty("meta");
    //   expect(response1.body).not.toHaveProperty("data");
    //   expect(response1.body).toHaveProperty("status", 500);
    //   expect(response1.body).toHaveProperty("code");
    //   expect(response1.body).toHaveProperty("detail");
    // });

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).post("/");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });
});
