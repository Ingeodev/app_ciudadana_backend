const request = require("supertest");

// Deployed
// const usedHost = `${global.usersMicroserviceOnlineHost}/api/web/v1/users`;
// Local
const usedHostWeb = `${global.usersMicroserviceLocalHost}/api/web/v1/users`;
const usedHost = `${global.usersMicroserviceLocalHost}/api/mobile/v1/users`;
describe("Mobile - Users management API points: ", () => {
  jest.setTimeout(25000);

  const requestHeaders = {
    Authorization: "Bearer "
  };

  const testUser0 = {
    name: "Juan Francisco",
    lastName: "Perez",
    phone: "1111111111",
    email: "testMobile@gmail.com",
  };

  const urlFile = "./__tests__/users/mobile/usersTest.jpg";
  const urlFileFail = "./__tests__/users/mobile/usersTest.docx";
  const editUser0 = {
    documentTypeId: "6",
    document: "6000354895",
    address: "testDireccion",
  };

  const clientId = "vxbi4615BbNSaP7bZwIDetvnwCd2";

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
      .send(global.firebaseTestMobileUserLogin);
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
      expect(response0.body).toHaveProperty("name");
      expect(response0.body).toHaveProperty("lastName");
      expect(response0.body).toHaveProperty("phone");
      expect(response0.body).toHaveProperty("email");
      expect(response0.body.email).toBe(testUser0.email);
      // testUser0.id = response0.body.data.id;
      // testUser0.clientId = response0.body.data.clientId;
    });

    test("should fail with status 500 and an error with a message if the data cannot be saved.", async () => {
      // 1. ---------------------------------------------------------------
      const response0 = await request(usedHost)
        .post("/account/info")
        .set(requestHeaders)
        .send(testUser0);
      expect(response0.statusCode).toBe(500);
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
        .set("Accept", "application/json")
        .field("info", JSON.stringify({
            ...editUser0,
            documentTypeId: undefined,
          }))
        .attach("file", urlFile);

      expect(response0.statusCode).toBe(400);
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // 2. ---------------------------------------------------------------
      const response1 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field(
          "info",
          JSON.stringify({
            ...editUser0,
            documentTypeId: "        ",
          }))
        .attach("file", urlFile);

      expect(response1.statusCode).toBe(400);
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      // 3. ---------------------------------------------------------------
      const response2 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field(
          "info",
          JSON.stringify({
            ...editUser0,
            documentTypeId: -5,
          }))
        .attach("file", urlFile);

      expect(response2.statusCode).toBe(400);
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 4. ---------------------------------------------------------------
      const response3 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field(
          "info",
          JSON.stringify({
            ...editUser0,
            documentTypeId: null,
          }))
        .attach("file", urlFile);

      expect(response3.statusCode).toBe(400);
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 5. ---------------------------------------------------------------
      const response4 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field(
          "info",
          JSON.stringify({
            ...editUser0,
            documentTypeId: undefined,
          }))
        .attach("file", urlFile);

      expect(response4.statusCode).toBe(400);
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      // 6. ---------------------------------------------------------------
      const response5 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field("info",
          JSON.stringify({
            ...editUser0,
            document: "           ",
          }))
        .attach("file", urlFile);

      expect(response5.statusCode).toBe(400);
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // 7. ---------------------------------------------------------------
      const response6 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field("info",
          JSON.stringify({
            ...editUser0,
            document: -5,
          }))
        .attach("file", urlFile);

      expect(response6.statusCode).toBe(400);
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // 8. ---------------------------------------------------------------
      const response7 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field(
          "info",
          JSON.stringify({
            ...editUser0,
            document: null,
          }))
        .attach("file", urlFile);

      expect(response7.statusCode).toBe(400);
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");

      // 71. ---------------------------------------------------------------
      const response71 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field(
          "info",
          JSON.stringify({
            ...editUser0,
            document: undefined,
          }))
        .attach("file", urlFile);

      expect(response71.statusCode).toBe(400);
      expect(response71.body).toHaveProperty("status", 400);
      expect(response71.body).toHaveProperty("code");
      expect(response71.body).toHaveProperty("detail");

      // 9. ---------------------------------------------------------------
      const response8 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field("info", JSON.stringify({
            ...editUser0,
            address: undefined,
          }))
        .attach("file", urlFile);

      expect(response8.statusCode).toBe(400);
      expect(response8.body).toHaveProperty("status", 400);
      expect(response8.body).toHaveProperty("code");
      expect(response8.body).toHaveProperty("detail");

      // 10. ---------------------------------------------------------------
      const response9 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field(
          "info",
          JSON.stringify({
            ...editUser0,
            address: "           ",
          }))
        .attach("file", urlFile);

      expect(response9.body).toHaveProperty("status", 400);
      expect(response9.body).toHaveProperty("code");
      expect(response9.body).toHaveProperty("detail");

      // 11. ---------------------------------------------------------------
      const response10 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field(
          "info",
          JSON.stringify({
            ...editUser0,
            address: -5,
          }))
        .attach("file", urlFile);

      expect(response10.statusCode).toBe(400);
      expect(response10.body).toHaveProperty("status", 400);
      expect(response10.body).toHaveProperty("code");
      expect(response10.body).toHaveProperty("detail");

      // 12. ---------------------------------------------------------------
      const response11 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field(
          "info",
          JSON.stringify({
            ...editUser0,
            address: null,
          }))
        .attach("file", urlFile);

      expect(response11.statusCode).toBe(400);
      expect(response11.body).toHaveProperty("status", 400);
      expect(response11.body).toHaveProperty("code");
      expect(response11.body).toHaveProperty("detail");

      // 13. ---------------------------------------------------------------
      const response12 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field("info", JSON.stringify(editUser0))
        .attach("file", urlFileFail);

      expect(response12.statusCode).toBe(400);
      expect(response12.body).toHaveProperty("status", 400);
      expect(response12.body).toHaveProperty("code");
      expect(response12.body).toHaveProperty("detail");
    });

    test("DISABLED - should fail with status 500 and an error with a message if the data cannot be saved - documentTypeId = 999.", async () => {
      // ---------------------------------------------------------------
      // const response0 = await request(usedHost)
      //   .post("/account/full_login")
      //   .set(requestHeaders)
      //   .set("Accept", "application/json")
      //   .field( "info", JSON.stringify({
      //       ...editUser0,
      //       documentTypeId: 999,
      //     })
      //   )
      //   .attach("file", urlFile);

      // expect(response0.statusCode).toBe(500);
      // expect(response0.body).toHaveProperty("status", 500);
      // expect(response0.body).toHaveProperty("code");
      // expect(response0.body).toHaveProperty("detail");
    });

    test("should respond with status 200 and the updated object (data).", async () => {
      const response0 = await request(usedHost)
        .post("/account/full_login")
        .set(requestHeaders)
        .set("Accept", "application/json")
        .field("info", JSON.stringify(editUser0))
        .attach("file", urlFile);
      
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("documentTypeId");
      // expect(response0.body.documentTypeId).toBe(editUser0.documentTypeId);
      expect(response0.body).toHaveProperty("document");
      expect(response0.body.document).toBe(editUser0.document);
      expect(response0.body).toHaveProperty("address");
      expect(response0.body.address).toBe(editUser0.address);
      expect(response0.body).toHaveProperty("file");
      // testUser0.id = response0.body.data.id;
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
        .set("Accept", "application/json")
        .field("info", JSON.stringify(editUser0))
        .attach("file", urlFile);

      expect(response0.statusCode).toBe(404);
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
      expect(response0.body).toHaveProperty("loginPhase");
      expect(response0.body).toHaveProperty("userInfo");
    });

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get("/account/info");
      expect(response0.statusCode).toBe(401);
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
      expect(response0.body).toHaveProperty("loginPhase");
      // expect(response0.body.loginPhase).toBe("inVerification");
    });

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get("/account/login/phase");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("WebUsers - Verify user - POST /full_login ", () => {
    test("should respond with status 200 and the object updated (data).", async () => {
      const response0 = await request(usedHostWeb)
        .post("/full_login")
        .set(requestHeaders)
        .send({ clientId: clientId });

      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      // expect(response0.body.data.id).toBe(testUser0.id);
      // testUser0.id = response0.body.data.id;
      expect(response0.body.data).toHaveProperty("loginPhase");
      expect(response0.body.data.loginPhase).toBe("fullLogin");
      expect(response0.body.data).toHaveProperty("disabled");
      expect(response0.body.data.disabled).toBe(false);
      expect(response0.body.data).toHaveProperty("userMobile");
      expect(response0.body.data.userMobile).toBe(true);
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
      expect(response0.body).toHaveProperty("name");
      expect(response0.body.name).toBe(editUser0FullLogin.name);
      expect(response0.body).toHaveProperty("lastName");
      expect(response0.body.lastName).toBe(editUser0FullLogin.lastName);
      expect(response0.body).toHaveProperty("phone");
      expect(response0.body.phone).toBe(editUser0FullLogin.phone);
      expect(response0.body).toHaveProperty("address");
      expect(response0.body.address).toBe(editUser0FullLogin.address);
    });

    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      // {
      //     "status": 401,
      //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
      //     "code": "Unauthorized"
      // }
      const response0 = await request(usedHost).post("/account/edit");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

});
