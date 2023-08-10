const request = require("supertest");

// Deployed
// const usedHost = `${global.usersMicroserviceOnlineHost}/api/web/v1/users`;
// Local
const usedHost = `${global.usersMicroserviceLocalHost}/api/web/v1/users/admin/notifications`;
describe("Web - AdminNotifications management API points: ", () => {
  jest.setTimeout(25000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const testNotif = {
    type: "user-inVerification",
    tableName: "Users",
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

  describe("GET / ", () => {
    test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
      // {
      //     "meta": {
      //         "page": 1,
      //         "pageSize": 2,
      //         "totalRecords": 1,
      //         "totalPages": 1
      //     },
      //     "data": [
      //         {
      //             "id": 3,
      //             "type": "user-inVerification",
      //             "referenceId": 33,
      //             "tableName": "Users",
      //             "message": "",
      //             "status": "UNREAD",
      //             "createdAt": "2023-08-10T20:19:09.408Z",
      //             "updatedAt": "2023-08-10T20:19:09.408Z",
      //             "deletedAt": null
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
        expect.objectContaining(testNotif)
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

    test("should fail with status 404 and an error with a message of adminNotifications not found", async () => {
      // 1. ------------------------------------------------
      // {
      //     "status": 404,
      //     "detail": "There are no AdminNotifications registered in the database",
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
});
