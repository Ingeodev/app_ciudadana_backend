const request = require("supertest");

// Deployed
// const usedHost = `${global.usersMicroserviceOnlineHost}/api/web/v1/users/company/service`;
// Local
const usedHost = `${global.thirdPartiesMicroserviceLocalHost}/api/web/v1/third_parties/company/service`;
describe("Web - Third Party Services management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const testCompanyId = 15;

  const testService0 = {
    services: [
      {
        service: "service 1",
        companyId: testCompanyId,
      },
      {
        service: "service 2",
        companyId: testCompanyId,
      },
      {
        service: "service 3",
        companyId: testCompanyId,
      },
    ],
  };

  const editService0 = {
    service: "service 1 edit",
    companyId: testCompanyId,
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

  describe("POST /company/service ", () => {
    test("should respond with status 201 and the new object (data) after creating a new service", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testService0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data[0]).toHaveProperty("id");
      testService0.services[0].id = response0.body.data[0].id;
      editService0.id = response0.body.data[0].id;
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // 0. ----------------------------------------------
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          services: [
            {
              service: "service 1",
              companyId: testCompanyId,
            },
            {
              service: "service 2",
              companyId: 999,
            },
            {
              service: "service 3",
              companyId: testCompanyId,
            },
          ],
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // 1. ----------------------------------------------
      const response2 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          services: [
            {
              service: -5,
              companyId: "must be a number",
            },
          ],
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 2. ----------------------------------------------
      const response3 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          services: [
            {
              service: "service 1",
              companyId: "must be a number",
            },
          ],
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 3. ----------------------------------------------
      const response4 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          services: [
            {
              service: "service 1",
              companyId: "must be a number",
              keyNotValid: "nothing",
            },
          ],
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      // 4. ----------------------------------------------
      const response5 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          services: [
            {
              service: "service 1",
              // companyId: "must be a number",
            },
          ],
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
          services: [
            {
              // service: "service 1",
              companyId: "must be a number",
            },
          ],
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
          services: [
            {
              service: "service 1",
              companyId: "must be a number",
            },
          ],
        });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");

      // 7. ----------------------------------------------
      const response8 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          services: null,
        });
      expect(response8.statusCode).toBe(400);
      expect(response8.body).not.toHaveProperty("meta");
      expect(response8.body).not.toHaveProperty("data");
      expect(response8.body).toHaveProperty("status", 400);
      expect(response8.body).toHaveProperty("code");
      expect(response8.body).toHaveProperty("detail");

      // 8. ----------------------------------------------
      const response9 = await request(usedHost).post("/").set(requestHeaders);
      // .send({
      //   services: null,
      // });
      expect(response9.statusCode).toBe(400);
      expect(response9.body).not.toHaveProperty("meta");
      expect(response9.body).not.toHaveProperty("data");
      expect(response9.body).toHaveProperty("status", 400);
      expect(response9.body).toHaveProperty("code");
      expect(response9.body).toHaveProperty("detail");
    });

    test("should fail with status 403 (since the company does not belong to him) and an error with a message if the data cannot be saved", async () => {
      // 2. ----------------------------------------------
      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          services: [
            {
              service: "service 81",
              companyId: 999,
            },
            {
              service: "service 82",
              companyId: 999,
            },
            {
              service: "service 83",
              companyId: 999,
            },
          ],
        });
      expect(response1.statusCode).toBe(403);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 403);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
      // 1. ----------------------------------------------
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testService0);
      expect(response0.statusCode).toBe(500);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 500);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

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

  // describe("GET /company/service ", () => {
  //   test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
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
  //     expect(response0.body.data.length).toBe(2);
  //     expect(response0.body.data[0]).toHaveProperty("id");
  //     expect(response0.body.data[0]).toHaveProperty("name");
  //     expect(response0.body.data[0].name).toBe(testService0.name);
  //   });

  //   // {
  //   // "status": 400,
  //   // "detail": "\"number\" must be a number",
  //   // "code": "Bad Request"
  //   // }
  //   test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
  //     const response0 = await request(usedHost).get("/").set(requestHeaders);
  //     expect(response0.statusCode).toBe(400);
  //     expect(response0.body).not.toHaveProperty("meta");
  //     expect(response0.body).not.toHaveProperty("data");
  //     expect(response0.body).toHaveProperty("status", 400);
  //     expect(response0.body).toHaveProperty("code");
  //     expect(response0.body).toHaveProperty("detail");

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

  //     const response2 = await request(usedHost)
  //       .get("/")
  //       .set(requestHeaders)
  //       .query({ page: { number: 1 } });
  //     expect(response2.statusCode).toBe(400);
  //     expect(response2.body).not.toHaveProperty("data");
  //     expect(response2.body).toHaveProperty("status", 400);
  //     expect(response2.body).toHaveProperty("code");
  //     expect(response2.body).toHaveProperty("detail");

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

  //   test("DISABLED - Categories table must not have any records. should fail with status 404 and an error with a message of categories not found.", async () => {
  //     // 1. ------------------------------------------------
  //     // const response0 = await request(usedHost)
  //     //   .get("/")
  //     //   .set(requestHeaders)
  //     //   .query({ page: { number: 1, size: 2 } });
  //     // expect(response0.statusCode).toBe(404);
  //     // expect(response0.body).not.toHaveProperty("meta");
  //     // expect(response0.body).not.toHaveProperty("data");
  //     // expect(response0.body).toHaveProperty("status", 404);
  //     // expect(response0.body).toHaveProperty("code");
  //     // expect(response0.body).toHaveProperty("detail");
  //   });
  // });

  // describe("GET /company/service:id ", () => {

  //   test("should respond with status 200 and one document_type object created.", async () => {
  //     const response0 = await request(usedHost)
  //       .get(`/${testService0.id}`)
  //       .set(requestHeaders);
  //     expect(response0.statusCode).toBe(200);
  //     expect(response0.body).toHaveProperty("meta");
  //     expect(response0.body.meta).toBe(null);
  //     expect(response0.body).toHaveProperty("data");
  //     expect(response0.body.data).toHaveProperty("id");
  //     expect(response0.body.data).toHaveProperty("name");
  //     expect(response0.body.data.name).toBe(testService0.name);
  //   });

  //   test("should fail with status 400 and an error with a message id must be a number", async () => {
  //     const response0 = await request(usedHost)
  //       .get(`/ddd`)
  //       .set(requestHeaders);
  //     expect(response0.statusCode).toBe(400);
  //     expect(response0.body).not.toHaveProperty("meta");
  //     expect(response0.body).not.toHaveProperty("data");
  //     expect(response0.body).toHaveProperty("status", 400);
  //     expect(response0.body).toHaveProperty("code");
  //     expect(response0.body).toHaveProperty("detail");
  //   });

  //   // {
  //   //     "status": 401,
  //   //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
  //   //     "code": "Unauthorized"
  //   // }
  //   test("should fail with error 401 and a message if Authorization header is not set.", async () => {
  //     const response0 = await request(usedHost).get(`/${testService0.id}`);
  //     expect(response0.statusCode).toBe(401);
  //     expect(response0.body).not.toHaveProperty("meta");
  //     expect(response0.body).not.toHaveProperty("data");
  //     expect(response0.body).toHaveProperty("status", 401);
  //     expect(response0.body).toHaveProperty("code");
  //     expect(response0.body).toHaveProperty("detail");
  //   });

  //   test("should fail with status 404 and an error with a message not found", async () => {
  //     const response0 = await request(usedHost).get(`/999`).set(requestHeaders);
  //     expect(response0.statusCode).toBe(404);
  //     expect(response0.body).not.toHaveProperty("meta");
  //     expect(response0.body).not.toHaveProperty("data");
  //     expect(response0.body).toHaveProperty("status", 404);
  //     expect(response0.body).toHaveProperty("code");
  //     expect(response0.body).toHaveProperty("detail");
  //   });
  // });

  // describe("POST /company/serviceedit ", () => {

  //   test("should respond with status 200 and the edited object (data)", async () => {
  //     // 1. -------------------------------------------------
  //     const response0 = await request(usedHost)
  //       .post("/edit")
  //       .set(requestHeaders)
  //       .send(editService0);
  //     expect(response0.statusCode).toBe(200);
  //     expect(response0.body).toHaveProperty("meta");
  //     expect(response0.body.meta).toBe(null);
  //     expect(response0.body).toHaveProperty("data");
  //     expect(response0.body.data).toHaveProperty("id");
  //     expect(response0.body.data).toHaveProperty("name");
  //     expect(response0.body.data.name).toBe(editService0.name);

  //     // 2. -------------------------------------------------
  //     const response1 = await request(usedHost)
  //       .post("/edit")
  //       .set(requestHeaders)
  //       .send(editCompany1);
  //     expect(response1.statusCode).toBe(200);
  //     expect(response1.body).toHaveProperty("meta");
  //     expect(response1.body.meta).toBe(null);
  //     expect(response1.body).toHaveProperty("data");
  //     expect(response1.body.data).toHaveProperty("id");
  //     expect(response1.body.data).toHaveProperty("name");
  //     expect(response1.body.data.name).toBe(editCompany1.name);
  //   });

  //   test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
  //     // 1. -------------------------------------
  //     const response0 = await request(usedHost)
  //       .post("/edit")
  //       .set(requestHeaders)
  //       .send({
  //         ...editService0,
  //         id: -5,
  //       });
  //     expect(response0.statusCode).toBe(400);
  //     expect(response0.body).not.toHaveProperty("meta");
  //     expect(response0.body).not.toHaveProperty("data");
  //     expect(response0.body).toHaveProperty("status", 400);
  //     expect(response0.body).toHaveProperty("code");
  //     expect(response0.body).toHaveProperty("detail");

  //     // 2. -------------------------------------
  //     const response2 = await request(usedHost)
  //       .post("/edit")
  //       .set(requestHeaders)
  //       .send({
  //         ...editService0,
  //         name: -5,
  //       });
  //     expect(response2.statusCode).toBe(400);
  //     expect(response2.body).not.toHaveProperty("meta");
  //     expect(response2.body).not.toHaveProperty("data");
  //     expect(response2.body).toHaveProperty("status", 400);
  //     expect(response2.body).toHaveProperty("code");
  //     expect(response2.body).toHaveProperty("detail");

  //     // 3. -------------------------------------
  //     const response3 = await request(usedHost)
  //       .post("/edit")
  //       .set(requestHeaders)
  //       .send({
  //         ...editService0,
  //         icon: "no uri",
  //       });
  //     expect(response3.statusCode).toBe(400);
  //     expect(response3.body).not.toHaveProperty("meta");
  //     expect(response3.body).not.toHaveProperty("data");
  //     expect(response3.body).toHaveProperty("status", 400);
  //     expect(response3.body).toHaveProperty("code");
  //     expect(response3.body).toHaveProperty("detail");

  //     // 4. -------------------------------------
  //     const response5 = await request(usedHost)
  //       .post("/edit")
  //       .set(requestHeaders)
  //       .send({
  //         ...editService0,
  //         iconMap: "not uri",
  //       });
  //     expect(response5.statusCode).toBe(400);
  //     expect(response5.body).not.toHaveProperty("meta");
  //     expect(response5.body).not.toHaveProperty("data");
  //     expect(response5.body).toHaveProperty("status", 400);
  //     expect(response5.body).toHaveProperty("code");
  //     expect(response5.body).toHaveProperty("detail");

  //     // 5. -------------------------------------
  //     const response6 = await request(usedHost)
  //       .post("/edit")
  //       .set(requestHeaders)
  //       .send({
  //         ...editService0,
  //         color: "color",
  //       });
  //     expect(response6.statusCode).toBe(400);
  //     expect(response6.body).not.toHaveProperty("meta");
  //     expect(response6.body).not.toHaveProperty("data");
  //     expect(response6.body).toHaveProperty("status", 400);
  //     expect(response6.body).toHaveProperty("code");
  //     expect(response6.body).toHaveProperty("detail");

  //   });

    
  //   // test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
  //   //   const response0 = await request(usedHost)
  //   //     .post("/edit")
  //   //     .set(requestHeaders)
  //   //     .send({
  //   //       ...testService0,
  //   //       code: testService0.code,
  //   //     });
  //   //   expect(response0.statusCode).toBe(500);
  //   //   expect(response0.body).not.toHaveProperty("meta");
  //   //   expect(response0.body).not.toHaveProperty("data");
  //   //   expect(response0.body).toHaveProperty("status", 500);
  //   //   expect(response0.body).toHaveProperty("code");
  //   //   expect(response0.body).toHaveProperty("detail");
  //   // });

  //   // {
  //   //     "status": 404,
  //   //     "detail": "The service with id=99 does not exist",
  //   //     "code": "Not Found"
  //   // }
  //   test("should fail with status 404 and an error with a message if the id does not exist", async () => {
  //     const response0 = await request(usedHost)
  //       .post("/edit")
  //       .set(requestHeaders)
  //       .send({
  //         ...editCompany1,
  //         id: 999,
  //       });
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
  //     const response0 = await request(usedHost).post("/edit");
  //     expect(response0.statusCode).toBe(401);
  //     expect(response0.body).not.toHaveProperty("meta");
  //     expect(response0.body).not.toHaveProperty("data");
  //     expect(response0.body).toHaveProperty("status", 401);
  //     expect(response0.body).toHaveProperty("code");
  //     expect(response0.body).toHaveProperty("detail");
  //   });
  // });

});
