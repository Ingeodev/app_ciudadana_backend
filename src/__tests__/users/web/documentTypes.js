const request = require("supertest");

// Deployed
// const usedHost = `${global.usersMicroserviceOnlineHost}/api/web/v1/users/document_types`;
// Local
const usedHost = `${global.usersMicroserviceLocalHost}/api/web/v1/users/document_types`;
describe("Web - Document Type management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const testDocType0 = {
    code: 22,
    name: "Cedula de extranjeria",
    abbreviation: "CE",
  };

  const testDocType1 = {
    code: 41,
    name: "Pasaporte",
    abbreviation: "PA",
  };

  const editDocType0 = {
    code: 22,
    name: "Cedula de extranjeria - Test",
    abbreviation: "CE",
  };

  const editDocType1 = {
    code: 41,
    name: "Pasaporte - Test",
    abbreviation: "PA",
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

  describe("POST /document_types/ ", () => {
    
    // {
    //   "meta": null,
    //   "data": {
    //       "id": 1,
    //       "code": 11,
    //       "name": "Registro civil de nacimiento",
    //       "abbreviation": "RC",
    //       "active": true,
    //       "updatedAt": "2023-08-07T21:12:58.889Z",
    //       "createdAt": "2023-08-07T21:12:58.889Z",
    //       "deletedAt": null
    //   }
    // }
    test("should respond with status 201 and the new object (data) after creating a new document type", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testDocType0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      testDocType0.id = response0.body.data.id;
      expect(response0.body.data).toHaveProperty("active");
      expect(response0.body.data.active).toBe(true);

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testDocType1);
      expect(response1.statusCode).toBe(201);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("id");
      testDocType1.id = response1.body.data.id;
      expect(response1.body.data).toHaveProperty("active");
      expect(response1.body.data.active).toBe(true);
    });

    // {
    // "status": 400,
    // "detail": "\"code\" must be a number",
    // "code": "Bad Request"
    // }
    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testDocType0,
          code: "should be a number",
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testDocType0,
          code: "should be a number",
        });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      const response2 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testDocType0,
          code: -5,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");
    });


    // {
    // "status": 500,
    // "detail": "Validation error",
    // "code": "Internal Server Error"
    // }
    test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testDocType0);
        // .send({
        //   ...testDocType0,
        //   code: -5,
        // });
      expect(response0.statusCode).toBe(500);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 500);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testDocType1,
          code: 22,
        });
      expect(response1.statusCode).toBe(500);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 500);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

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

  describe("GET /document_types/ ", () => {
    test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
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
      expect(response0.body.data[0]).toEqual(
        expect.objectContaining(testDocType1)
      );
      expect(response0.body.data[1]).toEqual(
        expect.objectContaining(testDocType0)
      );
    });

    // {
    // "status": 400,
    // "detail": "\"number\" must be a number",
    // "code": "Bad Request"
    // }
    test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
      const response0 = await request(usedHost)
        .get("/")
        .set(requestHeaders);
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

  describe("GET /document_types/:id ", () => {

    // {
    //     "meta": null,
    //     "data": {
    //         "id": 1,
    //         "code": 11,
    //         "name": "Registro civil",
    //         "abbreviation": "RC",
    //         "active": true,
    //         "createdAt": "2023-08-07T21:12:58.889Z",
    //         "updatedAt": "2023-08-07T21:25:28.687Z",
    //         "deletedAt": null
    //     }
    // }    
    test("should respond with status 200 and one document_type object created.", async () => {
      const response0 = await request(usedHost)
        .get(`/${testDocType0.id}`)
        .set(requestHeaders);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(
        expect.objectContaining(testDocType0)
      );

      const response1 = await request(usedHost)
        .get(`/${testDocType1.id}`)
        .set(requestHeaders);
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toEqual(
        expect.objectContaining(testDocType1)
      );
    });
    
    // {
    // "status": 400,
    // "detail": "\"number\" must be a number",
    // "code": "Bad Request"
    // }
    // test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
    //   const response0 = await request(usedHost).get("/").set(requestHeaders);
    //   expect(response0.statusCode).toBe(400);
    //   expect(response0.body).not.toHaveProperty("meta");
    //   expect(response0.body).not.toHaveProperty("data");
    //   expect(response0.body).toHaveProperty("status", 400);
    //   expect(response0.body).toHaveProperty("code");
    //   expect(response0.body).toHaveProperty("detail");

    //   const response1 = await request(usedHost)
    //     .get("/")
    //     .set(requestHeaders)
    //     .query({ page: {} });
    //   expect(response1.statusCode).toBe(400);
    //   expect(response1.body).not.toHaveProperty("meta");
    //   expect(response1.body).not.toHaveProperty("data");
    //   expect(response1.body).toHaveProperty("status", 400);
    //   expect(response1.body).toHaveProperty("code");
    //   expect(response1.body).toHaveProperty("detail");

    //   const response2 = await request(usedHost)
    //     .get("/")
    //     .set(requestHeaders)
    //     .query({ page: { number: 1 } });
    //   expect(response2.statusCode).toBe(400);
    //   expect(response2.body).not.toHaveProperty("data");
    //   expect(response2.body).toHaveProperty("status", 400);
    //   expect(response2.body).toHaveProperty("code");
    //   expect(response2.body).toHaveProperty("detail");

    //   const response3 = await request(usedHost)
    //     .get("/")
    //     .set(requestHeaders)
    //     .query({ page: { size: 1 } });
    //   expect(response3.statusCode).toBe(400);
    //   expect(response3.body).not.toHaveProperty("meta");
    //   expect(response3.body).not.toHaveProperty("data");
    //   expect(response3.body).toHaveProperty("status", 400);
    //   expect(response3.body).toHaveProperty("code");
    //   expect(response3.body).toHaveProperty("detail");

    //   const response4 = await request(usedHost)
    //     .get("/")
    //     .set(requestHeaders)
    //     .query({ page: { number: 0, size: 1 } });
    //   expect(response4.statusCode).toBe(400);
    //   expect(response4.body).not.toHaveProperty("meta");
    //   expect(response4.body).not.toHaveProperty("data");
    //   expect(response4.body).toHaveProperty("status", 400);
    //   expect(response4.body).toHaveProperty("code");
    //   expect(response4.body).toHaveProperty("detail");

    //   const response5 = await request(usedHost)
    //     .get("/")
    //     .set(requestHeaders)
    //     .query({ page: { number: 1, size: 0 } });
    //   expect(response5.statusCode).toBe(400);
    //   expect(response5.body).not.toHaveProperty("meta");
    //   expect(response5.body).not.toHaveProperty("data");
    //   expect(response5.body).toHaveProperty("status", 400);
    //   expect(response5.body).toHaveProperty("code");
    //   expect(response5.body).toHaveProperty("detail");

    //   const response6 = await request(usedHost)
    //     .get("/")
    //     .set(requestHeaders)
    //     .query({ page: { number: "A", size: 2 } });
    //   expect(response6.statusCode).toBe(400);
    //   expect(response6.body).not.toHaveProperty("meta");
    //   expect(response6.body).not.toHaveProperty("data");
    //   expect(response6.body).toHaveProperty("status", 400);
    //   expect(response6.body).toHaveProperty("code");
    //   expect(response6.body).toHaveProperty("detail");

    //   const response7 = await request(usedHost)
    //     .get("/")
    //     .set(requestHeaders)
    //     .query({ page: { number: 2, size: "B" } });
    //   expect(response7.statusCode).toBe(400);
    //   expect(response7.body).not.toHaveProperty("meta");
    //   expect(response7.body).not.toHaveProperty("data");
    //   expect(response7.body).toHaveProperty("status", 400);
    //   expect(response7.body).toHaveProperty("code");
    //   expect(response7.body).toHaveProperty("detail");
    // });

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    // test("should fail with error 401 and a message if Authorization header is not set.", async () => {
    //   const response0 = await request(usedHost).get("/");
    //   expect(response0.statusCode).toBe(401);
    //   expect(response0.body).not.toHaveProperty("meta");
    //   expect(response0.body).not.toHaveProperty("data");
    //   expect(response0.body).toHaveProperty("status", 401);
    //   expect(response0.body).toHaveProperty("code");
    //   expect(response0.body).toHaveProperty("detail");
    // });
  });

  describe("POST /document_types/edit ", () => {
    // {
    // "meta": null,
    // "data": {
    //     "id": 1,
    //     "code": 11,
    //     "name": "Registro civil",
    //     "abbreviation": "RC",
    //     "active": true,
    //     "createdAt": "2023-08-07T21:12:58.889Z",
    //     "updatedAt": "2023-08-07T21:22:03.684Z",
    //     "deletedAt": null
    //  }
    // }
    test("should respond with status 200 and the edited object (data)", async () => {
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...testDocType0,
          ...editDocType0,
        });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(
        expect.objectContaining({
          ...testDocType0,
          ...editDocType0,
        })
      );
      const response1 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...testDocType1,
          ...editDocType1,
        });
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toEqual(
        expect.objectContaining({
          ...testDocType1,
          ...editDocType1,
        })
      );
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // {
      // "status": 400,
      // "detail": "\"id\" is required",
      // "code": "Bad Request"
      // }
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...testDocType0,
          id: "",
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // {
      //     "status": 400,
      //     "detail": "\"id\" contains an invalid value",
      //     "code": "Bad Request"
      // }
      const response2 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...testDocType0,
          id: 0,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // {
      //     "status": 400,
      //     "detail": "\"code\" must be a number",
      //     "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editDocType0,
          code: "should be a number",
        });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      // {
      //     "status": 400,
      //     "detail": "\"code\" must be greater than 0",
      //     "code": "Bad Request"
      // }
      const response3 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editDocType0,
          code: 0,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // {
      //     "status": 400,
      //     "detail": "\"abbreviation\" must be a string",
      //     "code": "Bad Request"
      // }      
      const response4 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editDocType0,
          abbreviation: 0,
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      // {
      //     "status": 400,
      //     "detail": "\"name\" must be a string",
      //     "code": "Bad Request"
      // }
      const response5 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editDocType0,
          name: 0,
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");
    });

    // {
    //     "status": 500,
    //     "detail": "Validation error",
    //     "code": "Internal Server Error"
    // }  
    test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...testDocType1,
          ...editDocType1,
          code: 22,
        });
      expect(response0.statusCode).toBe(500);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 500);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    // {
    //     "status": 404,
    //     "detail": "The document type with id=99 does not exist",
    //     "code": "Not Found"
    // }    
    test("should fail with status 404 and an error with a message if the id does not exist", async () => {
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editDocType1,
          id: 999,
        });
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
      const response0 = await request(usedHost).post("/edit");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /document_types/status ", () => {
    // {
    //     "meta": null,
    //     "data": {
    //         "id": 1,
    //         "active": false
    //     }
    // }    
    test("should respond with status 200 and the edited object (data)", async () => {
      const response0 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          id: testDocType0.id,
          active: true,
        });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(
        expect.objectContaining({
          id: testDocType0.id,
          active: true,
        })
      );
      const response1 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          id: testDocType1.id,
          active: false,
        });
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toEqual(
        expect.objectContaining({
          id: testDocType1.id,
          active: false,
        })
      );
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
    // {
    //     "status": 400,
    //     "detail": "\"id\" is required",
    //     "code": "Bad Request"
    // }      
      const response0 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          active: false,
          id: "",
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // {
      //     "status": 400,
      //     "detail": "\"active\" must be a boolean",
      //     "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          id: testDocType0.id,
          active: "",
        });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      // {
      //     "status": 400,
      //     "detail": "\"active\" is required",
      //     "code": "Bad Request"
      // }      
      const response2 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          id: testDocType1.id,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // {
      //     "status": 400,
      //     "detail": "\"id\" must be greater than 0",
      //     "code": "Bad Request"
      // }      
      const response3 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          id: -5,
          active: true,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");
    });

    // {
    //     "status": 404,
    //     "detail": "The document type with id=999 does not exist",
    //     "code": "Not Found"
    // }    
    test("should fail with status 404 and an error with a message if the id does not exist", async () => {
      const response0 = await request(usedHost)
        .post("/status")
        .set(requestHeaders)
        .send({
          id: 999,
          active: true,
        });
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
