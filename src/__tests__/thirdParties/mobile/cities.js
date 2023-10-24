const request = require("supertest");

const usedHost = `${global.thirdPartiesMicroserviceLocalHost}/api/mobile/v1/third_parties/intercity_transport/cities`;
describe("Mobile - Cities management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  beforeAll(async () => {
    const firebaseAuth = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestMobileUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken;
  });

  describe("GET /intercity_transport/cities ", () => {
    test("should respond with status 200 and a list of cities objects.", async () => {
      const response0 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 2 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toEqual(expect.any(Array));
      expect(response0.body.length).toBe(2);
      expect(response0.body[0]).toHaveProperty("id");
      expect(response0.body[0]).toHaveProperty("name");
      expect(response0.body[1]).toHaveProperty("id");
      expect(response0.body[1]).toHaveProperty("name");

      const response1 = await request(usedHost).get("/").set(requestHeaders);
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toEqual(expect.any(Array));
      expect(response1.body[0]).toHaveProperty("id");
      expect(response1.body[0]).toHaveProperty("name");
      expect(response1.body[1]).toHaveProperty("id");
      expect(response1.body[1]).toHaveProperty("name");
    });

    test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
      const response0 = await request(usedHost)
        .get(`/`)
        .set(requestHeaders)
        .query({ page: { number: 200000, size: 100 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toEqual(expect.any(Array));
      expect(response0.body.length).toBe(0);
    });

    test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
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
  });

});
