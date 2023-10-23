const request = require("supertest");

const usedHost = `${global.thirdPartiesMicroserviceLocalHost}/api/mobile/v1/third_parties/intercity_transport`;
describe("Mobile - Transport Routes management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  function removeTildes(str) {
    const accents = "ÁáÉéÍíÓóÚú";
    const withoutAccents = 'AaEeIiOoUu';

    return str.split('').map(char => {
        const index = accents.indexOf(char);
        return index !== -1 ? withoutAccents[index] : char;
    }).join('');
  }
  
  nameCity = "POPAYAN";
  let cityObj = undefined;
  date = "2023-11-20";


  beforeAll(async () => {
    const firebaseAuth = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestMobileUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken;
  });

  describe("Search for the cities of Popayan, Cauca. ", () => {
    test("Should respond with status 200.", async () => {
      // Search the id of the city of Popayan.
      const response2 = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/city`
      )
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 100 }, q: nameCity });
      expect(response2.body).toHaveProperty("meta");
      expect(response2.body.meta).toHaveProperty("totalRecords");
      expect(response2.body.meta).toHaveProperty("pageSize");
      expect(response2.body).toHaveProperty("data");
      expect(response2.body.data).toEqual(expect.any(Array));
      cityObj = response2.body.data.find((item) => removeTildes(item.city) === nameCity);
      expect(Number.isInteger(cityObj.cityCode)).toBe(true);
    });
  });

  describe("GET /intercity_transport/ ", () => {
    test("should respond with status 200 and a list of category objects.", async () => {
      const response0 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ city: cityObj.id, date });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toEqual(expect.any(Array));
      expect(response0.body[0]).toHaveProperty("id");
      expect(response0.body[0]).toHaveProperty("companyName");
      expect(response0.body[0]).toHaveProperty("image");
      expect(response0.body[0]).toHaveProperty("routesToOrigin");
      expect(response0.body[0].routesToOrigin).toEqual(expect.any(Array));
      expect(response0.body[0]).toHaveProperty("routesToDestination");
      expect(response0.body[0].routesToDestination).toEqual(expect.any(Array));
    });

    test("Should respond with status 200 and an empty array, because date has not scheduled routes.", async () => {
      const response0 = await request(usedHost)
        .get(`/`)
        .set(requestHeaders)
        .query({ city: cityObj.id, date: "2999-12-12" });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toEqual(expect.any(Array));
    });

    test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
      const response2 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ city: cityObj.id, date: "must be a date: yyyy-mm-dd" });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ city: "must be a integer", date });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      const response4 = await request(usedHost)
        .get("/")
        .set(requestHeaders);
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");
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
