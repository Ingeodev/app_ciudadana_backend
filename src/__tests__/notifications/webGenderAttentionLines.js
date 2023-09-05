const request = require("supertest");

// Deployed
// const usedHost = `${global.notificationsMicroserviceOnlineHost}/web/v1/notifications/gender_line`;
// Local
const usedHost = `${global.notificationsMicroserviceDefaultHost}/web/v1/notifications/gender_line`;
describe("Web - Gender Attention Lines management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const testGenderLine0 = {
    name: "Attention Line 1 Test",
    phone: "3123334455",
    address: "Address Test",
    imageUri: "http://image.com",
  };

  const testGenderLine1 = {
    name: "Attention Line 2 Test",
    phone: "3123334455",
    address: "Address Test",
    imageUri: "http://image.com",
  };

  const editGender0 = {
    name: "Attention Line 1 Test Edit",
    phone: "3123334499",
    address: "Address Test Edit",
    imageUri: "http://image.com/edit",
  };

  const editGender1 = {
    name: "Attention Line 2 Test Edit",
    phone: "3123334400",
    address: "Address Test Edit",
    imageUri: "http://image.com/edit",
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

  describe("POST /gender_line/ ", () => {
    test("should respond with status 201 and the new object (data) after creating a new gender attention line", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testGenderLine0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      testGenderLine0.id = response0.body.data.id;
      editGender0.id = response0.body.data.id;

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testGenderLine1);
      expect(response1.statusCode).toBe(201);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("id");
      testGenderLine1.id = response1.body.data.id;
      editGender1.id = response1.body.data.id;
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      const response2 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testGenderLine0,
          name: -5,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 4. ----------------------------------------------
      const response5 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testGenderLine0,
          phone: -5,
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // 5. ----------------------------------------------
      const response6 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testGenderLine0,
          address: -5,
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // 6. ----------------------------------------------
      const response7 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testGenderLine0,
          imageUri: "must be uri",
        });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");
    });

    test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testGenderLine0);
      expect(response0.statusCode).toBe(500);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 500);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testGenderLine1);
      expect(response1.statusCode).toBe(500);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 500);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).post("/").send(testGenderLine0);
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /gender_line/ ", () => {
    test("should respond with status 200 and a list of objects containing the gender attention lines.", async () => {
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

    // {
    // "status": 400,
    // "detail": "\"number\" must be a number",
    // "code": "Bad Request"
    // }
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

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get("/").query({ page: { number: 1, size: 2 } });
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("DISABLED - Table (of gender attention lines) must not have any records. should fail with status 404 and an error with a message of gender attention lines not found.", async () => {
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

  describe("POST /gender_line/edit ", () => {

    test("should respond with status 200 and the edited object (data)", async () => {
      // 1. -------------------------------------------------
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send(editGender0);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data).toHaveProperty("name");
      expect(response0.body.data.name).toBe(editGender0.name);

      // 2. -------------------------------------------------
      const response1 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send(editGender1);
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("id");
      expect(response1.body.data).toHaveProperty("name");
      expect(response1.body.data.name).toBe(editGender1.name);
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // 1. -------------------------------------
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editGender0,
          id: -5,
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // 2. -------------------------------------
      const response2 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editGender0,
          name: -5,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 3. -------------------------------------
      const response3 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editGender0,
          phone: -5,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 4. -------------------------------------
      const response5 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editGender0,
          address: -5,
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // 5. -------------------------------------
      const response6 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editGender0,
          imageUri: "is.not.uri",
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

    });

    
    // test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
    //   const response0 = await request(usedHost)
    //     .post("/edit")
    //     .set(requestHeaders)
    //     .send({
    //       ...testGenderLine1,
    //       categoryId: 999,
    //     });
    //   expect(response0.statusCode).toBe(500);
    //   expect(response0.body).not.toHaveProperty("meta");
    //   expect(response0.body).not.toHaveProperty("data");
    //   expect(response0.body).toHaveProperty("status", 500);
    //   expect(response0.body).toHaveProperty("code");
    //   expect(response0.body).toHaveProperty("detail");
    // });

    // {
    //     "status": 404,
    //     "detail": "The category with id=99 does not exist",
    //     "code": "Not Found"
    // }
    test("should fail with status 404 and an error with a message if the id does not exist", async () => {
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editGender1,
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
      const response0 = await request(usedHost).post("/edit").send(editGender0);
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /gender_line/delete ", () => {
    // {
    //     "meta": null,
    //     "data": {
    //         "id": 1,
    //         "active": false
    //     }
    // }
    test("should respond with status 200 and the edited object (data)", async () => {
      const response0 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: testGenderLine0.id,
        });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(
        expect.objectContaining({
          id: testGenderLine0.id,
        })
      );
      const response1 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: testGenderLine1.id,
        });
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toEqual(
        expect.objectContaining({
          id: testGenderLine1.id,
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
        .post("/delete")
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
      //     "detail": "\"id\" must be greater than 0",
      //     "code": "Bad Request"
      // }
      const response3 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: -5,
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

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).post("/delete").send({
        id: 999,
      });
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

});
