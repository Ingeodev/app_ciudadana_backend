const request = require("supertest");
const { v4: uuidV4 } = require("uuid");
const path = require("path");
const constant = require("../../../microservices/thirdParties/constant.json");
const caliCityCode = constant.CALI_CITY_CODE;

const usedHost = `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company/route`;

describe("WEB Transport Routes configuration API points: ", () => {
  jest.setTimeout(90000);

  const sleepNow = async (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const generateAlphanumeric = () => {
    return uuidV4().replace(/-/g, "");
  };

  const filesPath = path.resolve(
    path.join("__tests__", "thirdParties", "web", "__testFiles__")
  );

  const nameExcelFile = "Plantilla_Registro_Rutas_de_Transporte";
  const creationXlsx = path.join(filesPath, `${nameExcelFile}.xlsx`);
  const creationXls = path.join(filesPath, `${nameExcelFile}.xls`);
  const powerpoint = path.join(filesPath, "PowerPoint.pptx");
  const word = path.join(filesPath, "Word.docx");

  const min = 1000000;
  const max = 9000000;
  let caliObj = undefined;
  let pereiraObj = undefined;
  let calimaObj = undefined;
  let testRoute0 = undefined;
  let testRoute1 = undefined;
  let editRoute0 = undefined;
  let editRoute1 = undefined;
  let routesIdExcel = [];


  const testCompany0 = {
    name: generateAlphanumeric(),
    nit: `${Math.floor(Math.random() * (max - min + 1)) + min}-1`,
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
      .send(global.firebaseTestWebUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken;
  });

  describe("Create a (test) transport company and search for the cities of Cali, Pereira, and California. ", () => {
    test("Should respond with status 200.", async () => {
      // Create a test transport company
      const response0 = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company`
      )
        .post("/")
        .set(requestHeaders)
        .send(testCompany0);
      expect(response0.body.data).toHaveProperty("id");
      testCompany0.id = response0.body.data.id;

      // Search the id of the city of Cali, Valle del Cauca, Colombia.
      const response1 = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/city`
      )
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 100 }, q: "CALI" });
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
      expect(response2.body).toHaveProperty("meta");
      expect(response2.body.meta).toHaveProperty("totalRecords");
      expect(response2.body.meta).toHaveProperty("pageSize");
      expect(response2.body).toHaveProperty("data");
      expect(response2.body.data).toEqual(expect.any(Array));
      pereiraObj = response2.body.data.find((item) => item.city === "PEREIRA");
      expect(Number.isInteger(pereiraObj.cityCode)).toBe(true);

      testRoute0 = {
        companyId: testCompany0.id,
        originId: caliObj.id,
        destinationId: pereiraObj.id,
        duration: "02:00",
      };

      testRoute1 = {
        companyId: testCompany0.id,
        originId: pereiraObj.id,
        destinationId: caliObj.id,
        duration: "02:00",
      };

      editRoute0 = {
        companyId: testCompany0.id,
        originId: caliObj.id,
        destinationId: pereiraObj.id,
        duration: "04:00",
      };

      editRoute1 = {
        companyId: testCompany0.id,
        originId: pereiraObj.id,
        destinationId: caliObj.id,
        duration: "04:00",
      };
    });
  });

  describe("POST /route/ ", () => {
    test("Should respond with status 201 and the new object (data) after creating a new transport route.", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testRoute0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      testRoute0.id = response0.body.data.id;
      editRoute0.id = response0.body.data.id;

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testRoute1);
      expect(response1.statusCode).toBe(201);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("id");
      testRoute1.id = response1.body.data.id;
      editRoute1.id = response1.body.data.id;
    });

    test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
      const response2 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testRoute0,
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
        .post("/")
        .set(requestHeaders)
        .send({
          ...testRoute0,
          originId: "must be a number",
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // 6. ----------------------------------------------
      const response7 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testRoute0,
          destinationId: "must be a number",
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
          ...testRoute0,
          duration: -5,
        });
      expect(response8.statusCode).toBe(400);
      expect(response8.body).not.toHaveProperty("meta");
      expect(response8.body).not.toHaveProperty("data");
      expect(response8.body).toHaveProperty("status", 400);
      expect(response8.body).toHaveProperty("code");
      expect(response8.body).toHaveProperty("detail");

      // 8. ----------------------------------------------
      const response9 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testRoute0);
      expect(response9.statusCode).toBe(400);
      expect(response9.body).not.toHaveProperty("meta");
      expect(response9.body).not.toHaveProperty("data");
      expect(response9.body).toHaveProperty("status", 400);
      expect(response9.body).toHaveProperty("code");
      expect(response9.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).post("/");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Should fail with status 404 and an error with a message if the transport company does not exist.", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testRoute0,
          companyId: 99999,
        });
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Should fail with status 422 and an error with a message if the origin/destination city does not exist.", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testRoute0,
          originId: 99999,
        });
      expect(response0.statusCode).toBe(422);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 422);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testRoute0,
          destinationId: 99999,
        });
      expect(response1.statusCode).toBe(422);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 422);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("Should fail with status 422 and an error with a message, given that only routes to and from Cali, Valle del Cauca are allowed.", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testRoute0,
          originId: pereiraObj.id,
          destinationId: calimaObj.id,
        });
      expect(response0.statusCode).toBe(422);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 422);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Should fail with status 422 and an error with a message, given that origin and destination are the same.", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testRoute0,
          originId: caliObj.id,
          destinationId: caliObj.id,
        });
      expect(response0.statusCode).toBe(422);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 422);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /route/edit ", () => {
    test("Should respond with status 200 and the edited object (data).", async () => {
      // 1. -------------------------------------------------
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send(editRoute0);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data).toHaveProperty("origin");
      expect(response0.body.data).toHaveProperty("destination");
      expect(response0.body.data.duration).toBe(editRoute0.duration);

      // 2. -------------------------------------------------
      const response1 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send(editRoute1);
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("id");
      expect(response1.body.data).toHaveProperty("origin");
      expect(response1.body.data).toHaveProperty("destination");
      expect(response1.body.data.duration).toBe(editRoute1.duration);
    });

    test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
      // 1. -------------------------------------
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editRoute0,
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
          ...editRoute0,
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
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editRoute0,
          originId: -5,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 5. -------------------------------------
      const response6 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editRoute0,
          destinationId: -5,
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // 6. -------------------------------------
      const response7 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editRoute0,
          duration: -5,
        });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");
    });

    test("Should fail with error 400 and an error if the transport route exists in advance.", async () => {
      const response7 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editRoute0,
          id: editRoute1.id,
        });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).post("/edit").send(editRoute0);
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Should fail with status 404 and an error with a message if the id does not exist.", async () => {
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editRoute1,
          id: 999,
        });
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Should fail with status 404 and an error with a message if the transport company does not exist.", async () => {
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editRoute1,
          companyId: 99999,
        });
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /route/excel ", () => {
    test("Should respond with status 201 and the number of successes and failures.", async () => {
      const response0 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", creationXlsx)
        .field("companyId", testCompany0.id);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toHaveProperty("numSuccess");
      expect(response0.body.meta).toHaveProperty("numErrors");
      expect(response0.body.meta).toHaveProperty("companyId");
      expect(response0.body.meta.companyId).toBe(testCompany0.id);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("success");
      expect(response0.body.data.success).toEqual(expect.any(Array));
      expect(response0.body.data.success.length).toBe(
        response0.body.meta.numSuccess
      );
      expect(response0.body.data).toHaveProperty("errors");
      expect(response0.body.data.errors).toEqual(expect.any(Array));
      expect(response0.body.data.errors.length).toBe(
        response0.body.meta.numErrors
      );

      const response1 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", creationXls)
        .field("companyId", testCompany0.id);
      expect(response1.statusCode).toBe(201);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toHaveProperty("numSuccess");
      expect(response1.body.meta).toHaveProperty("numErrors");
      expect(response1.body.meta).toHaveProperty("companyId");
      expect(response1.body.meta.companyId).toBe(testCompany0.id);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("success");
      expect(response1.body.data.success).toEqual(expect.any(Array));
      expect(response1.body.data.success.length).toBe(
        response1.body.meta.numSuccess
      );
      expect(response1.body.data).toHaveProperty("errors");
      expect(response1.body.data.errors).toEqual(expect.any(Array));
      expect(response1.body.data.errors.length).toBe(
        response1.body.meta.numErrors
      );
    });

    test("Should fail with error 400 and a message if 'file' is not passed.", async () => {
      const response0 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .field("companyId", testCompany0.id);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Should fail with error 400 and a message if 'file' is not excel (xls or xlsx).", async () => {
      const response0 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", word)
        .field("companyId", testCompany0.id);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", powerpoint)
        .field("companyId", testCompany0.id);
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("Should respond with status 400 and a message if the companyId is not well formatted..", async () => {
      const response0 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", creationXlsx)
        .field("companyId", "must be a number");
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Disabled [Bug - read ECONNRESET] - Should fail with error 401 and a message if Authorization header is not set.", async () => {
      // await sleepNow(2000);
      // const response0 = await request(usedHost)
      //   .post("/excel")
      //   .attach("file", creationXlsx)
      //   .field("companyId", testCompany0.id);
      // expect(response0.statusCode).toBe(401);
      // expect(response0.body).not.toHaveProperty("data");
      // expect(response0.body).toHaveProperty("status", 401);
      // expect(response0.body).toHaveProperty("code");
      // expect(response0.body).toHaveProperty("detail");
    });

    test("Should respond with status 404 and a message if the company not found.", async () => {
      const response0 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", creationXlsx)
        .field("companyId", 99999);
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /route/template ", () => {
    test("should respond with status 200 and the xlsx template (to create) of transport routes: .", async () => {
      const response0 = await request(usedHost)
        .get("/template")
        .set(requestHeaders);
      expect(response0.statusCode).toBe(200);
      expect(response0.headers).toHaveProperty(
        "content-type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    });

    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get("/template");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /route/ ", () => {
    test("Should respond with status 200 and a list of objects containing the transport routes.", async () => {
      const response0 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .set(requestHeaders)
        .query({ page: { number: 1, size: 2000 } });
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
      expect(response0.body.data[0]).toHaveProperty("origin");
      for (let index = 0; index < response0.body.meta.totalRecords; index++) {
        routesIdExcel.push(response0.body.data[index].id);
      }
    });

    test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
      const response0 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .set(requestHeaders)
        .query({ page: { number: 200000, size: 100 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta.page).toBe(200000);
      expect(response0.body.meta.pageSize).toBe(100);
      expect(response0.body.meta).toHaveProperty("message");
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(expect.any(Array));
      expect(response0.body.data.length).toBe(0);
    });

    test("Disabled - Should respond with status 200 and an empty array, because there are no transport routes registered.", async () => {
      // const response0 = await request(usedHost)
      //   .get(`/${testCompany0.id}`)
      //   .set(requestHeaders)
      //   .query({ page: { number: 1, size: 2 } });
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
        .get(`/${testCompany0.id}`)
        .set(requestHeaders);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .set(requestHeaders)
        .query({ page: {} });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      const response2 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .set(requestHeaders)
        .query({ page: { number: 1 } });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .set(requestHeaders)
        .query({ page: { size: 1 } });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      const response4 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .set(requestHeaders)
        .query({ page: { number: 0, size: 1 } });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      const response5 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .set(requestHeaders)
        .query({ page: { number: 1, size: 0 } });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      const response6 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .set(requestHeaders)
        .query({ page: { number: "A", size: 2 } });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      const response7 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .set(requestHeaders)
        .query({ page: { number: 2, size: "B" } });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .query({ page: { number: 1, size: 2 } });
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /route/companies ", () => {
    test("Should respond with status 200 and a list of objects containing the two transport companies with your routes.", async () => {
      const response0 = await request(usedHost)
        .get(`/companies`)
        .set(requestHeaders)
        .query({ page: { number: 1, size: 2 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta.page).toBe(1);
      expect(response0.body.meta.pageSize).toBe(2);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(expect.any(Array));
      expect(response0.body.data.length).toBe(2);
      expect(response0.body.data[0]).toHaveProperty("nit");
      expect(response0.body.data[0]).toHaveProperty("routes");
      expect(response0.body.data[1]).toHaveProperty("nit");
      expect(response0.body.data[1]).toHaveProperty("routes");
    });

    test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
      const response0 = await request(usedHost)
        .get(`/companies`)
        .set(requestHeaders)
        .query({ page: { number: 200000, size: 100 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta.page).toBe(200000);
      expect(response0.body.meta.pageSize).toBe(100);
      expect(response0.body.meta).toHaveProperty("message");
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(expect.any(Array));
      expect(response0.body.data.length).toBe(0);
    });

    test("Disabled - Should respond with status 200 and an empty array, because there are no transport companies registered.", async () => {
      // const response0 = await request(usedHost)
      //   .get(`/companies`)
      //   .set(requestHeaders)
      //   .query({ page: { number: 1, size: 2 } });
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
        .get(`/companies`)
        .set(requestHeaders);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .get(`/companies`)
        .set(requestHeaders)
        .query({ page: {} });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      const response2 = await request(usedHost)
        .get(`/companies`)
        .set(requestHeaders)
        .query({ page: { number: 1 } });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .get(`/companies`)
        .set(requestHeaders)
        .query({ page: { size: 1 } });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      const response4 = await request(usedHost)
        .get(`/companies`)
        .set(requestHeaders)
        .query({ page: { number: 0, size: 1 } });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      const response5 = await request(usedHost)
        .get(`/companies`)
        .set(requestHeaders)
        .query({ page: { number: 1, size: 0 } });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      const response6 = await request(usedHost)
        .get(`/companies`)
        .set(requestHeaders)
        .query({ page: { number: "A", size: 2 } });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      const response7 = await request(usedHost)
        .get(`/companies`)
        .set(requestHeaders)
        .query({ page: { number: 2, size: "B" } });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost)
        .get(`/companies`)
        .query({ page: { number: 1, size: 2 } });
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });
  describe("POST /route/delete ", () => {
    test("Should respond with status 200 and the transport route id deleted.", async () => {
      for (let index = 0; index < routesIdExcel.length; index++) {
        const response2 = await request(usedHost)
          .post("/delete")
          .set(requestHeaders)
          .send({
            id: routesIdExcel[index],
            companyId: testCompany0.id,
          });
        expect(response2.statusCode).toBe(200);
        expect(response2.body).toHaveProperty("meta");
        expect(response2.body.meta).toBe(null);
        expect(response2.body).toHaveProperty("data");
        expect(response2.body.data).toEqual(
          expect.objectContaining({
            id: routesIdExcel[index],
            companyId: testCompany0.id,
          })
        );
      }
    });

    test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
      const response0 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: "",
          companyId: testCompany0.id,
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: testRoute0.id,
          companyId: "",
        });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      const response2 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: -5,
          companyId: testCompany0.id,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: testRoute0.id,
          companyId: -5,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");
    });

    test("Should fail with status 404 and an error with a message if the id does not exist.", async () => {
      const response0 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: 999,
          companyId: testCompany0.id,
        });
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: testRoute0.id,
          companyId: 999999,
        });
      expect(response1.statusCode).toBe(404);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 404);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).post("/delete");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("Delete the (test) transport company created. ", () => {
    test("Should respond with status 200 and the transport company id deleted.", async () => {
      const response0 = await request(`${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/transport_company`)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: testCompany0.id,
        });
      expect(response0.statusCode).toBe(200);
    });
  });
});
