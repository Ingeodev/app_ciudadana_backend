const request = require("supertest");

// Deployed
// const usedHost = `${global.usersMicroserviceOnlineHost}/api/web/v1/users`;
// Local
const usedHost = `${global.usersMicroserviceLocalHost}/api/web/v1/users`;
describe("Web - Users management API points: ", () => {
  jest.setTimeout(25000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const testUser0 = {
    name: "Juan Francisco",
    lastName: "Perez",
    phone: "1111111111",
    email: "test@gmail.com",
  };

  const editUser0 = {
    documentTypeId: 6,
    numberDocument: "123456789",
    residenceAddress: "testDireccion",
    serviceReceiptUri:
      "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    siteUri: "http://test.site.url",
  };

  const testFullLogin = {
    clientId: "rlvMzYND8YMy6EZRdGg0vvPb4zT2",
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

  // TODO: Start /account/info
  describe("POST /account/info ", () => {
    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "code": "Bad Request",
      //     "detail": "\"email\" is required"
      // }
      const response0 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send({
          ...testUser0,
          email: "           ",
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"email\" must be a valid email",
      //     "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send({
          ...testUser0,
          email: "must be in email format",
        });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      // ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"phone\" is required",
      //     "code": "Bad Request"
      // }
      const response2 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send({
          ...testUser0,
          phone: "         ",
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"phone\" must be a string",
      //     "code": "Bad Request"
      // }
      const response3 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send({
          ...testUser0,
          phone: 3122223344,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"name\" is required",
      //     "code": "Bad Request"
      // }
      const response4 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send({
          ...testUser0,
          name: "     ",
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      // ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"name\" must be a string",
      //     "code": "Bad Request"
      // }
      const response5 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send({
          ...testUser0,
          name: 111111,
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"lastName\" is required",
      //     "code": "Bad Request"
      // }
      const response6 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send({
          ...testUser0,
          lastName: "     ",
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"lastName\" must be a string",
      //     "code": "Bad Request"
      // }
      const response7 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send({
          ...testUser0,
          lastName: 111111,
        });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");
    });

    test("should respond with status 201 and the new object (data) after creating a new user web", async () => {
      // {
      //     "meta": null,
      //     "data": {
      //         "id": 2,
      //         "name": "Juan Francisco",
      //         "lastName": "Perez",
      //         "phone": "3017712323",
      //         "email": "test@gmail.com",
      //         "clientId": "rlvMzYND8YMy6EZRdGg0vvPb4zT2",
      //         "loginPhase": "baseLogin",
      //         "disabled": false,
      //         "userMobile": false,
      //         "createdAt": "2023-08-08T03:09:02.000Z",
      //         "updatedAt": "2023-08-08T03:09:02.416Z",
      //         "documentTypeId": null,
      //         "numberDocument": null,
      //         "residenceAddress": null,
      //         "serviceReceiptUri": null,
      //         "siteUri": null,
      //         "deleteAt": null
      //     }
      // }
      const response0 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send(testUser0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      testUser0.id = response0.body.data.id;
      expect(response0.body.data).toHaveProperty("userMobile");
      expect(response0.body.data.userMobile).toBe(false);
      expect(response0.body.data).toHaveProperty("disabled");
      expect(response0.body.data.disabled).toBe(false);
    });

    test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
      // ---------------------------------------------------------------
      // {
      // "status": 500,
      // "detail": "Validation error",
      // "code": "Internal Server Error"
      // }
      const response0 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send(testUser0);
      expect(response0.statusCode).toBe(500);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 500);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      // {
      //     "status": 401,
      //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
      //     "code": "Unauthorized"
      // }
      const response0 = await request(usedHost).post("/account/info");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /account/full_login ", () => {
    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // 1. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"documentTypeId\" is required",
      //     "code": "Bad Request"
      // }
      const response0 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          documentTypeId: undefined,
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // 2. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"documentTypeId\" must be a number",
      //     "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          documentTypeId: "        ",
        });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      // 3. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"documentTypeId\" must be greater than 0",
      //     "code": "Bad Request"
      // }
      const response2 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          documentTypeId: 0,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 4. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"documentTypeId\" must be a number",
      //     "code": "Bad Request"
      // }
      const response3 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          documentTypeId: null,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 5. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"numberDocument\" is required",
      //     "code": "Bad Request"
      // }
      const response4 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          numberDocument: undefined,
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      // 6. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"numberDocument\" is required",
      //     "code": "Bad Request"
      // }
      const response5 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          numberDocument: "        ",
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // 7. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"numberDocument\" must be a string",
      //     "code": "Bad Request"
      // }
      const response6 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          numberDocument: 0,
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // 8. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"numberDocument\" must be a string",
      //     "code": "Bad Request"
      // }
      const response7 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          numberDocument: null,
        });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");

      // 9. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"residenceAddress\" is required",
      //     "code": "Bad Request"
      // }
      const response8 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          residenceAddress: undefined,
        });
      expect(response8.statusCode).toBe(400);
      expect(response8.body).not.toHaveProperty("meta");
      expect(response8.body).not.toHaveProperty("data");
      expect(response8.body).toHaveProperty("status", 400);
      expect(response8.body).toHaveProperty("code");
      expect(response8.body).toHaveProperty("detail");

      // 10. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"residenceAddress\" must be a number",
      //     "code": "Bad Request"
      // }
      const response9 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          residenceAddress: "        ",
        });
      expect(response9.statusCode).toBe(400);
      expect(response9.body).not.toHaveProperty("meta");
      expect(response9.body).not.toHaveProperty("data");
      expect(response9.body).toHaveProperty("status", 400);
      expect(response9.body).toHaveProperty("code");
      expect(response9.body).toHaveProperty("detail");

      // 11. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"residenceAddress\" must be greater than 0",
      //     "code": "Bad Request"
      // }
      const response10 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          residenceAddress: 0,
        });
      expect(response10.statusCode).toBe(400);
      expect(response10.body).not.toHaveProperty("meta");
      expect(response10.body).not.toHaveProperty("data");
      expect(response10.body).toHaveProperty("status", 400);
      expect(response10.body).toHaveProperty("code");
      expect(response10.body).toHaveProperty("detail");

      // 12. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"residenceAddress\" must be a number",
      //     "code": "Bad Request"
      // }
      const response11 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          residenceAddress: null,
        });
      expect(response11.statusCode).toBe(400);
      expect(response11.body).not.toHaveProperty("meta");
      expect(response11.body).not.toHaveProperty("data");
      expect(response11.body).toHaveProperty("status", 400);
      expect(response11.body).toHaveProperty("code");
      expect(response11.body).toHaveProperty("detail");

      // 13. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"serviceReceiptUri\" is required",
      //     "code": "Bad Request"
      // }
      const response12 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          serviceReceiptUri: undefined,
        });
      expect(response12.statusCode).toBe(400);
      expect(response12.body).not.toHaveProperty("meta");
      expect(response12.body).not.toHaveProperty("data");
      expect(response12.body).toHaveProperty("status", 400);
      expect(response12.body).toHaveProperty("code");
      expect(response12.body).toHaveProperty("detail");

      // 14. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"serviceReceiptUri\" is required",
      //     "code": "Bad Request"
      // }
      const response13 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          serviceReceiptUri: "        ",
        });
      expect(response13.statusCode).toBe(400);
      expect(response13.body).not.toHaveProperty("meta");
      expect(response13.body).not.toHaveProperty("data");
      expect(response13.body).toHaveProperty("status", 400);
      expect(response13.body).toHaveProperty("code");
      expect(response13.body).toHaveProperty("detail");

      // 15. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"serviceReceiptUri\" must be a string",
      //     "code": "Bad Request"
      // }
      const response14 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          serviceReceiptUri: 0,
        });
      expect(response14.statusCode).toBe(400);
      expect(response14.body).not.toHaveProperty("meta");
      expect(response14.body).not.toHaveProperty("data");
      expect(response14.body).toHaveProperty("status", 400);
      expect(response14.body).toHaveProperty("code");
      expect(response14.body).toHaveProperty("detail");

      // 16. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"serviceReceiptUri\" must be a number",
      //     "code": "Bad Request"
      // }
      const response15 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          serviceReceiptUri: "is.not.uri",
        });
      expect(response15.statusCode).toBe(400);
      expect(response15.body).not.toHaveProperty("meta");
      expect(response15.body).not.toHaveProperty("data");
      expect(response15.body).toHaveProperty("status", 400);
      expect(response15.body).toHaveProperty("code");
      expect(response15.body).toHaveProperty("detail");

      // 17. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"siteUri\" is required",
      //     "code": "Bad Request"
      // }
      const response16 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          siteUri: undefined,
        });
      expect(response16.statusCode).toBe(400);
      expect(response16.body).not.toHaveProperty("meta");
      expect(response16.body).not.toHaveProperty("data");
      expect(response16.body).toHaveProperty("status", 400);
      expect(response16.body).toHaveProperty("code");
      expect(response16.body).toHaveProperty("detail");

      // 18. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"siteUri\" is required",
      //     "code": "Bad Request"
      // }
      const response17 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          siteUri: "        ",
        });
      expect(response17.statusCode).toBe(400);
      expect(response17.body).not.toHaveProperty("meta");
      expect(response17.body).not.toHaveProperty("data");
      expect(response17.body).toHaveProperty("status", 400);
      expect(response17.body).toHaveProperty("code");
      expect(response17.body).toHaveProperty("detail");

      // 19. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"siteUri\" must be a string",
      //     "code": "Bad Request"
      // }
      const response18 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          siteUri: 0,
        });
      expect(response18.statusCode).toBe(400);
      expect(response18.body).not.toHaveProperty("meta");
      expect(response18.body).not.toHaveProperty("data");
      expect(response18.body).toHaveProperty("status", 400);
      expect(response18.body).toHaveProperty("code");
      expect(response18.body).toHaveProperty("detail");

      // 20. ---------------------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"siteUri\" must be a number",
      //     "code": "Bad Request"
      // }
      const response19 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          siteUri: "is.not.uri",
        });
      expect(response19.statusCode).toBe(400);
      expect(response19.body).not.toHaveProperty("meta");
      expect(response19.body).not.toHaveProperty("data");
      expect(response19.body).toHaveProperty("status", 400);
      expect(response19.body).toHaveProperty("code");
      expect(response19.body).toHaveProperty("detail");
    });

    test("should fail with status 500 and an error with a message if the data cannot be saved - documentTypeId = 999", async () => {
      // ---------------------------------------------------------------
      // {
      //     "status": 500,
      //     "detail": "insert or update on table violates foreign key constraint",
      //     "code": "Internal Server Error"
      // }
      const response0 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          documentTypeId: 999,
        });
      expect(response0.statusCode).toBe(500);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 500);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("should respond with status 201 and the new object (data) after creating a new document type", async () => {
      // {
      //     "meta": null,
      //     "data": {
      //         "id": 10,
      //         "clientId": "rlvMzYND8YMy6EZRdGg0vvPb4zT2",
      //         "name": "Juan Francisco",
      //         "lastName": "Perez",
      //         "email": "test@gmail.com",
      //         "documentTypeId": 6,
      //         "numberDocument": "123456789",
      //         "phone": "3017712323",
      //         "residenceAddress": "testDireccion",
      //         "serviceReceiptUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
      //         "siteUri": "http://test.site.url",
      //         "loginPhase": "inVerification",
      //         "disabled": false,
      //         "userMobile": false,
      //         "createdAt": "2023-08-09T10:50:30.000Z",
      //         "updatedAt": "2023-08-09T07:22:54.940Z",
      //         "deleteAt": null
      //     }
      // }
      const response0 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send(editUser0);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data.id).toBe(testUser0.id);
      // testUser0.id = response0.body.data.id;
      expect(response0.body.data).toHaveProperty("loginPhase");
      expect(response0.body.data.loginPhase).toBe("inVerification");
      expect(response0.body.data).toHaveProperty("disabled");
      expect(response0.body.data.disabled).toBe(false);
    });

    test("should fail with status 404 and an error with a message if the data cannot be saved - loginPhase != baseLogin", async () => {
      // ---------------------------------------------------------------
      // {
      //     "status": 404,
      //     "code": "Not Found",
      //     "detail": "The user with clientId={clientId} and loginPhase=\"baseLogin\" does not exist"
      // }
      const response0 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send(editUser0);
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      // {
      //     "status": 401,
      //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
      //     "code": "Unauthorized"
      // }
      const response0 = await request(usedHost).post("/account/full_login");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /account/info", () => {
    test("should respond with status 200 and one document_type object created.", async () => {
      // -----------------------------------------------------
      // {
      //     "meta": null,
      //     "data": {
      //         "id": 10,
      //         "clientId": "rlvMzYND8YMy6EZRdGg0vvPb4zT2",
      //         "name": "Juan Francisco",
      //         "lastName": "Perez",
      //         "email": "test@gmail.com",
      //         "documentTypeId": 6,
      //         "numberDocument": "123456789",
      //         "phone": "3017712323",
      //         "residenceAddress": "testDireccion",
      //         "serviceReceiptUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
      //         "siteUri": "http://test.site.url",
      //         "loginPhase": "inVerification",
      //         "disabled": false,
      //         "userMobile": false,
      //         "createdAt": "2023-08-09T10:50:30.000Z",
      //         "updatedAt": "2023-08-09T12:22:54.940Z",
      //         "deleteAt": null
      //     }
      // }
      const response0 = await request(usedHost)
        .get("/account/info")
        .set(requestHeaders);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(expect.objectContaining(testUser0));
    });

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get("/account/info");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /account/login/phase", () => {
    test("should respond with status 200 and a data object with the attribute of loginPhase.", async () => {
      // -----------------------------------------------------
      // {
      //     "meta": null,
      //     "data": {
      //         "loginPhase": "inVerification"
      //     }
      // }
      const response0 = await request(usedHost)
        .get("/account/login/phase")
        .set(requestHeaders);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("loginPhase");
      expect(response0.body.data.loginPhase).toBe("inVerification");
    });

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get("/account/login/phase");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });
  // ! Pending:  "/account/edit" endpoint ... is executed when users.loginPhase=fullLogin
  // TODO: End /account/info

  // TODO: Start /
  // ! Aqui quede - Falta la prueba de full_login, para verificar el usuario
  // ! Aqui quede - Despues de ello, realizar la prueba de /account/edit
  // ! Aqui quede - Despues terminar con las pruebas de /delete, dado que "/" ya esta
  // describe("GET /full_login ", () => {
  //   test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
  //     // 1. ------------------------------------------------
  //     // {
  //     //     "status": 400,
  //     //     "detail": "\"number\" must be a number",
  //     //     "code": "Bad Request"
  //     // }
  //     const response0 = await request(usedHost)
  //       .get("/full_login")
  //       .set(requestHeaders)
  //       .query(testFullLogin);
  //     expect(response0.statusCode).toBe(400);
  //     expect(response0.body).not.toHaveProperty("meta");
  //     expect(response0.body).not.toHaveProperty("data");
  //     expect(response0.body).toHaveProperty("status", 400);
  //     expect(response0.body).toHaveProperty("code");
  //     expect(response0.body).toHaveProperty("detail");

  //     // 2. ------------------------------------------------
  //     // {
  //     //     "status": 400,
  //     //     "detail": "\"number\" must be a number",
  //     //     "code": "Bad Request"
  //     // }
  //     const response1 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: {} });
  //     expect(response1.statusCode).toBe(400);
  //     expect(response1.body).not.toHaveProperty("meta");
  //     expect(response1.body).not.toHaveProperty("data");
  //     expect(response1.body).toHaveProperty("status", 400);
  //     expect(response1.body).toHaveProperty("code");
  //     expect(response1.body).toHaveProperty("detail");

  //     // 3. ------------------------------------------------
  //     // {
  //     //     "status": 400,
  //     //     "detail": "\"size\" must be a number",
  //     //     "code": "Bad Request"
  //     // }
  //     const response2 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: { number: 1 } });
  //     expect(response2.statusCode).toBe(400);
  //     expect(response2.body).not.toHaveProperty("data");
  //     expect(response2.body).toHaveProperty("status", 400);
  //     expect(response2.body).toHaveProperty("code");
  //     expect(response2.body).toHaveProperty("detail");

  //     // 4. ------------------------------------------------
  //     // {
  //     //     "status": 400,
  //     //     "detail": "\"size\" must be a number",
  //     //     "code": "Bad Request"
  //     // }
  //     const response3 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: { size: 1 } });
  //     expect(response3.statusCode).toBe(400);
  //     expect(response3.body).not.toHaveProperty("meta");
  //     expect(response3.body).not.toHaveProperty("data");
  //     expect(response3.body).toHaveProperty("status", 400);
  //     expect(response3.body).toHaveProperty("code");
  //     expect(response3.body).toHaveProperty("detail");

  //     // 5. ------------------------------------------------
  //     // {
  //     //     "status": 400,
  //     //     "detail": "\"number\" must be greater than 0",
  //     //     "code": "Bad Request"
  //     // }
  //     const response4 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: { number: 0, size: 1 } });
  //     expect(response4.statusCode).toBe(400);
  //     expect(response4.body).not.toHaveProperty("meta");
  //     expect(response4.body).not.toHaveProperty("data");
  //     expect(response4.body).toHaveProperty("status", 400);
  //     expect(response4.body).toHaveProperty("code");
  //     expect(response4.body).toHaveProperty("detail");

  //     // 6. ------------------------------------------------
  //     // {
  //     //     "status": 400,
  //     //     "detail": "\"size\" must be greater than 0",
  //     //     "code": "Bad Request"
  //     // }
  //     const response5 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: { number: 1, size: 0 } });
  //     expect(response5.statusCode).toBe(400);
  //     expect(response5.body).not.toHaveProperty("meta");
  //     expect(response5.body).not.toHaveProperty("data");
  //     expect(response5.body).toHaveProperty("status", 400);
  //     expect(response5.body).toHaveProperty("code");
  //     expect(response5.body).toHaveProperty("detail");

  //     // 7. ------------------------------------------------
  //     // {
  //     //     "status": 400,
  //     //     "detail": "\"number\" must be a number",
  //     //     "code": "Bad Request"
  //     // }
  //     const response6 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: { number: "A", size: 2 } });
  //     expect(response6.statusCode).toBe(400);
  //     expect(response6.body).not.toHaveProperty("meta");
  //     expect(response6.body).not.toHaveProperty("data");
  //     expect(response6.body).toHaveProperty("status", 400);
  //     expect(response6.body).toHaveProperty("code");
  //     expect(response6.body).toHaveProperty("detail");

  //     // 8. ------------------------------------------------
  //     // {
  //     //     "status": 400,
  //     //     "detail": "\"size\" must be a number",
  //     //     "code": "Bad Request"
  //     // }
  //     const response7 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: { number: 2, size: "B" } });
  //     expect(response7.statusCode).toBe(400);
  //     expect(response7.body).not.toHaveProperty("meta");
  //     expect(response7.body).not.toHaveProperty("data");
  //     expect(response7.body).toHaveProperty("status", 400);
  //     expect(response7.body).toHaveProperty("code");
  //     expect(response7.body).toHaveProperty("detail");

  //     // 9. ------------------------------------------------
  //     // {
  //     //     "status": 400,
  //     //     "detail": "\"page.number\" is too large for the number of possible pages",
  //     //     "code": "Bad Request"
  //     // }
  //     const response8 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: { number: 10, size: 99 } });
  //     expect(response8.statusCode).toBe(400);
  //     expect(response8.body).not.toHaveProperty("meta");
  //     expect(response8.body).not.toHaveProperty("data");
  //     expect(response8.body).toHaveProperty("status", 400);
  //     expect(response8.body).toHaveProperty("code");
  //     expect(response8.body).toHaveProperty("detail");
  //   });

  //   test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
  //     // {
  //     //     "meta": {
  //     //         "page": 1,
  //     //         "pageSize": 2,
  //     //         "totalRecords": 6,
  //     //         "totalPages": 3
  //     //     },
  //     //     "data": [
  //     //         {
  //     //             "id": 19,
  //     //             "clientId": "rlvMzYND8YMy6EZRdGg0vvPb4zT2",
  //     //             "name": "Juan Francisco",
  //     //             "lastName": "Perez",
  //     //             "email": "test@gmail.com",
  //     //             "documentTypeId": 6,
  //     //             "numberDocument": "123456789",
  //     //             "phone": "1111111111",
  //     //             "residenceAddress": "testDireccion",
  //     //             "serviceReceiptUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
  //     //             "siteUri": "http://test.site.url",
  //     //             "loginPhase": "inVerification",
  //     //             "disabled": false,
  //     //             "userMobile": false,
  //     //             "createdAt": "2023-08-09T13:34:30.000Z",
  //     //             "updatedAt": "2023-08-09T13:34:41.058Z",
  //     //             "deleteAt": null
  //     //         },
  //     //         {
  //     //             "id": 8,
  //     //             "clientId": "eeeee",
  //     //             "name": "eeee",
  //     //             "lastName": "eeee",
  //     //             "email": "eeeee@gmail.com",
  //     //             "documentTypeId": null,
  //     //             "numberDocument": null,
  //     //             "phone": "123123",
  //     //             "residenceAddress": null,
  //     //             "serviceReceiptUri": null,
  //     //             "siteUri": null,
  //     //             "loginPhase": "baseLogin",
  //     //             "disabled": false,
  //     //             "userMobile": true,
  //     //             "createdAt": "2023-08-03T19:09:52.000Z",
  //     //             "updatedAt": null,
  //     //             "deleteAt": null
  //     //         }
  //     //     ]
  //     // }
  //     const response0 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: { number: 1, size: 2 } });
  //     expect(response0.statusCode).toBe(200);
  //     expect(response0.body).toHaveProperty("meta");
  //     expect(response0.body.meta.page).toBe(1);
  //     expect(response0.body.meta.pageSize).toBe(2);
  //     expect(response0.body).toHaveProperty("data");
  //     expect(response0.body.data).toEqual(expect.any(Array));
  //     // expect(response0.body.data.length).toBe(2);
  //     expect(response0.body.data[0]).toEqual(
  //       expect.objectContaining(testUser0)
  //     );
  //     // expect(response0.body.data[1]).toEqual(
  //     //   expect.objectContaining(testDocType0)
  //     // );
  //   });

  //   test("should fail with status 404 and an error with a message of users not found", async () => {
  //     // 1. ------------------------------------------------
  //     // {
  //     //     "status": 404,
  //     //     "detail": "There are no Users registered in the database",
  //     //     "code": "Not Found"
  //     // }
  //     const response0 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: { number: 1, size: 2 } });
  //     expect(response0.statusCode).toBe(404);
  //     expect(response0.body).not.toHaveProperty("meta");
  //     expect(response0.body).not.toHaveProperty("data");
  //     expect(response0.body).toHaveProperty("status", 404);
  //     expect(response0.body).toHaveProperty("code");
  //     expect(response0.body).toHaveProperty("detail");
  //   });

  //   // {
  //   //     "status": 401,
  //   //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
  //   //     "code": "Unauthorized"
  //   // }
  //   test("should fail with error 401 and a message if Authorization header is not set.", async () => {
  //     const response0 = await request(usedHost).get("/");
  //     expect(response0.statusCode).toBe(401);
  //     expect(response0.body).not.toHaveProperty("meta");
  //     expect(response0.body).not.toHaveProperty("data");
  //     expect(response0.body).toHaveProperty("status", 401);
  //     expect(response0.body).toHaveProperty("code");
  //     expect(response0.body).toHaveProperty("detail");
  //   });
  // });

  describe("GET / ", () => {
    test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
      // {
      //     "meta": {
      //         "page": 1,
      //         "pageSize": 2,
      //         "totalRecords": 6,
      //         "totalPages": 3
      //     },
      //     "data": [
      //         {
      //             "id": 19,
      //             "clientId": "rlvMzYND8YMy6EZRdGg0vvPb4zT2",
      //             "name": "Juan Francisco",
      //             "lastName": "Perez",
      //             "email": "test@gmail.com",
      //             "documentTypeId": 6,
      //             "numberDocument": "123456789",
      //             "phone": "1111111111",
      //             "residenceAddress": "testDireccion",
      //             "serviceReceiptUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
      //             "siteUri": "http://test.site.url",
      //             "loginPhase": "inVerification",
      //             "disabled": false,
      //             "userMobile": false,
      //             "createdAt": "2023-08-09T13:34:30.000Z",
      //             "updatedAt": "2023-08-09T13:34:41.058Z",
      //             "deleteAt": null
      //         },
      //         {
      //             "id": 8,
      //             "clientId": "eeeee",
      //             "name": "eeee",
      //             "lastName": "eeee",
      //             "email": "eeeee@gmail.com",
      //             "documentTypeId": null,
      //             "numberDocument": null,
      //             "phone": "123123",
      //             "residenceAddress": null,
      //             "serviceReceiptUri": null,
      //             "siteUri": null,
      //             "loginPhase": "baseLogin",
      //             "disabled": false,
      //             "userMobile": true,
      //             "createdAt": "2023-08-03T19:09:52.000Z",
      //             "updatedAt": null,
      //             "deleteAt": null
      //         }
      //     ]
      // }
      const response0 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 2 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta.page).toBe(1);
      expect(response0.body.meta.pageSize).toBe(2);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(expect.any(Array));
      // expect(response0.body.data.length).toBe(2);
      expect(response0.body.data[0]).toEqual(
        expect.objectContaining(testUser0)
      );
      // expect(response0.body.data[1]).toEqual(
      //   expect.objectContaining(testDocType0)
      // );
    });

    test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
      // 1. ------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"number\" must be a number",
      //     "code": "Bad Request"
      // }
      const response0 = await request(usedHost).get("/").set(requestHeaders);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // 2. ------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"number\" must be a number",
      //     "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: {} });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      // 3. ------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"size\" must be a number",
      //     "code": "Bad Request"
      // }
      const response2 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 1 } });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 4. ------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"size\" must be a number",
      //     "code": "Bad Request"
      // }
      const response3 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { size: 1 } });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 5. ------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"number\" must be greater than 0",
      //     "code": "Bad Request"
      // }
      const response4 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 0, size: 1 } });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      // 6. ------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"size\" must be greater than 0",
      //     "code": "Bad Request"
      // }
      const response5 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 0 } });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // 7. ------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"number\" must be a number",
      //     "code": "Bad Request"
      // }
      const response6 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: "A", size: 2 } });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // 8. ------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"size\" must be a number",
      //     "code": "Bad Request"
      // }
      const response7 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 2, size: "B" } });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");

      // 9. ------------------------------------------------
      // {
      //     "status": 400,
      //     "detail": "\"page.number\" is too large for the number of possible pages",
      //     "code": "Bad Request"
      // }
      const response8 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 10, size: 99 } });
      expect(response8.statusCode).toBe(400);
      expect(response8.body).not.toHaveProperty("meta");
      expect(response8.body).not.toHaveProperty("data");
      expect(response8.body).toHaveProperty("status", 400);
      expect(response8.body).toHaveProperty("code");
      expect(response8.body).toHaveProperty("detail");
    });

    test("should fail with status 404 and an error with a message of users not found", async () => {
      // 1. ------------------------------------------------
      // {
      //     "status": 404,
      //     "detail": "There are no Users registered in the database",
      //     "code": "Not Found"
      // }
      const response0 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 2 } });
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
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
  // TODO: End /
});
