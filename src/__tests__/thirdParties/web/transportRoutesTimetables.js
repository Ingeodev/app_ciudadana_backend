const request = require("supertest");
const { v4: uuidV4 } = require("uuid");
const constant = require("../../../microservices/thirdParties/constant.json");
const caliCityCode = constant.CALI_CITY_CODE;

describe("Web - Transport Routes (dates n hours/tariffs) management API points: ", () => {
  jest.setTimeout(81000);
  const usedHost = `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route`;

  let requestHeaders = {
    Authorization: "Bearer ",
  };

  const generateAlphanumeric = () => {
    return uuidV4().replace(/-/g, "");
  };

  const min = 1000000;
  const max = 9000000;
  let caliObj = {};
  let pereiraObj = {};
  let calimaObj = {};
  let testRoute0 = {};
  let testDateHours0 = {};
  let testDate0 = {};
  let testDate1 = {};
  let editDate0 = {};
  let editDate1 = {};
  let testHour0 = {};
  let testHour1 = {};
  let editHour0 = {};
  let editHour1 = {};
  let datesIdExcel = [];
  let hoursIdExcel = [];

  let testCompany0 = {
    name: generateAlphanumeric(),
    nit: `${Math.floor(Math.random() * (max - min + 1)) + min}-1`,
    description: "test description",
    phone: "3122334455",
    siteUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    imageUri: `${global.fileManagementMicroserviceOnlineHost}/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f3.png`,
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

  describe("1. Dates - WEB Transport Routes configuration API points: ", () => {

    describe("Create a (test) transport company and route, furthermore search for the cities of Cali/Pereira/California. ", () => {
      test("Should respond with status 200.", async () => {
        // Create a test transport company
        const response0 = await request(
          `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company`
        )
          .post("/")
          .set(requestHeaders)
          .send(testCompany0);
        expect(response0.statusCode).toBe(201);
        expect(response0.body.data).toHaveProperty("id");
        testCompany0.id = response0.body.data.id;

        // Search the id of the city of Cali, Valle del Cauca, Colombia.
        const response1 = await request(
          `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/city`
        )
          .get("/autocomplete")
          .set(requestHeaders)
          .query({ page: { number: 1, size: 100 }, q: "CALI" });
        expect(response1.statusCode).toBe(200);
        expect(response1.body).toHaveProperty("meta");
        expect(response1.body.meta).toHaveProperty("totalRecords");
        expect(response1.body.meta).toHaveProperty("pageSize");
        expect(response1.body).toHaveProperty("data");
        expect(response1.body.data).toEqual(expect.any(Array));
        caliObj = response1.body.data.find((item) => item.city === "CALI");
        expect(caliObj.cityCode).toBe(caliCityCode);
        calimaObj = response1.body.data.find((item) => item.city === "CALIMA");
        expect(Number.isInteger(calimaObj.cityCode)).toBe(true);

        // Search the id of the city of Pereira.
        const response2 = await request(
          `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/city`
        )
          .get("/autocomplete")
          .set(requestHeaders)
          .query({ page: { number: 1, size: 100 }, q: "PEREIRA" });
        expect(response2.statusCode).toBe(200);
        expect(response2.body).toHaveProperty("meta");
        expect(response2.body.meta).toHaveProperty("totalRecords");
        expect(response2.body.meta).toHaveProperty("pageSize");
        expect(response2.body).toHaveProperty("data");
        expect(response2.body.data).toEqual(expect.any(Array));
        pereiraObj = response2.body.data.find(
          (item) => item.city === "PEREIRA"
        );
        expect(Number.isInteger(pereiraObj.cityCode)).toBe(true);

        testRoute0 = {
          companyId: testCompany0.id,
          originId: caliObj.id,
          destinationId: pereiraObj.id,
          duration: "02:00",
        };

        const response3 = await request(
          `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route`
        )
          .post("/")
          .set(requestHeaders)
          .send(testRoute0);
        expect(response3.statusCode).toBe(201);
        expect(response3.body.data).toHaveProperty("id");
        testRoute0.id = response3.body.data.id;

        testDate0 = {
          date: "2099-12-01",
          routeId: testRoute0.id,
          companyId: testCompany0.id,
        };

        testDate1 = {
          date: "2099-12-02",
          routeId: testRoute0.id,
          companyId: testCompany0.id,
        };

        editDate0 = {
          date: "2099-12-03",
          routeId: testRoute0.id,
          companyId: testCompany0.id,
        };

        editDate1 = {
          date: "2099-12-04",
          routeId: testRoute0.id,
          companyId: testCompany0.id,
        };

        // ####################################

        testHour0 = {
          companyId: testCompany0.id,
          routeId: testRoute0.id,
          hour: "08:00",
          tariff: 10000,
        };

        testHour1 = {
          companyId: testCompany0.id,
          routeId: testRoute0.id,
          hour: "09:00",
          tariff: 20000,
        };

        editHour0 = {
          companyId: testCompany0.id,
          routeId: testRoute0.id,
          hour: "10:00",
          tariff: 30000,
        };

        editHour1 = {
          companyId: testCompany0.id,
          routeId: testRoute0.id,
          hour: "11:30",
          tariff: 30000,
        };

        // ##############################

        testDateHours0 = {
          date: "2099-12-05",
          routeId: testRoute0.id,
          companyId: testCompany0.id,
          hoursTariffs: [
            { hour: "08:00", tariff: "10000" },
            { hour: "09:00", tariff: "10000" },
            { hour: "10:00", tariff: "10000" },
          ],
        };
      });
    });

    describe("POST /route/date ", () => {
      test("Should respond with status 201 and the new object (data) after creating a the dates for one transport route.", async () => {
        const response0 = await request(usedHost)
          .post("/date")
          .set(requestHeaders)
          .send(testDate0);
        expect(response0.statusCode).toBe(201);
        expect(response0.body).toHaveProperty("meta");
        expect(response0.body.meta).toBe(null);
        expect(response0.body).toHaveProperty("data");
        expect(response0.body.data).toHaveProperty("id");
        testDate0.id = response0.body.data.id;
        editDate0.id = response0.body.data.id;
        testHour0.timetableId = response0.body.data.id;
        editHour0.timetableId = response0.body.data.id;
        testHour1.timetableId = response0.body.data.id;
        editHour1.timetableId = response0.body.data.id;

        const response1 = await request(usedHost)
          .post("/date")
          .set(requestHeaders)
          .send(testDate1);
        expect(response1.statusCode).toBe(201);
        expect(response1.body).toHaveProperty("meta");
        expect(response1.body.meta).toBe(null);
        expect(response1.body).toHaveProperty("data");
        expect(response1.body.data).toHaveProperty("id");
        testDate1.id = response1.body.data.id;
        editDate1.id = response1.body.data.id;
      });

      test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
        const response2 = await request(usedHost)
          .post("/date")
          .set(requestHeaders)
          .send({
            ...testDate0,
            companyId: "must be a number",
          });
        expect(response2.statusCode).toBe(400);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 400);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");

        // 4. ----------------------------------------------
        const response5 = await request(usedHost)
          .post("/date")
          .set(requestHeaders)
          .send({
            ...testDate0,
            routeId: "must be a number",
          });
        expect(response5.statusCode).toBe(400);
        expect(response5.body).not.toHaveProperty("meta");
        expect(response5.body).not.toHaveProperty("data");
        expect(response5.body).toHaveProperty("status", 400);
        expect(response5.body).toHaveProperty("code");
        expect(response5.body).toHaveProperty("detail");

        // 6. ----------------------------------------------
        const response7 = await request(usedHost)
          .post("/date")
          .set(requestHeaders)
          .send({
            ...testDate0,
            date: "must be in yyyy-mm-dd",
          });
        expect(response7.statusCode).toBe(400);
        expect(response7.body).not.toHaveProperty("meta");
        expect(response7.body).not.toHaveProperty("data");
        expect(response7.body).toHaveProperty("status", 400);
        expect(response7.body).toHaveProperty("code");
        expect(response7.body).toHaveProperty("detail");

        // 7. ----------------------------------------------
        const response9 = await request(usedHost)
          .post("/date")
          .set(requestHeaders)
          .send(testDate0);
        expect(response9.statusCode).toBe(400);
        expect(response9.body).not.toHaveProperty("meta");
        expect(response9.body).not.toHaveProperty("data");
        expect(response9.body).toHaveProperty("status", 400);
        expect(response9.body).toHaveProperty("code");
        expect(response9.body).toHaveProperty("detail");
      });

      test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
        const response0 = await request(usedHost).post("/date");
        expect(response0.statusCode).toBe(401);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 401);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with status 422 and an error with a message if the transport company/route does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/date")
          .set(requestHeaders)
          .send({
            ...testDate0,
            companyId: 99999,
          });
        expect(response0.statusCode).toBe(422);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 422);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .post("/date")
          .set(requestHeaders)
          .send({
            ...testDate0,
            routeId: 99999,
          });
        expect(response1.statusCode).toBe(422);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 422);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");
      });
    });

    describe("POST /route/date/edit ", () => {
      test("Should respond with status 200 and the edited object (data).", async () => {
        // 1. -------------------------------------------------
        const response0 = await request(usedHost)
          .post("/date/edit")
          .set(requestHeaders)
          .send(editDate0);
        expect(response0.statusCode).toBe(200);
        expect(response0.body).toHaveProperty("meta");
        expect(response0.body.meta).toBe(null);
        expect(response0.body).toHaveProperty("data");
        expect(response0.body.data).toHaveProperty("id");
        expect(response0.body.data).toHaveProperty("date");
        expect(response0.body.data).toHaveProperty("routeId");
        expect(response0.body.data.routeId).toBe(editDate0.routeId);

        // 2. -------------------------------------------------
        const response1 = await request(usedHost)
          .post("/date/edit")
          .set(requestHeaders)
          .send(editDate1);
        expect(response1.statusCode).toBe(200);
        expect(response1.body).toHaveProperty("meta");
        expect(response1.body.meta).toBe(null);
        expect(response1.body).toHaveProperty("data");
        expect(response1.body.data).toHaveProperty("id");
        expect(response1.body.data).toHaveProperty("date");
        expect(response1.body.data).toHaveProperty("routeId");
        expect(response1.body.data.routeId).toBe(editDate1.routeId);
      });

      test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
        // 1. -------------------------------------
        const response0 = await request(usedHost)
          .post("/date/edit")
          .set(requestHeaders)
          .send({
            ...editDate0,
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
          .post("/date/edit")
          .set(requestHeaders)
          .send({
            ...editDate0,
            companyId: -5,
          });
        expect(response2.statusCode).toBe(400);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 400);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");

        // 3. -------------------------------------
        const response3 = await request(usedHost)
          .post("/date/edit")
          .set(requestHeaders)
          .send({
            ...editDate0,
            routeId: -5,
          });
        expect(response3.statusCode).toBe(400);
        expect(response3.body).not.toHaveProperty("meta");
        expect(response3.body).not.toHaveProperty("data");
        expect(response3.body).toHaveProperty("status", 400);
        expect(response3.body).toHaveProperty("code");
        expect(response3.body).toHaveProperty("detail");

        // 5. -------------------------------------
        const response6 = await request(usedHost)
          .post("/date/edit")
          .set(requestHeaders)
          .send({
            ...editDate0,
            date: -5,
          });
        expect(response6.statusCode).toBe(400);
        expect(response6.body).not.toHaveProperty("meta");
        expect(response6.body).not.toHaveProperty("data");
        expect(response6.body).toHaveProperty("status", 400);
        expect(response6.body).toHaveProperty("code");
        expect(response6.body).toHaveProperty("detail");
      });

      test("Should fail with error 400 and an error if the hour/tariff of transport route exists in advance.", async () => {
        const response7 = await request(usedHost)
          .post("/date/edit")
          .set(requestHeaders)
          .send({
            ...editDate0,
            id: editDate1.id,
          });
        expect(response7.statusCode).toBe(400);
        expect(response7.body).not.toHaveProperty("meta");
        expect(response7.body).not.toHaveProperty("data");
        expect(response7.body).toHaveProperty("status", 400);
        expect(response7.body).toHaveProperty("code");
        expect(response7.body).toHaveProperty("detail");
      });

      test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
        const response0 = await request(usedHost)
          .post("/date/edit")
          .send(editDate0);
        expect(response0.statusCode).toBe(401);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 401);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with status 404 and an error with a message if the id does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/date/edit")
          .set(requestHeaders)
          .send({
            ...editDate1,
            id: 999,
          });
        expect(response0.statusCode).toBe(404);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 404);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with status 422 and an error with a message if the transport company/route does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/date/edit")
          .set(requestHeaders)
          .send({
            ...editDate1,
            companyId: 99999,
          });
        expect(response0.statusCode).toBe(422);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 422);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .post("/date/edit")
          .set(requestHeaders)
          .send({
            ...editDate1,
            routeId: 99999,
          });
        expect(response1.statusCode).toBe(422);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 422);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");
      });
    });

    describe("POST /route/hour        - Create a date with hours n tariffs", () => {
      test("Should respond with status 201 and the new object (data) after creating a the hours/tariffs for one transport route.", async () => {
        const response0 = await request(usedHost)
          .post("/date/hours")
          .set(requestHeaders)
          .send(testDateHours0);
        expect(response0.statusCode).toBe(201);
        expect(response0.body).toHaveProperty("meta");
        expect(response0.body.meta).toBe(null);
        expect(response0.body).toHaveProperty("data");
        expect(response0.body.data).toHaveProperty("id");
        testDateHours0.id = response0.body.data.id;
      });

      test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
        const response2 = await request(usedHost)
          .post("/date/hours")
          .set(requestHeaders)
          .send({
            ...testDateHours0,
            routeId: "must be a number",
          });
        expect(response2.statusCode).toBe(400);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 400);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");

        // 4. ----------------------------------------------
        const response5 = await request(usedHost)
          .post("/date/hours")
          .set(requestHeaders)
          .send({
            ...testDateHours0,
            companyId: "must be a number",
          });
        expect(response5.statusCode).toBe(400);
        expect(response5.body).not.toHaveProperty("meta");
        expect(response5.body).not.toHaveProperty("data");
        expect(response5.body).toHaveProperty("status", 400);
        expect(response5.body).toHaveProperty("code");
        expect(response5.body).toHaveProperty("detail");

        // 6. ----------------------------------------------
        const response7 = await request(usedHost)
          .post("/date/hours")
          .set(requestHeaders)
          .send({
            ...testDateHours0,
            date: "must be yyyy/mm/dd",
          });
        expect(response7.statusCode).toBe(400);
        expect(response7.body).not.toHaveProperty("meta");
        expect(response7.body).not.toHaveProperty("data");
        expect(response7.body).toHaveProperty("status", 400);
        expect(response7.body).toHaveProperty("code");
        expect(response7.body).toHaveProperty("detail");

        // 7. ----------------------------------------------
        const response8 = await request(usedHost)
          .post("/date/hours")
          .set(requestHeaders)
          .send({
            ...testDateHours0,
            hoursTariffs: -5,
          });
        expect(response8.statusCode).toBe(400);
        expect(response8.body).not.toHaveProperty("meta");
        expect(response8.body).not.toHaveProperty("data");
        expect(response8.body).toHaveProperty("status", 400);
        expect(response8.body).toHaveProperty("code");
        expect(response8.body).toHaveProperty("detail");

        // 9. ----------------------------------------------
        const response9 = await request(usedHost)
          .post("/date/hours")
          .set(requestHeaders)
          .send(testDateHours0);
        expect(response9.statusCode).toBe(400);
        expect(response9.body).not.toHaveProperty("meta");
        expect(response9.body).not.toHaveProperty("data");
        expect(response9.body).toHaveProperty("status", 400);
        expect(response9.body).toHaveProperty("code");
        expect(response9.body).toHaveProperty("detail");
      });

      test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
        const response0 = await request(usedHost).post("/date/hours");
        expect(response0.statusCode).toBe(401);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 401);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with status 422 and an error with a message if the transport company/route/date does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/date/hours")
          .set(requestHeaders)
          .send({
            ...testDateHours0,
            companyId: 99999,
          });
        expect(response0.statusCode).toBe(422);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 422);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .post("/date/hours")
          .set(requestHeaders)
          .send({
            ...testDateHours0,
            routeId: 99999,
          });
        expect(response1.statusCode).toBe(422);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 422);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");
      });
    });

    describe("GET /route/date ", () => {
      test("Should respond with status 200 and a list of objects containing the dates of transport routes.", async () => {
        const response0 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 2000 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response0.statusCode).toBe(200);
        expect(response0.body).toHaveProperty("meta");
        expect(response0.body.meta).toHaveProperty("page");
        expect(response0.body.meta).toHaveProperty("pageSize");
        expect(response0.body.meta).toHaveProperty("totalRecords");
        expect(response0.body.meta.page).toBe(1);
        expect(response0.body.meta.pageSize).toBe(2000);
        expect(response0.body).toHaveProperty("data");
        expect(response0.body.data).toEqual(expect.any(Array));
        expect(response0.body.data[0]).toHaveProperty("id");
        expect(response0.body.data[0]).toHaveProperty("date");
        for (let index = 0; index < response0.body.meta.totalRecords; index++) {
          datesIdExcel.push(response0.body.data[index].id);
        }
      });

      test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
        const response0 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: { number: 200000, size: 100 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response0.statusCode).toBe(200);
        expect(response0.body).toHaveProperty("meta");
        expect(response0.body.meta.page).toBe(200000);
        expect(response0.body.meta.pageSize).toBe(100);
        expect(response0.body.meta).toHaveProperty("message");
        expect(response0.body).toHaveProperty("data");
        expect(response0.body.data).toEqual(expect.any(Array));
        expect(response0.body.data.length).toBe(0);
      });

      test("Disabled - Should respond with status 200 and an empty array, because there are no dates registered for transport routes.", async () => {
        // const response0 = await request(usedHost)
        //   .get(`/date`)
        //   .set(requestHeaders)
        //   .query({ page: { number: 1, size: 2 }, companyId: testCompany0.id, routeId: testRoute0.id });
        // expect(response0.statusCode).toBe(200);
        // expect(response0.body).toHaveProperty("meta");
        // expect(response0.body.meta.page).toBe(1);
        // expect(response0.body.meta.pageSize).toBe(2);
        // expect(response0.body.meta).toHaveProperty("message");
        // expect(response0.body).toHaveProperty("data");
        // expect(response0.body.data).toEqual(expect.any(Array));
        // expect(response0.body.data.length).toBe(0);
      });

      test("Should fail with status 400 and an error with a message if no pagination is provided.", async () => {
        const response0 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders);
        expect(response0.statusCode).toBe(400);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 400);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: {},
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response1.statusCode).toBe(400);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 400);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");

        const response2 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: { number: 1 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response2.statusCode).toBe(400);
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 400);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");

        const response3 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: { size: 1 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response3.statusCode).toBe(400);
        expect(response3.body).not.toHaveProperty("meta");
        expect(response3.body).not.toHaveProperty("data");
        expect(response3.body).toHaveProperty("status", 400);
        expect(response3.body).toHaveProperty("code");
        expect(response3.body).toHaveProperty("detail");

        const response4 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: { number: 0, size: 1 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response4.statusCode).toBe(400);
        expect(response4.body).not.toHaveProperty("meta");
        expect(response4.body).not.toHaveProperty("data");
        expect(response4.body).toHaveProperty("status", 400);
        expect(response4.body).toHaveProperty("code");
        expect(response4.body).toHaveProperty("detail");

        const response5 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 0 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response5.statusCode).toBe(400);
        expect(response5.body).not.toHaveProperty("meta");
        expect(response5.body).not.toHaveProperty("data");
        expect(response5.body).toHaveProperty("status", 400);
        expect(response5.body).toHaveProperty("code");
        expect(response5.body).toHaveProperty("detail");

        const response6 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: { number: "A", size: 2 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response6.statusCode).toBe(400);
        expect(response6.body).not.toHaveProperty("meta");
        expect(response6.body).not.toHaveProperty("data");
        expect(response6.body).toHaveProperty("status", 400);
        expect(response6.body).toHaveProperty("code");
        expect(response6.body).toHaveProperty("detail");

        const response7 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: { number: 2, size: "B" },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response7.statusCode).toBe(400);
        expect(response7.body).not.toHaveProperty("meta");
        expect(response7.body).not.toHaveProperty("data");
        expect(response7.body).toHaveProperty("status", 400);
        expect(response7.body).toHaveProperty("code");
        expect(response7.body).toHaveProperty("detail");
      });

      test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
        const response0 = await request(usedHost)
          .get(`/date`)
          .query({
            page: { number: 1, size: 2 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response0.statusCode).toBe(401);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 401);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with error 422 and an error with a message if the transport company/route does not exist.", async () => {
        const response0 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 2 },
            companyId: 9999999,
            routeId: testRoute0.id,
          });
        expect(response0.statusCode).toBe(422);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 422);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .get(`/date`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 2 },
            companyId: testCompany0.id,
            routeId: 9999999,
          });
        expect(response1.statusCode).toBe(422);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 422);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");
      });
    });
  });

  describe("2. Hours and tariffs - WEB Transport Routes configuration API points: ", () => {

    describe("POST /route/hour ", () => {
      test("Should respond with status 201 and the new object (data) after creating a the hours/tariffs for one transport route.", async () => {
        const response0 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send(testHour0);
        expect(response0.statusCode).toBe(201);
        expect(response0.body).toHaveProperty("meta");
        expect(response0.body.meta).toBe(null);
        expect(response0.body).toHaveProperty("data");
        expect(response0.body.data).toHaveProperty("id");
        testHour0.id = response0.body.data.id;
        editHour0.id = response0.body.data.id;

        const response1 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send(testHour1);
        expect(response1.statusCode).toBe(201);
        expect(response1.body).toHaveProperty("meta");
        expect(response1.body.meta).toBe(null);
        expect(response1.body).toHaveProperty("data");
        expect(response1.body.data).toHaveProperty("id");
        testHour1.id = response1.body.data.id;
        editHour1.id = response1.body.data.id;
      });

      test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
        const response2 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send({
            ...testHour0,
            companyId: "must be a number",
          });
        expect(response2.statusCode).toBe(400);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 400);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");

        // 4. ----------------------------------------------
        const response5 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send({
            ...testHour0,
            routeId: "must be a number",
          });
        expect(response5.statusCode).toBe(400);
        expect(response5.body).not.toHaveProperty("meta");
        expect(response5.body).not.toHaveProperty("data");
        expect(response5.body).toHaveProperty("status", 400);
        expect(response5.body).toHaveProperty("code");
        expect(response5.body).toHaveProperty("detail");

        // 6. ----------------------------------------------
        const response7 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send({
            ...testHour0,
            timetableId: "must be a number",
          });
        expect(response7.statusCode).toBe(400);
        expect(response7.body).not.toHaveProperty("meta");
        expect(response7.body).not.toHaveProperty("data");
        expect(response7.body).toHaveProperty("status", 400);
        expect(response7.body).toHaveProperty("code");
        expect(response7.body).toHaveProperty("detail");

        // 7. ----------------------------------------------
        const response8 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send({
            ...testHour0,
            hour: -5,
          });
        expect(response8.statusCode).toBe(400);
        expect(response8.body).not.toHaveProperty("meta");
        expect(response8.body).not.toHaveProperty("data");
        expect(response8.body).toHaveProperty("status", 400);
        expect(response8.body).toHaveProperty("code");
        expect(response8.body).toHaveProperty("detail");

        // 8. ----------------------------------------------
        const response10 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send({
            ...testHour0,
            tariff: -5,
          });
        expect(response10.statusCode).toBe(400);
        expect(response10.body).not.toHaveProperty("meta");
        expect(response10.body).not.toHaveProperty("data");
        expect(response10.body).toHaveProperty("status", 400);
        expect(response10.body).toHaveProperty("code");
        expect(response10.body).toHaveProperty("detail");

        // 9. ----------------------------------------------
        const response9 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send(testHour0);
        expect(response9.statusCode).toBe(400);
        expect(response9.body).not.toHaveProperty("meta");
        expect(response9.body).not.toHaveProperty("data");
        expect(response9.body).toHaveProperty("status", 400);
        expect(response9.body).toHaveProperty("code");
        expect(response9.body).toHaveProperty("detail");
      });

      test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
        const response0 = await request(usedHost).post("/hour");
        expect(response0.statusCode).toBe(401);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 401);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with status 422 and an error with a message if the transport company/route/date does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send({
            ...testHour0,
            companyId: 99999,
          });
        expect(response0.statusCode).toBe(422);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 422);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send({
            ...testHour0,
            routeId: 99999,
          });
        expect(response1.statusCode).toBe(422);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 422);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");

        const response2 = await request(usedHost)
          .post("/hour")
          .set(requestHeaders)
          .send({
            ...testHour0,
            timetableId: 99999,
          });
        expect(response2.statusCode).toBe(422);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 422);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");
      });
    });

    describe("POST /route/hour/edit ", () => {
      test("Should respond with status 200 and the edited object (data).", async () => {
        // 1. -------------------------------------------------
        const response0 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send(editHour0);
        expect(response0.statusCode).toBe(200);
        expect(response0.body).toHaveProperty("meta");
        expect(response0.body.meta).toBe(null);
        expect(response0.body).toHaveProperty("data");
        expect(response0.body.data).toHaveProperty("id");
        expect(response0.body.data).toHaveProperty("hour");
        expect(response0.body.data).toHaveProperty("tariff");
        expect(response0.body.data.tariff).toBe(editHour0.tariff);

        // 2. -------------------------------------------------
        const response1 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send(editHour1);
        expect(response1.statusCode).toBe(200);
        expect(response1.body).toHaveProperty("meta");
        expect(response1.body.meta).toBe(null);
        expect(response1.body).toHaveProperty("data");
        expect(response1.body.data).toHaveProperty("id");
        expect(response1.body.data).toHaveProperty("hour");
        expect(response1.body.data).toHaveProperty("tariff");
        expect(response1.body.data.tariff).toBe(editHour1.tariff);
      });

      test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
        // 1. -------------------------------------
        const response0 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour0,
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
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour0,
            companyId: -5,
          });
        expect(response2.statusCode).toBe(400);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 400);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");

        // 3. -------------------------------------
        const response3 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour0,
            routeId: -5,
          });
        expect(response3.statusCode).toBe(400);
        expect(response3.body).not.toHaveProperty("meta");
        expect(response3.body).not.toHaveProperty("data");
        expect(response3.body).toHaveProperty("status", 400);
        expect(response3.body).toHaveProperty("code");
        expect(response3.body).toHaveProperty("detail");

        // 5. -------------------------------------
        const response6 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour0,
            timetableId: -5,
          });
        expect(response6.statusCode).toBe(400);
        expect(response6.body).not.toHaveProperty("meta");
        expect(response6.body).not.toHaveProperty("data");
        expect(response6.body).toHaveProperty("status", 400);
        expect(response6.body).toHaveProperty("code");
        expect(response6.body).toHaveProperty("detail");

        // 6. -------------------------------------
        const response7 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour0,
            hour: -5,
          });
        expect(response7.statusCode).toBe(400);
        expect(response7.body).not.toHaveProperty("meta");
        expect(response7.body).not.toHaveProperty("data");
        expect(response7.body).toHaveProperty("status", 400);
        expect(response7.body).toHaveProperty("code");
        expect(response7.body).toHaveProperty("detail");

        // 7. -------------------------------------
        const response8 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour0,
            tariff: -5,
          });
        expect(response8.statusCode).toBe(400);
        expect(response8.body).not.toHaveProperty("meta");
        expect(response8.body).not.toHaveProperty("data");
        expect(response8.body).toHaveProperty("status", 400);
        expect(response8.body).toHaveProperty("code");
        expect(response8.body).toHaveProperty("detail");
      });

      test("Should fail with error 400 and an error if the date of transport route exists in advance.", async () => {
        const response7 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour0,
            id: editHour1.id,
          });
        expect(response7.statusCode).toBe(400);
        expect(response7.body).not.toHaveProperty("meta");
        expect(response7.body).not.toHaveProperty("data");
        expect(response7.body).toHaveProperty("status", 400);
        expect(response7.body).toHaveProperty("code");
        expect(response7.body).toHaveProperty("detail");
      });

      test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
        const response0 = await request(usedHost)
          .post("/hour/edit")
          .send(editHour0);
        expect(response0.statusCode).toBe(401);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 401);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with status 404 and an error with a message if the id does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour1,
            id: 99999,
          });
        expect(response0.statusCode).toBe(404);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 404);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with status 422 and an error with a message if the transport company/route/date does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour1,
            companyId: 99999,
          });
        expect(response0.statusCode).toBe(422);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 422);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour1,
            routeId: 99999,
          });
        expect(response1.statusCode).toBe(422);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 422);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");

        const response2 = await request(usedHost)
          .post("/hour/edit")
          .set(requestHeaders)
          .send({
            ...editHour1,
            timetableId: 99999,
          });
        expect(response2.statusCode).toBe(422);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 422);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");
      });
    });

    describe("GET /route/hour ", () => {
      test("Should respond with status 200 and a list of objects containing the hours/tariffs of transport routes.", async () => {
        const response0 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 2000 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
            timetableId: testDate0.id,
          });
        expect(response0.statusCode).toBe(200);
        expect(response0.body).toHaveProperty("meta");
        expect(response0.body.meta).toHaveProperty("page");
        expect(response0.body.meta).toHaveProperty("pageSize");
        expect(response0.body.meta).toHaveProperty("totalRecords");
        expect(response0.body.meta.page).toBe(1);
        expect(response0.body.meta.pageSize).toBe(2000);
        expect(response0.body).toHaveProperty("data");
        expect(response0.body.data).toEqual(expect.any(Array));
        expect(response0.body.data[0]).toHaveProperty("id");
        expect(response0.body.data[0]).toHaveProperty("hour");
        expect(response0.body.data[0]).toHaveProperty("tariff");
        for (let index = 0; index < response0.body.meta.totalRecords; index++) {
          hoursIdExcel.push(response0.body.data[index].id);
        }
      });

      test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
        const response0 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 200000, size: 100 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
            timetableId: testDate0.id,
          });
        expect(response0.statusCode).toBe(200);
        expect(response0.body).toHaveProperty("meta");
        expect(response0.body.meta.page).toBe(200000);
        expect(response0.body.meta.pageSize).toBe(100);
        expect(response0.body.meta).toHaveProperty("message");
        expect(response0.body).toHaveProperty("data");
        expect(response0.body.data).toEqual(expect.any(Array));
        expect(response0.body.data.length).toBe(0);
      });

      test("Disabled - Should respond with status 200 and an empty array, because there are no hours/tariffs registered.", async () => {
        // const response0 = await request(usedHost)
        //   .get(`/hour`)
        //   .set(requestHeaders)
        //   .query({
        //     page: { number: 1, size: 2 },
        //     companyId: testCompany0.id,
        //     routeId: testRoute0.id,
        //     timetableId: testDate0.id, });
        // expect(response0.statusCode).toBe(200);
        // expect(response0.body).toHaveProperty("meta");
        // expect(response0.body.meta.page).toBe(1);
        // expect(response0.body.meta.pageSize).toBe(2);
        // expect(response0.body.meta).toHaveProperty("message");
        // expect(response0.body).toHaveProperty("data");
        // expect(response0.body.data).toEqual(expect.any(Array));
        // expect(response0.body.data.length).toBe(0);
      });

      test("Should fail with status 400 and an error with a message if no pagination is provided.", async () => {
        const response0 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders);
        expect(response0.statusCode).toBe(400);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 400);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: {},
            companyId: testCompany0.id,
            routeId: testRoute0.id,
            timetableId: testDate0.id,
          });
        expect(response1.statusCode).toBe(400);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 400);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");

        const response2 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 1 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
            timetableId: testDate0.id,
          });
        expect(response2.statusCode).toBe(400);
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 400);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");

        const response3 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { size: 1 },
            companyId: testCompany0.id,
            routeId: testRoute0.id,
            timetableId: testDate0.id,
          });
        expect(response3.statusCode).toBe(400);
        expect(response3.body).not.toHaveProperty("meta");
        expect(response3.body).not.toHaveProperty("data");
        expect(response3.body).toHaveProperty("status", 400);
        expect(response3.body).toHaveProperty("code");
        expect(response3.body).toHaveProperty("detail");

        const response4 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 0, size: 1 },
            companyId: testCompany0.id,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
          });
        expect(response4.statusCode).toBe(400);
        expect(response4.body).not.toHaveProperty("meta");
        expect(response4.body).not.toHaveProperty("data");
        expect(response4.body).toHaveProperty("status", 400);
        expect(response4.body).toHaveProperty("code");
        expect(response4.body).toHaveProperty("detail");

        const response5 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 0 },
            companyId: testCompany0.id,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
          });
        expect(response5.statusCode).toBe(400);
        expect(response5.body).not.toHaveProperty("meta");
        expect(response5.body).not.toHaveProperty("data");
        expect(response5.body).toHaveProperty("status", 400);
        expect(response5.body).toHaveProperty("code");
        expect(response5.body).toHaveProperty("detail");

        const response6 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: "A", size: 2 },
            companyId: testCompany0.id,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
          });
        expect(response6.statusCode).toBe(400);
        expect(response6.body).not.toHaveProperty("meta");
        expect(response6.body).not.toHaveProperty("data");
        expect(response6.body).toHaveProperty("status", 400);
        expect(response6.body).toHaveProperty("code");
        expect(response6.body).toHaveProperty("detail");

        const response7 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 2, size: "B" },
            companyId: testCompany0.id,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
          });
        expect(response7.statusCode).toBe(400);
        expect(response7.body).not.toHaveProperty("meta");
        expect(response7.body).not.toHaveProperty("data");
        expect(response7.body).toHaveProperty("status", 400);
        expect(response7.body).toHaveProperty("code");
        expect(response7.body).toHaveProperty("detail");

        const response8 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 2 },
            companyId: -5,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
          });
        expect(response8.statusCode).toBe(400);
        expect(response8.body).not.toHaveProperty("meta");
        expect(response8.body).not.toHaveProperty("data");
        expect(response8.body).toHaveProperty("status", 400);
        expect(response8.body).toHaveProperty("code");
        expect(response8.body).toHaveProperty("detail");

        const response9 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 2 },
            companyId: testCompany0.id,
            timetableId: -5,
            routeId: testRoute0.id,
          });
        expect(response9.statusCode).toBe(400);
        expect(response9.body).not.toHaveProperty("meta");
        expect(response9.body).not.toHaveProperty("data");
        expect(response9.body).toHaveProperty("status", 400);
        expect(response9.body).toHaveProperty("code");
        expect(response9.body).toHaveProperty("detail");

        const response10 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 2 },
            companyId: testCompany0.id,
            timetableId: testDate0.id,
            routeId: -5,
          });
        expect(response10.statusCode).toBe(400);
        expect(response10.body).not.toHaveProperty("meta");
        expect(response10.body).not.toHaveProperty("data");
        expect(response10.body).toHaveProperty("status", 400);
        expect(response10.body).toHaveProperty("code");
        expect(response10.body).toHaveProperty("detail");
      });

      test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
        const response0 = await request(usedHost)
          .get(`/hour`)
          .query({
            page: { number: 1, size: 2 },
            companyId: testCompany0.id,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
          });
        expect(response0.statusCode).toBe(401);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 401);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with error 422 and an error with a message if the transport company/route/date does not exist.", async () => {
        const response0 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 2 },
            companyId: 9999999,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
          });
        expect(response0.statusCode).toBe(422);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 422);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 2 },
            companyId: testCompany0.id,
            timetableId: testDate0.id,
            routeId: 9999999,
          });
        expect(response1.statusCode).toBe(422);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 422);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");

        const response2 = await request(usedHost)
          .get(`/hour`)
          .set(requestHeaders)
          .query({
            page: { number: 1, size: 2 },
            companyId: testCompany0.id,
            timetableId: 9999999,
            routeId: testRoute0.id,
          });
        expect(response2.statusCode).toBe(422);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 422);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");
      });
    });

    describe("GET /route/itinerary        - Get route with timetables", () => {
      test("Should respond with status 200 and a get of object containing the date/hours/tariffs of one transport routes.", async () => {
        const response0 = await request(usedHost)
          .get(`/itinerary`)
          .set(requestHeaders)
          .query({
            routeId: testRoute0.id,
          });
        expect(response0.statusCode).toBe(200);
        expect(response0.body).toHaveProperty("meta");
        expect(response0.body).toHaveProperty("data");
        expect(response0.body.data).toHaveProperty("id");
        expect(response0.body.data).toHaveProperty("origin");
        expect(response0.body.data).toHaveProperty("destination");
        expect(response0.body.data).toHaveProperty("companyId");
        expect(response0.body.data).toHaveProperty("duration");
        expect(response0.body.data).toHaveProperty("RouteTimetables");
        expect(response0.body.data.RouteTimetables).toEqual(expect.any(Array));
        expect(response0.body.data.RouteTimetables[0]).toHaveProperty("id");
        expect(response0.body.data.RouteTimetables[0]).toHaveProperty("date");
        expect(response0.body.data.RouteTimetables[0]).toHaveProperty("routeId");
        expect(response0.body.data.RouteTimetables[0]).toHaveProperty("RouteTimetableHourTariffs");
        expect(response0.body.data.RouteTimetables[0].RouteTimetableHourTariffs).toEqual(expect.any(Array));
        expect(response0.body.data.RouteTimetables[0].RouteTimetableHourTariffs[0]).toHaveProperty("id");
        expect(response0.body.data.RouteTimetables[0].RouteTimetableHourTariffs[0]).toHaveProperty("timetableId");
        expect(response0.body.data.RouteTimetables[0].RouteTimetableHourTariffs[0]).toHaveProperty("hour");
        expect(response0.body.data.RouteTimetables[0].RouteTimetableHourTariffs[0]).toHaveProperty("tariff");
      });

      test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
        const response0 = await request(usedHost)
          .get(`/itinerary`)
          .set(requestHeaders)
          .query({
            routeId: -5,
          });
        expect(response0.statusCode).toBe(400);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 400);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
        const response0 = await request(usedHost).get(`/itinerary`).query({
          routeId: testRoute0.id,
        });
        expect(response0.statusCode).toBe(401);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 401);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with status 404 and an error with a message if the id does not exist.", async () => {
        const response0 = await request(usedHost)
          .get(`/itinerary`)
          .set(requestHeaders)
          .query({
            routeId: 9999999,
          });
        expect(response0.statusCode).toBe(404);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 404);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });
    });
  });

  describe("3. Delete dates/hours and the (test) transport company/routes created. ", () => {

    describe("POST /transport_company/route/hour/delete ", () => {
      test("Should respond with status 200 and the hours/tariffs id deleted.", async () => {
        for (let index = 0; index < hoursIdExcel.length; index++) {
          const response2 = await request(usedHost)
            .post("/hour/delete")
            .set(requestHeaders)
            .send({
              id: hoursIdExcel[index],
              companyId: testCompany0.id,
              routeId: testRoute0.id,
              timetableId: testDate0.id,
            });
          expect(response2.statusCode).toBe(200);
          expect(response2.body).toHaveProperty("meta");
          expect(response2.body.meta).toBe(null);
          expect(response2.body).toHaveProperty("data");
          expect(response2.body.data).toEqual(
            expect.objectContaining({
              id: hoursIdExcel[index],
              routeId: testRoute0.id,
              timetableId: testDate0.id,
              companyId: testCompany0.id,
            })
          );
        }
      });

      test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
        const response0 = await request(usedHost)
          .post("/hour/delete")
          .set(requestHeaders)
          .send({
            id: "",
            companyId: testCompany0.id,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
          });
        expect(response0.statusCode).toBe(400);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 400);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .post("/hour/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            companyId: -5,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
          });
        expect(response1.statusCode).toBe(400);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 400);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");

        const response4 = await request(usedHost)
          .post("/hour/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            companyId: testCompany0.id,
            timetableId: testDate0.id,
            routeId: -5,
          });
        expect(response4.statusCode).toBe(400);
        expect(response4.body).not.toHaveProperty("meta");
        expect(response4.body).not.toHaveProperty("data");
        expect(response4.body).toHaveProperty("status", 400);
        expect(response4.body).toHaveProperty("code");
        expect(response4.body).toHaveProperty("detail");

        const response2 = await request(usedHost)
          .post("/hour/delete")
          .set(requestHeaders)
          .send({
            id: -5,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
            companyId: testCompany0.id,
          });
        expect(response2.statusCode).toBe(400);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 400);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");

        const response3 = await request(usedHost)
          .post("/hour/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            companyId: testCompany0.id,
            routeId: testRoute0.id,
            timetableId: -5,
          });
        expect(response3.statusCode).toBe(400);
        expect(response3.body).not.toHaveProperty("meta");
        expect(response3.body).not.toHaveProperty("data");
        expect(response3.body).toHaveProperty("status", 400);
        expect(response3.body).toHaveProperty("code");
        expect(response3.body).toHaveProperty("detail");
      });

      test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
        const response0 = await request(usedHost).post("/hour/delete");
        expect(response0.statusCode).toBe(401);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 401);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with status 404 and an error with a message if the id does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/hour/delete")
          .set(requestHeaders)
          .send({
            id: 999,
            routeId: testRoute0.id,
            timetableId: testDate0.id,
            companyId: testCompany0.id,
          });
        expect(response0.statusCode).toBe(404);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 404);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with error 422 and an error with a message if the transport company/route/date does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/hour/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            routeId: 999999,
            timetableId: testDate0.id,
            companyId: testCompany0.id,
          });
        expect(response0.statusCode).toBe(422);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 422);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .post("/hour/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            timetableId: testDate0.id,
            routeId: testRoute0.id,
            companyId: 999999,
          });
        expect(response1.statusCode).toBe(422);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 422);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");

        const response2 = await request(usedHost)
          .post("/hour/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            companyId: testCompany0.id,
            routeId: testRoute0.id,
            timetableId: 999999,
          });
        expect(response2.statusCode).toBe(422);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 422);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");
      });
    });

    describe("POST /transport_company/route/date/delete ", () => {
      test("Should respond with status 200 and the date id deleted.", async () => {
        for (let index = 0; index < datesIdExcel.length; index++) {
          const response2 = await request(usedHost)
            .post("/date/delete")
            .set(requestHeaders)
            .send({
              id: datesIdExcel[index],
              companyId: testCompany0.id,
              routeId: testRoute0.id,
            });
          expect(response2.statusCode).toBe(200);
          expect(response2.body).toHaveProperty("meta");
          expect(response2.body.meta).toBe(null);
          expect(response2.body).toHaveProperty("data");
          expect(response2.body.data).toEqual(
            expect.objectContaining({
              id: datesIdExcel[index],
              routeId: testRoute0.id,
              companyId: testCompany0.id,
            })
          );
        }
      });

      test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
        const response0 = await request(usedHost)
          .post("/date/delete")
          .set(requestHeaders)
          .send({
            id: "",
            companyId: testCompany0.id,
            routeId: testRoute0.id,
          });
        expect(response0.statusCode).toBe(400);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 400);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .post("/date/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            companyId: -5,
            routeId: testRoute0.id,
          });
        expect(response1.statusCode).toBe(400);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 400);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");

        const response4 = await request(usedHost)
          .post("/date/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            companyId: testCompany0.id,
            routeId: -5,
          });
        expect(response4.statusCode).toBe(400);
        expect(response4.body).not.toHaveProperty("meta");
        expect(response4.body).not.toHaveProperty("data");
        expect(response4.body).toHaveProperty("status", 400);
        expect(response4.body).toHaveProperty("code");
        expect(response4.body).toHaveProperty("detail");

        const response2 = await request(usedHost)
          .post("/date/delete")
          .set(requestHeaders)
          .send({
            id: -5,
            routeId: testRoute0.id,
            companyId: testCompany0.id,
          });
        expect(response2.statusCode).toBe(400);
        expect(response2.body).not.toHaveProperty("meta");
        expect(response2.body).not.toHaveProperty("data");
        expect(response2.body).toHaveProperty("status", 400);
        expect(response2.body).toHaveProperty("code");
        expect(response2.body).toHaveProperty("detail");

        const response3 = await request(usedHost)
          .post("/date/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            routeId: testRoute0.id,
            companyId: -5,
          });
        expect(response3.statusCode).toBe(400);
        expect(response3.body).not.toHaveProperty("meta");
        expect(response3.body).not.toHaveProperty("data");
        expect(response3.body).toHaveProperty("status", 400);
        expect(response3.body).toHaveProperty("code");
        expect(response3.body).toHaveProperty("detail");
      });

      test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
        const response0 = await request(usedHost).post("/date/delete");
        expect(response0.statusCode).toBe(401);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 401);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with status 404 and an error with a message if the id does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/date/delete")
          .set(requestHeaders)
          .send({
            id: 999,
            routeId: testRoute0.id,
            companyId: testCompany0.id,
          });
        expect(response0.statusCode).toBe(404);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 404);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");
      });

      test("Should fail with error 422 and an error with a message if the transport company/route does not exist.", async () => {
        const response0 = await request(usedHost)
          .post("/date/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            routeId: 999999,
            companyId: testCompany0.id,
          });
        expect(response0.statusCode).toBe(422);
        expect(response0.body).not.toHaveProperty("meta");
        expect(response0.body).not.toHaveProperty("data");
        expect(response0.body).toHaveProperty("status", 422);
        expect(response0.body).toHaveProperty("code");
        expect(response0.body).toHaveProperty("detail");

        const response1 = await request(usedHost)
          .post("/date/delete")
          .set(requestHeaders)
          .send({
            id: testDate0.id,
            routeId: testRoute0.id,
            companyId: 999999,
          });
        expect(response1.statusCode).toBe(422);
        expect(response1.body).not.toHaveProperty("meta");
        expect(response1.body).not.toHaveProperty("data");
        expect(response1.body).toHaveProperty("status", 422);
        expect(response1.body).toHaveProperty("code");
        expect(response1.body).toHaveProperty("detail");
      });
    });

    describe("POST /transport_company/route/delete ", () => {
      test("Should respond with status 200 and the transport route id deleted.", async () => {
        const response1 = await request(
          `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route`
        )
          .post("/delete")
          .set(requestHeaders)
          .send({
            id: testRoute0.id,
            companyId: testCompany0.id,
          });
        expect(response1.statusCode).toBe(200);
      });
    });

    describe("POST /transport_company/delete ", () => {
      test("Should respond with status 200 and the transport company id deleted.", async () => {
        const response0 = await request(
          `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company`
        )
          .post("/delete")
          .set(requestHeaders)
          .send({
            id: testCompany0.id,
          });
        expect(response0.statusCode).toBe(200);
      });
    });
  });
});

