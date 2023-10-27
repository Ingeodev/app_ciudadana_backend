const request = require("supertest");

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/gender`;

describe("Mobile - Gender equality management API points: ", () => {
  jest.setTimeout(90000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const lon = -76.52496476354585;
  const lat = 3.4270331133664707;

  beforeAll(async () => {
    const firebaseAuth = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestMobileUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken;
  });

  describe("GET /gender ", () => {
    test("should respond with status 200 and a list of gender equality attention lines and categories", async () => {
      const response0 = await request(usedHost).get("/").set(requestHeaders);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("info");
      expect(response0.body).toHaveProperty("genderLines");
    });

    test("DISABLED - (gender equality attention lines and categories) table must not have any records. should fail with status 200.", async () => {
      // 1. ------------------------------------------------
      // const response0 = await request(usedHost)
      //   .get("/")
      //   .set(requestHeaders);
      // expect(response0.statusCode).toBe(200);
      // expect(response0.body).not.toHaveProperty("meta");
      // expect(response0.body).not.toHaveProperty("data");
      // expect(response0.body).toEqual(expect.any(Array));
      // expect(response0.body.length).toBe(0);
    });

    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost)
        .get("/");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /gender/attention_points ", () => {
    test("should respond with status 200 and a list of attention points objects.", async () => {
      const response0 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 2 }, lat, lon });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toEqual(expect.any(Array));
      expect(response0.body.length).toBe(2);
      expect(response0.body[0]).toHaveProperty("id");
      expect(response0.body[0]).toHaveProperty("name");
      expect(response0.body[0]).toHaveProperty("color");
      expect(response0.body[0]).toHaveProperty("iconMap");
      expect(response0.body[0]).toHaveProperty("description");
      expect(response0.body[0]).toHaveProperty("address");
      expect(response0.body[0]).toHaveProperty("phone");
      expect(response0.body[0]).toHaveProperty("image");
      expect(response0.body[0]).toHaveProperty("lat");
      expect(response0.body[0]).toHaveProperty("lon");

      const response1 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ lat, lon });
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toEqual(expect.any(Array));
      expect(response1.body[0]).toHaveProperty("id");
      expect(response1.body[0]).toHaveProperty("name");
      expect(response1.body[0]).toHaveProperty("color");
      expect(response1.body[0]).toHaveProperty("iconMap");
      expect(response1.body[0]).toHaveProperty("description");
      expect(response1.body[0]).toHaveProperty("address");
      expect(response1.body[0]).toHaveProperty("phone");
      expect(response1.body[0]).toHaveProperty("image");
      expect(response1.body[0]).toHaveProperty("lat");
      expect(response1.body[0]).toHaveProperty("lon");

      const response2 = await request(usedHost).get("/attention_points").set(requestHeaders);
      expect(response2.statusCode).toBe(200);
      expect(response2.body).toEqual(expect.any(Array));
      expect(response2.body[0]).toHaveProperty("id");
      expect(response2.body[0]).toHaveProperty("name");
      expect(response2.body[0]).toHaveProperty("color");
      expect(response2.body[0]).toHaveProperty("iconMap");
      expect(response2.body[0]).toHaveProperty("description");
      expect(response2.body[0]).toHaveProperty("address");
      expect(response2.body[0]).toHaveProperty("phone");
      expect(response2.body[0]).toHaveProperty("image");
      expect(response2.body[0]).toHaveProperty("lat");
      expect(response2.body[0]).toHaveProperty("lon");
    });

    test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
      const response0 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ page: { number: 200000, size: 100 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toEqual(expect.any(Array));
      expect(response0.body.length).toBe(0);
    });

    test("Disabled - Should respond with status 200 and an empty array, because there are records.", async () => {
      // const response0 = await request(usedHost)
      //   .get("/attention_points")
      //   .set(requestHeaders)
      //   .query({ page: { number: 1, size: 2 } });
      // expect(response0.statusCode).toBe(200);
      // expect(response0.body).not.toHaveProperty("meta");
      // expect(response0.body).not.toHaveProperty("data");
      // expect(response0.body).toEqual(expect.any(Array));
      // expect(response0.body.length).toBe(0);
    });

    test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
      const response2 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ page: { number: 1 }, lat, lon });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ page: { size: 1 }, lat, lon });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      const response4 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ page: { number: 0, size: 1 }, lat, lon });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      const response5 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 0 }, lat, lon });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      const response6 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ page: { number: "A", size: 2 }, lat, lon });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      const response7 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ page: { number: 2, size: "B" }, lat, lon });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");

      const response10 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ lat: "must be a float", lon });
      expect(response10.statusCode).toBe(400);
      expect(response10.body).not.toHaveProperty("data");
      expect(response10.body).toHaveProperty("status", 400);
      expect(response10.body).toHaveProperty("code");
      expect(response10.body).toHaveProperty("detail");

      const response11 = await request(usedHost)
        .get("/attention_points")
        .set(requestHeaders)
        .query({ lon: "must be a float", lat });
      expect(response11.statusCode).toBe(400);
      expect(response11.body).not.toHaveProperty("data");
      expect(response11.body).toHaveProperty("status", 400);
      expect(response11.body).toHaveProperty("code");
      expect(response11.body).toHaveProperty("detail");
    });

    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost)
        .get("/attention_points")
        .query({ page: { number: 2, size: 2 }, lat, lon });
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

});
