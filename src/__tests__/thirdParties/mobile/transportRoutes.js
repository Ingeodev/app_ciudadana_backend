const request = require("supertest");
const { v4: uuidV4 } = require("uuid");

const usedHost = `${global.thirdPartiesMicroserviceLocalHost}/api/mobile/v1/third_parties/intercity_transport`;
describe("Mobile - Transport Routes management API points: ", () => {
  jest.setTimeout(90000);

  const generateAlphanumeric = () => uuidV4().replace(/-/g, "");

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const requestHeadersWeb = {
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
  // Use a future date (the validator rejects dates in the past).
  date = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  let testCompany0 = undefined;
  let routeToCali = undefined;
  let routeFromCali = undefined;
  let timetableToCali = undefined;
  let timetableFromCali = undefined;
  let hoursToCali = [];
  let hoursFromCali = [];

  const testCompanyPayload = {
    name: generateAlphanumeric(),
    nit: `${Math.floor(Math.random() * (9000000 - 1000000 + 1)) + 1000000}-1`,
    description: "test description",
    phone: "3122334455",
    siteUri: 'http://test.site.url',
    imageUri: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/" + global.testImageInStorage,
  };

  beforeAll(async () => {
    const firebaseAuth = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestMobileUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken;

    const firebaseAuthWeb = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestWebUserLogin);
    requestHeadersWeb.Authorization += firebaseAuthWeb.body.idToken;
  });

  afterAll(async () => {
    const hours = [...hoursToCali, ...hoursFromCali];
    for (const hour of hours) {
      await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route/hour/delete`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send({
          id: hour.id,
          timetableId: hour.timetableId,
          companyId: testCompany0 ? testCompany0.id : undefined,
          routeId: hour.routeId,
        });
    }

    if (timetableToCali) {
      await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route/date/delete`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send({ id: timetableToCali.id, routeId: routeToCali.id, companyId: testCompany0.id });
    }
    if (timetableFromCali) {
      await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route/date/delete`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send({ id: timetableFromCali.id, routeId: routeFromCali.id, companyId: testCompany0.id });
    }

    if (routeToCali) {
      await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route/delete`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send({ id: routeToCali.id, companyId: testCompany0.id });
    }
    if (routeFromCali) {
      await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route/delete`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send({ id: routeFromCali.id, companyId: testCompany0.id });
    }

    if (testCompany0) {
      await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/delete`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send({ id: testCompany0.id });
    }
  });

  describe("Search for the cities of Popayan, Cauca and create the test transport company/routes. ", () => {
    test("Should respond with status 200.", async () => {
      // Search the id of the city of Popayan.
      const response2 = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/city`
      )
        .get("/autocomplete")
        .set(requestHeadersWeb)
        .query({ page: { number: 1, size: 100 }, q: nameCity });
      expect(response2.body).toHaveProperty("meta");
      expect(response2.body.meta).toHaveProperty("totalRecords");
      expect(response2.body.meta).toHaveProperty("pageSize");
      expect(response2.body).toHaveProperty("data");
      expect(response2.body.data).toEqual(expect.any(Array));
      cityObj = response2.body.data.find((item) => removeTildes(item.city) === nameCity);
      expect(Number.isInteger(cityObj.cityCode)).toBe(true);

      // Search the id of the city of Cali, Valle del Cauca, Colombia.
      const caliResponse = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/city`
      )
        .get("/autocomplete")
        .set(requestHeadersWeb)
        .query({ page: { number: 1, size: 100 }, q: "CALI" });
      const caliObj = caliResponse.body.data.find((item) => item.city === "CALI");
      expect(caliObj).toBeDefined();

      // Create a test transport company
      const companyResponse = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send(testCompanyPayload);
      expect(companyResponse.statusCode).toBe(201);
      expect(companyResponse.body.data).toHaveProperty("id");
      testCompany0 = { id: companyResponse.body.data.id };

      // Create the route Popayan -> Cali
      const routeToCaliResponse = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send({
          companyId: testCompany0.id,
          originId: cityObj.id,
          destinationId: caliObj.id,
          duration: "02:00",
        });
      expect(routeToCaliResponse.statusCode).toBe(201);
      routeToCali = { id: routeToCaliResponse.body.data.id };

      // Create the route Cali -> Popayan
      const routeFromCaliResponse = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send({
          companyId: testCompany0.id,
          originId: caliObj.id,
          destinationId: cityObj.id,
          duration: "02:00",
        });
      expect(routeFromCaliResponse.statusCode).toBe(201);
      routeFromCali = { id: routeFromCaliResponse.body.data.id };

      // Create timetable + hour/tariffs for the Popayan -> Cali route
      const timetableToCaliResponse = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route/date/hours`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send({
          date,
          routeId: routeToCali.id,
          companyId: testCompany0.id,
          hoursTariffs: [{ hour: "08:00", tariff: "10000" }],
        });
      expect(timetableToCaliResponse.statusCode).toBe(201);
      expect(timetableToCaliResponse.body.data).toHaveProperty("id");
      timetableToCali = { id: timetableToCaliResponse.body.data.id };
      hoursToCali = timetableToCaliResponse.body.data.hourTariffs.map((h) => ({
        id: h.id,
        timetableId: timetableToCali.id,
        routeId: routeToCali.id,
      }));

      // Create timetable + hour/tariffs for the Cali -> Popayan route
      const timetableFromCaliResponse = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route/date/hours`
      )
        .post("/")
        .set(requestHeadersWeb)
        .send({
          date,
          routeId: routeFromCali.id,
          companyId: testCompany0.id,
          hoursTariffs: [{ hour: "09:00", tariff: "10000" }],
        });
      expect(timetableFromCaliResponse.statusCode).toBe(201);
      expect(timetableFromCaliResponse.body.data).toHaveProperty("id");
      timetableFromCali = { id: timetableFromCaliResponse.body.data.id };
      hoursFromCali = timetableFromCaliResponse.body.data.hourTariffs.map((h) => ({
        id: h.id,
        timetableId: timetableFromCali.id,
        routeId: routeFromCali.id,
      }));
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