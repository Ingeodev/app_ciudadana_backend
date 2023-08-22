const request = require("supertest");

// Deployed
// const usedHost = `${global.usersMicroserviceOnlineHost}/api/web/v1/users`;
// Local
const usedHost = `${global.adminsMicroserviceLocalHost}/api/web/v1/admin`;
describe("Web - Users management API points: ", () => {
  jest.setTimeout(25000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const testUser0 = {
    name: "Andres",
    lastName: "Garzon",
    email: "andres_sgj144@unicauca.edu.co",
    // ! Pendiendte: Fk DocumentType desactivada temporalmente
    documentTypeId: "6",
    document: "1061777888",
  };

  const addRole = {
    roleId: "1"
  };

  const editUser0 = {
    name: "Andres",
    lastName: "Garzon",
    email: "andres_sgj144@unicauca.edu.co",
    // ! Pendiendte: Fk DocumentType desactivada temporalmente
    documentTypeId: "6",
    document: "1061777888",
  };

  const editUser0FullLogin = {
    name: "Juan Francisco",
    lastName: "Perez",
    phone: "3123334455",
    address: "direccionActualizada",
  };

  beforeAll(async () => {
    const firebaseAuth = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestWebUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken; // console.log(requestHeaders);
  });

  describe("POST /admin/", () => {
    test("should fail with status 400 and an error with a message if the entry is not well formated.", async () => {
      // 1. ---------------------------------------------------------------
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testUser0,
          name: "           ",
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // 2. ---------------------------------------------------------------
      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testUser0,
          name: -5,
        });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      // 3. ---------------------------------------------------------------
      const response2 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testUser0,
          lastName: "         ",
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 4. ---------------------------------------------------------------
      const response3 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testUser0,
          lastName: -5,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 5. ---------------------------------------------------------------
      const response4 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testUser0,
          email: "     ",
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      // 6. ---------------------------------------------------------------
      const response5 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testUser0,
          email: "is not email",
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // 7. ---------------------------------------------------------------
      const response6 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testUser0,
          documentTypeId: "     ",
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // 8.---------------------------------------------------------------
      const response7 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testUser0,
          documentTypeId: -5,
        });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");

      // 9. ---------------------------------------------------------------
      const response8 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testUser0,
          document: "     ",
        });
      expect(response8.statusCode).toBe(400);
      expect(response8.body).not.toHaveProperty("meta");
      expect(response8.body).not.toHaveProperty("data");
      expect(response8.body).toHaveProperty("status", 400);
      expect(response8.body).toHaveProperty("code");
      expect(response8.body).toHaveProperty("detail");

      // 10.---------------------------------------------------------------
      const response9 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testUser0,
          document: -5,
        });
      expect(response9.statusCode).toBe(400);
      expect(response9.body).not.toHaveProperty("meta");
      expect(response9.body).not.toHaveProperty("data");
      expect(response9.body).toHaveProperty("status", 400);
      expect(response9.body).toHaveProperty("code");
      expect(response9.body).toHaveProperty("detail");
    });

    test("should respond with status 201 and the new object (data) after creating a new admin web.", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testUser0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      testUser0.id = response0.body.data.id;
      addRole.id = response0.body.data.id;
      editUser0.id = response0.body.data.id;
      expect(response0.body.data).toHaveProperty("userMobile");
      expect(response0.body.data.userMobile).toBe(false);
      expect(response0.body.data).toHaveProperty("disabled");
      expect(response0.body.data.disabled).toBe(false);
    });

    test("should fail with status 500 and an error with a message if the data cannot be saved.", async () => {
      // 1. ---------------------------------------------------------------
      const response0 = await request(usedHost)
        .post("/")
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
      const response0 = await request(usedHost).post("/");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("DISABLED - Fk roleId not set - POST /admin/add_role ", () => {
    // test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
    //   // 1. ---------------------------------------------------------------
    //   const response0 = await request(usedHost)
    //     .post("/add_role")
    //     .set(requestHeaders)
    //     .send({
    //       ...addRole,
    //       id: -5,
    //     });
    //   expect(response0.statusCode).toBe(400);
    //   expect(response0.body).not.toHaveProperty("meta");
    //   expect(response0.body).not.toHaveProperty("data");
    //   expect(response0.body).toHaveProperty("status", 400);
    //   expect(response0.body).toHaveProperty("code");
    //   expect(response0.body).toHaveProperty("detail");

    //   // 2. ---------------------------------------------------------------
    //   const response1 = await request(usedHost)
    //     .post("/add_role")
    //     .set(requestHeaders)
    //     .send({
    //       ...addRole,
    //       id: "        ",
    //     });
    //   expect(response1.statusCode).toBe(400);
    //   expect(response1.body).not.toHaveProperty("meta");
    //   expect(response1.body).not.toHaveProperty("data");
    //   expect(response1.body).toHaveProperty("status", 400);
    //   expect(response1.body).toHaveProperty("code");
    //   expect(response1.body).toHaveProperty("detail");

    //   // 3. ---------------------------------------------------------------
    //   const response2 = await request(usedHost)
    //     .post("/add_role")
    //     .set(requestHeaders)
    //     .send({
    //       ...addRole,
    //       id: "is not number",
    //     });
    //   expect(response2.statusCode).toBe(400);
    //   expect(response2.body).not.toHaveProperty("meta");
    //   expect(response2.body).not.toHaveProperty("data");
    //   expect(response2.body).toHaveProperty("status", 400);
    //   expect(response2.body).toHaveProperty("code");
    //   expect(response2.body).toHaveProperty("detail");

    //   // 4. ---------------------------------------------------------------
    //   const response3 = await request(usedHost)
    //     .post("/add_role")
    //     .set(requestHeaders)
    //     .send({
    //       ...addRole,
    //       roleId: -5,
    //     });
    //   expect(response3.statusCode).toBe(400);
    //   expect(response3.body).not.toHaveProperty("meta");
    //   expect(response3.body).not.toHaveProperty("data");
    //   expect(response3.body).toHaveProperty("status", 400);
    //   expect(response3.body).toHaveProperty("code");
    //   expect(response3.body).toHaveProperty("detail");

    //   // 5. ---------------------------------------------------------------
    //   const response4 = await request(usedHost)
    //     .post("/add_role")
    //     .set(requestHeaders)
    //     .send({
    //       ...addRole,
    //       roleId: "      ",
    //     });
    //   expect(response4.statusCode).toBe(400);
    //   expect(response4.body).not.toHaveProperty("meta");
    //   expect(response4.body).not.toHaveProperty("data");
    //   expect(response4.body).toHaveProperty("status", 400);
    //   expect(response4.body).toHaveProperty("code");
    //   expect(response4.body).toHaveProperty("detail");

    //   // 6. ---------------------------------------------------------------
    //   const response5 = await request(usedHost)
    //     .post("/add_role")
    //     .set(requestHeaders)
    //     .send({
    //       ...addRole,
    //       roleId: "is not number",
    //     });
    //   expect(response5.statusCode).toBe(400);
    //   expect(response5.body).not.toHaveProperty("meta");
    //   expect(response5.body).not.toHaveProperty("data");
    //   expect(response5.body).toHaveProperty("status", 400);
    //   expect(response5.body).toHaveProperty("code");
    //   expect(response5.body).toHaveProperty("detail");
    // });

    // test("should fail with status 500 and an error with a message if the data cannot be saved - roleId=999.", async () => {
    //   // ---------------------------------------------------------------
    //   const response0 = await request(usedHost)
    //     .post("/add_role")
    //     .set(requestHeaders)
    //     .send({
    //       ...addRole,
    //       roleId: 999,
    //     });
    //   expect(response0.statusCode).toBe(500);
    //   expect(response0.body).not.toHaveProperty("meta");
    //   expect(response0.body).not.toHaveProperty("data");
    //   expect(response0.body).toHaveProperty("status", 500);
    //   expect(response0.body).toHaveProperty("code");
    //   expect(response0.body).toHaveProperty("detail");
    // });

    // test("should respond with status 200 and the updated object (data).", async () => {
    //   const response0 = await request(usedHost)
    //     .post("/add_role")
    //     .set(requestHeaders)
    //     .send(addRole);
    //   expect(response0.statusCode).toBe(200);
    //   expect(response0.body).toHaveProperty("meta");
    //   expect(response0.body.meta).toBe(null);
    //   expect(response0.body).toHaveProperty("data");
    //   expect(response0.body.data).toHaveProperty("id");
    //   expect(response0.body.data.id).toBe(testUser0.id);
    //   // testUser0.id = response0.body.data.id;
    //   expect(response0.body.data).toHaveProperty("loginPhase");
    //   expect(response0.body.data.loginPhase).toBe("inVerification");
    //   expect(response0.body.data).toHaveProperty("disabled");
    //   expect(response0.body.data.disabled).toBe(false);
    // });

    // test("should fail with status 404 and an error with a message if the data cannot be saved - id=999.", async () => {
    //   // ---------------------------------------------------------------
    //   // {
    //   //     "status": 404,
    //   //     "code": "Not Found",
    //   //     "detail": "The user with clientId={clientId} and loginPhase=\"baseLogin\" does not exist"
    //   // }
    //   const response0 = await request(usedHost)
    //     .post("/add_role")
    //     .set(requestHeaders)
    //     .send({
    //       ...addRole,
    //       id: 999,
    //     });
    //   expect(response0.statusCode).toBe(404);
    //   expect(response0.body).not.toHaveProperty("meta");
    //   expect(response0.body).not.toHaveProperty("data");
    //   expect(response0.body).toHaveProperty("status", 404);
    //   expect(response0.body).toHaveProperty("code");
    //   expect(response0.body).toHaveProperty("detail");
    // });

    // test("should fail with error 401 and a message if Authorization header is not set.", async () => {
    //   // {
    //   //     "status": 401,
    //   //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //   //     "code": "Unauthorized"
    //   // }
    //   const response0 = await request(usedHost).post("/add_role");
    //   expect(response0.statusCode).toBe(401);
    //   expect(response0.body).not.toHaveProperty("meta");
    //   expect(response0.body).not.toHaveProperty("data");
    //   expect(response0.body).toHaveProperty("status", 401);
    //   expect(response0.body).toHaveProperty("code");
    //   expect(response0.body).toHaveProperty("detail");
    // });
  
  });
  
  describe("POST /admin/edit", () => {
    test("should fail with status 400 and an error with a message if the entry is not well formated.", async () => {
      // 1. ---------------------------------------------------------------
      const response01 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editUser0,
          id: "           ",
        });
      expect(response01.statusCode).toBe(400);
      expect(response01.body).not.toHaveProperty("meta");
      expect(response01.body).not.toHaveProperty("data");
      expect(response01.body).toHaveProperty("status", 400);
      expect(response01.body).toHaveProperty("code");
      expect(response01.body).toHaveProperty("detail");

      // 2. ---------------------------------------------------------------
      const response02 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editUser0,
          id: -5,
        });
      expect(response02.statusCode).toBe(400);
      expect(response02.body).not.toHaveProperty("meta");
      expect(response02.body).not.toHaveProperty("data");
      expect(response02.body).toHaveProperty("status", 400);
      expect(response02.body).toHaveProperty("code");
      expect(response02.body).toHaveProperty("detail");

      // 2. ---------------------------------------------------------------
      const response1 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editUser0,
          name: -5,
        });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      // 4. ---------------------------------------------------------------
      const response3 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editUser0,
          lastName: -5,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 6. ---------------------------------------------------------------
      const response5 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editUser0,
          email: "is not email",
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // ! Pendiente: Activar cuando la Fk documentType sea restablecida
      // // 7. ---------------------------------------------------------------
      // const response6 = await request(usedHost)
      //   .post("/edit")
      //   .set(requestHeaders)
      //   .send({
      //     ...editUser0,
      //     documentTypeId: "     ",
      //   });
      // expect(response6.statusCode).toBe(400);
      // expect(response6.body).not.toHaveProperty("meta");
      // expect(response6.body).not.toHaveProperty("data");
      // expect(response6.body).toHaveProperty("status", 400);
      // expect(response6.body).toHaveProperty("code");
      // expect(response6.body).toHaveProperty("detail");

      // 8.---------------------------------------------------------------
      const response7 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editUser0,
          documentTypeId: -5,
        });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");

      // 10.---------------------------------------------------------------
      const response9 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editUser0,
          document: -5,
        });
      expect(response9.statusCode).toBe(400);
      expect(response9.body).not.toHaveProperty("meta");
      expect(response9.body).not.toHaveProperty("data");
      expect(response9.body).toHaveProperty("status", 400);
      expect(response9.body).toHaveProperty("code");
      expect(response9.body).toHaveProperty("detail");
    });

    test("should respond with status 200 and the updated object (data).", async () => {
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send(editUser0);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data).toHaveProperty("userMobile");
      expect(response0.body.data.userMobile).toBe(false);
      expect(response0.body.data).toHaveProperty("disabled");
      expect(response0.body.data.disabled).toBe(false);
    });

    test("DISABLED - Fk documentTypeId not set - should fail with status 500 and an error with a message if the data cannot be updated.", async () => {
      // 1. ---------------------------------------------------------------
      // const response0 = await request(usedHost)
      //   .post("/edit")
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

    test("should fail with status 404 and an error with a message if the data cannot be updated - id=999.", async () => {
      // ---------------------------------------------------------------
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editUser0,
          id: 999,
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
      const response0 = await request(usedHost).post("/edit");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /admin/ ", () => {
    test("should respond with status 200 and a list of admin objects.", async () => {
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
      expect(response0.body.data.length).toBe(2);
      expect(response0.body.data[0]).toHaveProperty("id");
      expect(response0.body.data[0]).toHaveProperty("name");
      expect(response0.body.data[1]).toHaveProperty("id");
      expect(response0.body.data[1]).toHaveProperty("name");
    });

    test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
      const response0 = await request(usedHost).get("/").set(requestHeaders);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

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

      const response2 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 1 } });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

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
    });

    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get("/");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("DISABLED - Users table must not have any records. should fail with status 404 and an error with a message of admins not found.", async () => {
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

  describe("GET /admin/:id ", () => {
    test("should respond with status 200 and one admin object.", async () => {
      const response0 = await request(usedHost)
        .get(`/${testUser0.id}`)
        .set(requestHeaders);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data).toHaveProperty("name");
      expect(response0.body.data.name).toBe(testUser0.name);
    });

    test("should fail with status 400 and an error with a message id must be a number", async () => {
      const response0 = await request(usedHost)
        .get(`/ddd`)
        .set(requestHeaders);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get(`/${testUser0.id}`);
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("should fail with status 404 and an error with a message not found", async () => {
      const response0 = await request(usedHost)
        .get(`/999`)
        .set(requestHeaders);
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /admin/delete ", () => {
    test("should fail with status 400 and an error with a message if the entry is not well formated.", async () => {
      // ! Pendiente: Validar este caso y mejorar restricciones joi
      // 3. ---------------------------------------------------------------
      // const response2 = await request(usedHost)
      //   .post("/delete")
      //   .set(requestHeaders)
      //   .send({
      //     id: "          ",
      //   });
      // expect(response2.statusCode).toBe(400);
      // expect(response2.body).not.toHaveProperty("meta");
      // expect(response2.body).not.toHaveProperty("data");
      // expect(response2.body).toHaveProperty("status", 400);
      // expect(response2.body).toHaveProperty("code");
      // expect(response2.body).toHaveProperty("detail");

      // ! Pendiente: Validar este caso y mejorar restricciones joi
      // 7. ---------------------------------------------------------------
      // const response6 = await request(usedHost)
      //   .post("/delete")
      //   .set(requestHeaders)
      //   .send({
      //     id: null,
      //   });
      // expect(response6.statusCode).toBe(400);
      // expect(response6.body).not.toHaveProperty("meta");
      // expect(response6.body).not.toHaveProperty("data");
      // expect(response6.body).toHaveProperty("status", 400);
      // expect(response6.body).toHaveProperty("code");
      // expect(response6.body).toHaveProperty("detail");

      // 11. ---------------------------------------------------------------
      const response10 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: -5,
        });
      expect(response10.statusCode).toBe(400);
      expect(response10.body).not.toHaveProperty("meta");
      expect(response10.body).not.toHaveProperty("data");
      expect(response10.body).toHaveProperty("status", 400);
      expect(response10.body).toHaveProperty("code");
      expect(response10.body).toHaveProperty("detail");

      // 17. ---------------------------------------------------------------
      const response16 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: undefined,
        });
      expect(response16.statusCode).toBe(400);
      expect(response16.body).not.toHaveProperty("meta");
      expect(response16.body).not.toHaveProperty("data");
      expect(response16.body).toHaveProperty("status", 400);
      expect(response16.body).toHaveProperty("code");
      expect(response16.body).toHaveProperty("detail");
    });

    test("should respond with status 200 and the id of deleted admin.", async () => {
      const response0 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: testUser0.id,
        });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data.id).toBe(testUser0.id);
    });

    test("should fail with status 404 and an error with a message if the data cannot be deleted - id=999.", async () => {
      // ---------------------------------------------------------------
      const response0 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: 999,
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
      const response0 = await request(usedHost).post("/delete");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });
  
});
