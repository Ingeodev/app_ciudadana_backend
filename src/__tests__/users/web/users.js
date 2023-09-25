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
    email: "testWeb@gmail.com",
  };

  const editUser0 = {
    // ! Pendiendte: Fk DocumentType desactivada temporalmente
    documentTypeId: "6",
    document: "7659373893",
    address: "testDireccion",
    serviceReceiptUri:
      "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
  };

  const editUser0FullLogin = {
    name: "Juan Francisco",
    lastName: "Perez",
    phone: "3123334455",
    address: "direccionActualizada",
  };

  beforeAll(async () => {
    const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestWebUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken; // console.log(requestHeaders);
  });

  describe("POST /account/info", () => {
    test("should fail with status 400 and an error with a message if the entry is not well formated.", async () => {
      // 1. ---------------------------------------------------------------
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

      // 2. ---------------------------------------------------------------
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

      // 3. ---------------------------------------------------------------
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

      // 4. ---------------------------------------------------------------
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

      // 5. ---------------------------------------------------------------
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

      // 6. ---------------------------------------------------------------
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

      // 7. ---------------------------------------------------------------
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

      // 8.---------------------------------------------------------------
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

    test("should respond with status 201 and the new object (data) after creating a new user web.", async () => {
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
      testUser0.clientId = response0.body.data.clientId;
      expect(response0.body.data).toHaveProperty("userMobile");
      expect(response0.body.data.userMobile).toBe(false);
      expect(response0.body.data).toHaveProperty("disabled");
      expect(response0.body.data.disabled).toBe(false);
    });

    test("should fail with status 500 and an error with a message if the data cannot be saved.", async () => {
      // 1. ---------------------------------------------------------------
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
      const response4 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          document: undefined,
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      // 6. ---------------------------------------------------------------
      const response5 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          document: "        ",
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // 7. ---------------------------------------------------------------
      const response6 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          document: 0,
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // 8. ---------------------------------------------------------------
      const response7 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          document: null,
        });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");

      // 9. ---------------------------------------------------------------
      const response8 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          address: undefined,
        });
      expect(response8.statusCode).toBe(400);
      expect(response8.body).not.toHaveProperty("meta");
      expect(response8.body).not.toHaveProperty("data");
      expect(response8.body).toHaveProperty("status", 400);
      expect(response8.body).toHaveProperty("code");
      expect(response8.body).toHaveProperty("detail");

      // 10. ---------------------------------------------------------------
      const response9 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          address: "        ",
        });
      expect(response9.statusCode).toBe(400);
      expect(response9.body).not.toHaveProperty("meta");
      expect(response9.body).not.toHaveProperty("data");
      expect(response9.body).toHaveProperty("status", 400);
      expect(response9.body).toHaveProperty("code");
      expect(response9.body).toHaveProperty("detail");

      // 11. ---------------------------------------------------------------
      const response10 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          address: 0,
        });
      expect(response10.statusCode).toBe(400);
      expect(response10.body).not.toHaveProperty("meta");
      expect(response10.body).not.toHaveProperty("data");
      expect(response10.body).toHaveProperty("status", 400);
      expect(response10.body).toHaveProperty("code");
      expect(response10.body).toHaveProperty("detail");

      // 12. ---------------------------------------------------------------
      const response11 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          address: null,
        });
      expect(response11.statusCode).toBe(400);
      expect(response11.body).not.toHaveProperty("meta");
      expect(response11.body).not.toHaveProperty("data");
      expect(response11.body).toHaveProperty("status", 400);
      expect(response11.body).toHaveProperty("code");
      expect(response11.body).toHaveProperty("detail");

      // 13. ---------------------------------------------------------------
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
      const response15 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .send({
          ...editUser0,
          serviceReceiptUri: "is.not uri",
        });
      expect(response15.statusCode).toBe(400);
      expect(response15.body).not.toHaveProperty("meta");
      expect(response15.body).not.toHaveProperty("data");
      expect(response15.body).toHaveProperty("status", 400);
      expect(response15.body).toHaveProperty("code");
      expect(response15.body).toHaveProperty("detail");
    });

    test("DISABLED - Fk documentTypeId disabled. should fail with status 500 and an error with a message if the data cannot be saved - documentTypeId = 999.", async () => {
      // ---------------------------------------------------------------
      // const response0 = await request(usedHost)
      //   .post("/account/full_login")
      //   .set(requestHeaders)
      //   .send({
      //     ...editUser0,
      //     documentTypeId: 999,
      //   });
      // expect(response0.statusCode).toBe(500);
      // expect(response0.body).not.toHaveProperty("meta");
      // expect(response0.body).not.toHaveProperty("data");
      // expect(response0.body).toHaveProperty("status", 500);
      // expect(response0.body).toHaveProperty("code");
      // expect(response0.body).toHaveProperty("detail");
    });

    test("should respond with status 200 and the updated object (data).", async () => {
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

    test("should fail with status 404 and an error with a message if the data cannot be saved - loginPhase != baseLogin.", async () => {
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
    test("should respond with status 200 and user object.", async () => {
      // -----------------------------------------------------
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

  describe("POST /full_login ", () => {
    test("should fail with status 400 and an error with a message if the entry is not well formated.", async () => {
      // 2. ---------------------------------------------------------------

      const response1 = await request(usedHost)
        .post("/full_login")
        .set(requestHeaders)
        .send({
          clientId: "   ",
        });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      // 3. ---------------------------------------------------------------

      const response2 = await request(usedHost)
        .post("/full_login")
        .set(requestHeaders)
        .send({});
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 4. ---------------------------------------------------------------

      const response3 = await request(usedHost)
        .post("/full_login")
        .set(requestHeaders)
        .send({
          clientId: null,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 5. ---------------------------------------------------------------

      const response4 = await request(usedHost)
        .post("/full_login")
        .set(requestHeaders)
        .send({
          clientId: undefined,
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      // 6. ---------------------------------------------------------------
      const response5 = await request(usedHost)
        .post("/full_login")
        .set(requestHeaders)
        .send({
          clientId: -10,
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");
    });

    test("should respond with status 200 and the object updated (data).", async () => {
      const response0 = await request(usedHost)
        .post("/full_login")
        .set(requestHeaders)
        .send({
          clientId: testUser0.clientId,
        });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data.id).toBe(testUser0.id);
      // testUser0.id = response0.body.data.id;
      expect(response0.body.data).toHaveProperty("loginPhase");
      expect(response0.body.data.loginPhase).toBe("fullLogin");
      expect(response0.body.data).toHaveProperty("disabled");
      expect(response0.body.data.disabled).toBe(false);
      expect(response0.body.data).toHaveProperty("userMobile");
      expect(response0.body.data.userMobile).toBe(false);
    });

    test("should fail with status 404 and an error with a message if the data cannot be saved - loginPhase != baseLogin.", async () => {
      // ---------------------------------------------------------------
      // {
      //     "status": 404,
      //     "code": "Not Found",
      //     "detail": "The user with clientId={clientId} and loginPhase=\"baseLogin\" does not exist"
      // }
      const response0 = await request(usedHost)
        .post("/full_login")
        .set(requestHeaders)
        .send({
          clientId: "must be a clientId",
        });
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
      const response0 = await request(usedHost).post("/full_login");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /account/edit ", () => {
    test("should fail with status 400 and an error with a message if the entry is not well formated.", async () => {
      // 3. ---------------------------------------------------------------
      const response2 = await request(usedHost)
        .post("/account/edit")
        .set(requestHeaders)
        .send({
          ...editUser0FullLogin,
          name: -55,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 7. ---------------------------------------------------------------
      const response6 = await request(usedHost)
        .post("/account/edit")
        .set(requestHeaders)
        .send({
          ...editUser0FullLogin,
          phone: -55,
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // 11. ---------------------------------------------------------------
      const response10 = await request(usedHost)
        .post("/account/edit")
        .set(requestHeaders)
        .send({
          ...editUser0FullLogin,
          address: -55,
        });
      expect(response10.statusCode).toBe(400);
      expect(response10.body).not.toHaveProperty("meta");
      expect(response10.body).not.toHaveProperty("data");
      expect(response10.body).toHaveProperty("status", 400);
      expect(response10.body).toHaveProperty("code");
      expect(response10.body).toHaveProperty("detail");

      // 15. ---------------------------------------------------------------
      const response14 = await request(usedHost)
        .post("/account/edit")
        .set(requestHeaders)
        .send({
          ...editUser0FullLogin,
          lastName: -55,
        });
      expect(response14.statusCode).toBe(400);
      expect(response14.body).not.toHaveProperty("meta");
      expect(response14.body).not.toHaveProperty("data");
      expect(response14.body).toHaveProperty("status", 400);
      expect(response14.body).toHaveProperty("code");
      expect(response14.body).toHaveProperty("detail");
    });

    test("should respond with status 200 and the user object (data) after updating.", async () => {
      const response0 = await request(usedHost)
        .post("/account/edit")
        .set(requestHeaders)
        .send(editUser0FullLogin);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data.id).toBe(testUser0.id);
      expect(response0.body.data).toHaveProperty("loginPhase");
      expect(response0.body.data.loginPhase).toBe("fullLogin");
      expect(response0.body.data).toHaveProperty("disabled");
      expect(response0.body.data.disabled).toBe(false);
    });

    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      // {
      //     "status": 401,
      //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
      //     "code": "Unauthorized"
      // }
      const response0 = await request(usedHost).post("/account/edit");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET / ", () => {
    test("should respond with status 200 and a list of user objects containing.", async () => {
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
      expect(response0.body.data[0]).toHaveProperty("name");
      expect(response0.body.data[0].name).toBe("Juan Francisco");
      expect(response0.body.data[0]).toHaveProperty("lastName");
      expect(response0.body.data[0].lastName).toBe("Perez");
      expect(response0.body.data[0]).toHaveProperty("phone");
      expect(response0.body.data[0].phone).toBe("3123334455");
      expect(response0.body.data[0]).toHaveProperty("address");
      expect(response0.body.data[0].address).toBe("direccionActualizada");
    });

    test("should fail with status 400 and an error with a message if pagination is not provided.", async () => {
      // 1. ------------------------------------------------
      const response0 = await request(usedHost).get("/").set(requestHeaders);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // 2. ------------------------------------------------
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

    test("DISABLED - Users table must not have any records. should fail with status 404 and an error with a message of users not found.", async () => {
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

  describe("POST /status ", () => {
    test("should fail with status 400 and an error with a message if the entry is not well formated.", async () => {
      // 3. ---------------------------------------------------------------
      const response2 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          clientId: "          ",
          disabled: true,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 7. ---------------------------------------------------------------
      const response6 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          clientId: null,
          disabled: true,
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // 11. ---------------------------------------------------------------
      const response10 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          clientId: -5,
          disabled: true,
        });
      expect(response10.statusCode).toBe(400);
      expect(response10.body).not.toHaveProperty("meta");
      expect(response10.body).not.toHaveProperty("data");
      expect(response10.body).toHaveProperty("status", 400);
      expect(response10.body).toHaveProperty("code");
      expect(response10.body).toHaveProperty("detail");

      // 15. ---------------------------------------------------------------
      const response14 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          clientId: testUser0.clientId,
          disabled: "must be a boolean",
        });
      expect(response14.statusCode).toBe(400);
      expect(response14.body).not.toHaveProperty("meta");
      expect(response14.body).not.toHaveProperty("data");
      expect(response14.body).toHaveProperty("status", 400);
      expect(response14.body).toHaveProperty("code");
      expect(response14.body).toHaveProperty("detail");

      // 16. ---------------------------------------------------------------
      const response15 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          clientId: testUser0.clientId,
          disabled: -5,
        });
      expect(response15.statusCode).toBe(400);
      expect(response15.body).not.toHaveProperty("meta");
      expect(response15.body).not.toHaveProperty("data");
      expect(response15.body).toHaveProperty("status", 400);
      expect(response15.body).toHaveProperty("code");
      expect(response15.body).toHaveProperty("detail");

      // 17. ---------------------------------------------------------------
      const response16 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          clientId: testUser0.clientId,
          disabled: undefined,
        });
      expect(response16.statusCode).toBe(400);
      expect(response16.body).not.toHaveProperty("meta");
      expect(response16.body).not.toHaveProperty("data");
      expect(response16.body).toHaveProperty("status", 400);
      expect(response16.body).toHaveProperty("code");
      expect(response16.body).toHaveProperty("detail");
    });

    test("should respond with status 200 and the updated object (data) after updating the disabled field.", async () => {
      const response0 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          clientId: testUser0.clientId,
          disabled: true,
        });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data.id).toBe(testUser0.id);
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data.disabled).toBe(true);
    });

    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      // {
      //     "status": 401,
      //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
      //     "code": "Unauthorized"
      // }
      const response0 = await request(usedHost).post("/status");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

});
