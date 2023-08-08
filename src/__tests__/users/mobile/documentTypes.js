const request = require("supertest");

const usedHost = `${global.usersMicroserviceOnlineHost}/api/mobile/v1/users/document_types`;
describe("Web - Document Type management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  // ! Obtained in alphabetical order - Therefore, they must be modified
  // ! First object returned
  const testDocType0 = {
    id: 11,
    // name: "Cedula de extranjeria",
    abbreviation: "CE",
  };

  // ! Second object returned
  const testDocType1 = {
    id: 5,
    // name: "Cedula de ciudadania",
    abbreviation: "CC",
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

  describe("GET /document_types/ ", () => {
    // [
    //   {
    //     id: 6,
    //     name: "Cedula de ciudadania",
    //     abbreviation: "CC",
    //   },
    //   {
    //     id: 1,
    //     name: "Registro civil",
    //     abbreviation: "RC",
    //   },
    //   {
    //     id: 5,
    //     name: "Tarjeta de identidad",
    //     abbreviation: "TI",
    //   },
    // ]
    test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
      // No pagination
      const response0 = await request(usedHost).get("/").set(requestHeaders);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toEqual(expect.any(Array));
      expect(response0.body[0]).toEqual(expect.objectContaining(testDocType1));
      expect(response0.body[1]).toEqual(expect.objectContaining(testDocType0));

      // Pagination
      const response1 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 2 } });
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toEqual(expect.any(Array));
      expect(response1.body.length).toBe(2);
      expect(response1.body[0]).toEqual(expect.objectContaining(testDocType1));
      expect(response0.body[1]).toEqual(expect.objectContaining(testDocType0));
    });

    // {
    // "status": 400,
    // "detail": "\"number\" must be a number",
    // "code": "Bad Request"
    // }
    test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
      // const response0 = await request(usedHost)
      //   .get("/")
      //   .set(requestHeaders);
      // expect(response0.statusCode).toBe(400);
      // expect(response0.body).not.toHaveProperty("meta");
      // expect(response0.body).not.toHaveProperty("data");
      // expect(response0.body).toHaveProperty("status", 400);
      // expect(response0.body).toHaveProperty("code");
      // expect(response0.body).toHaveProperty("detail");

      // const response1 = await request(usedHost)
      //   .get("/")
      //   .set(requestHeaders)
      //   .query({ page: {} });
      // expect(response1.statusCode).toBe(400);
      // expect(response1.body).not.toHaveProperty("meta");
      // expect(response1.body).not.toHaveProperty("data");
      // expect(response1.body).toHaveProperty("status", 400);
      // expect(response1.body).toHaveProperty("code");
      // expect(response1.body).toHaveProperty("detail");

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
});
