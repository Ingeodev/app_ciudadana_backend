const request = require("supertest");
const { v4: uuidV4 } = require("uuid");


const usedHost = `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/tourism_company_api`;
describe("Web API - Tourism Services management API points: ", () => {
  jest.setTimeout(30000);

  let requestHeaders = {
    "x-api-key": "",
  };

  let requestHeadersFirebase = {
    Authorization: "Bearer ",
  };

  const generateAlphanumeric = () => {
    return uuidV4().replace(/-/g, ""); // elimina los guiones
  };

  const lonCali = -76.52496476354585;
  const latCali = 3.4270331133664707;
  const min = 100000;
  const max = 900000;

  const testTourCat0 = {
    name: generateAlphanumeric(),
    color: "#AAFFBB",
    icon: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/" + global.testImageInStorage,
    iconMap: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/" + global.testImageInStorage,
  };
  
  let testCompany0 = undefined;
  let testService0 = undefined;
  let testService3 = undefined;
  let editService0 = undefined;
  let editService1 = undefined;
  let editService2 = undefined;

  testService0 = {
    services: [
      {
        service: generateAlphanumeric(),
      },
      {
        service: generateAlphanumeric(),
      },
      {
        service: generateAlphanumeric(),
      },
    ],
  };

  testService3 = {
    service: generateAlphanumeric(),
  };

  editService0 = {
    service: generateAlphanumeric(),
  };

  editService1 = {
    service: generateAlphanumeric(),
  };

  editService2 = {
    service: generateAlphanumeric(),
  }; 
  
  

  describe("Get the apiKey of one (test) tourism company. ", () => {
    test("Should respond with status 201 and the new object (data) after creating a new category/company.", async () => {
      // 
      const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
        .post("/accounts:signInWithPassword")
        .query({ key: global.firebaseKey })
        .send(global.firebaseTestWebUserLogin);
      expect(firebaseAuth.statusCode).toBe(200);
      requestHeadersFirebase.Authorization += firebaseAuth.body.idToken;

      // Create a test tourism category
      const response0 = await request(`${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/tourism_categories`)
        .post("/")
        .set(requestHeadersFirebase)
        .send(testTourCat0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body.data).toHaveProperty("id");
      testTourCat0.id = response0.body.data.id;

      testCompany0 = {
        name: generateAlphanumeric(),
        nit: `${Math.floor(Math.random() * (max - min + 1)) + min}-1`,
        categoryId: testTourCat0.id,
        description: "test description",
        phone: "3122334455",
        siteUri: 'http://test.site.url',
        address: "Calle 70 norte #17N-99",
        imageUri: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/" + global.testImageInStorage,
        lat: latCali,
        lon: lonCali,
      };

      // Create a test tourism company
      const response1 = await request(`${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/tourism_company`)
        .post("/")
        .set(requestHeadersFirebase)
        .send(testCompany0);
      expect(response1.statusCode).toBe(201);
      expect(response1.body.data).toHaveProperty("id");
      testCompany0.id = response1.body.data.id;

      // Get apiKey of tourism company
      const response2 = await request(
        `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/tourism_company/api_key`
      )
        .post("/")
        .set(requestHeadersFirebase)
        .send({ companyId: testCompany0.id });
      expect(response2.statusCode).toBe(201);
      expect(response2.body.data).toHaveProperty("apiKey");
      requestHeaders["x-api-key"] = response2.body.data.apiKey;
    });
  });

  describe("POST /tourism_company_api/services_bulk ", () => {
    test("Should respond with status 201 and the new object (data) after creating a new service.", async () => {
      const response0 = await request(usedHost)
        .post("/services_bulk")
        .set(requestHeaders)
        .send(testService0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data[0]).toHaveProperty("id");
      // testService0.services[0].id = response0.body.data[0].id;
      editService0.id = response0.body.data[0].id;
      editService1.id = response0.body.data[1].id;
      editService2.id = response0.body.data[2].id;
    });

    test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
      // 2. ----------------------------------------------
      const response3 = await request(usedHost)
        .post("/services_bulk")
        .set(requestHeaders)
        .send({
          services: [
            {
              service: -5,
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
        .post("/services_bulk")
        .set(requestHeaders)
        .send({
          services: [
            {
              service: -5,
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

      // 5. ----------------------------------------------
      const response6 = await request(usedHost)
        .post("/services_bulk")
        .set(requestHeaders)
        .send({
          services: undefined,
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      // 8. ----------------------------------------------
      const response9 = await request(usedHost)
        .post("/services_bulk")
        .set(requestHeaders);
      expect(response9.statusCode).toBe(400);
      expect(response9.body).not.toHaveProperty("meta");
      expect(response9.body).not.toHaveProperty("data");
      expect(response9.body).toHaveProperty("status", 400);
      expect(response9.body).toHaveProperty("code");
      expect(response9.body).toHaveProperty("detail");

      // 9. ----------------------------------------------
      const response0 = await request(usedHost)
        .post("/services_bulk")
        .set(requestHeaders)
        .send(testService0);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).post("/services_bulk");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /tourism_company_api/services/ ", () => {
    test("Should respond with status 200 and the edited object (data).", async () => {
      // 1. -------------------------------------------------
      const response0 = await request(usedHost)
        .post("/services/")
        .set(requestHeaders)
        .send(testService3);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data).toHaveProperty("service");
      expect(response0.body.data.service).toBe(testService3.service);
      testService3.id = response0.body.data.id;
    });

    test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
      // 2. -------------------------------------
      const response2 = await request(usedHost)
        .post("/services/")
        .set(requestHeaders)
        .send({
          ...testService3,
          service: -5,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 4. -------------------------------------
      const response4 = await request(usedHost)
        .post("/services/")
        .set(requestHeaders)
        .send({
          ...editService1,
          service: testService3.service,
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");
    });

    test("Should fail with status 400 and an error with a message if the service does not exist.", async () => {
      const response0 = await request(usedHost)
        .post("/services/")
        .set(requestHeaders)
        .send({
          ...testService3,
          id: 999,
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost)
        .post("/services/")
        .send(testService3);
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /tourism_company_api/services/edit ", () => {
    test("Should respond with status 200 and the edited object (data).", async () => {
      // 1. -------------------------------------------------
      const response0 = await request(usedHost)
        .post("/services/edit")
        .set(requestHeaders)
        .send(editService0);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data).toHaveProperty("service");
      expect(response0.body.data.service).toBe(editService0.service);
    });

    test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
      // 1. -------------------------------------
      const response0 = await request(usedHost)
        .post("/services/edit")
        .set(requestHeaders)
        .send({
          ...editService0,
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
        .post("/services/edit")
        .set(requestHeaders)
        .send({
          ...editService0,
          service: -5,
        });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      // 4. -------------------------------------
      const response4 = await request(usedHost)
        .post("/services/edit")
        .set(requestHeaders)
        .send({
          ...editService1,
          service: editService0.service,
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost)
        .post("/services/edit")
        .send(editService0);
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Should fail with status 404 and an error with a message if the service does not exist.", async () => {
      const response0 = await request(usedHost)
        .post("/services/edit")
        .set(requestHeaders)
        .send({
          ...editService0,
          id: 999,
        });
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /tourism_company_api/services ", () => {
    test("Should respond with status 200 and a array of services objects.", async () => {
      const response0 = await request(usedHost)
        .get(`/services`)
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
      expect(response0.body.data[0]).toHaveProperty("service");
      expect(response0.body.data[1]).toHaveProperty("id");
      expect(response0.body.data[1]).toHaveProperty("service");
    });

    test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
      const response0 = await request(usedHost)
        .get(`/services`)
        .set(requestHeaders)
        .query({ page: { number: 2000, size: 2 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta.page).toBe(2000);
      expect(response0.body.meta.pageSize).toBe(2);
      expect(response0.body.meta).toHaveProperty("message");
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(expect.any(Array));
      expect(response0.body.data.length).toBe(0);
    });

    test("Disabled - Should respond with status 200 and an empty array, because there are no services registered.", async () => {
      // const response0 = await request(usedHost)
      //   .get(`/services`)
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
      const response0 = await request(usedHost).get(`/services`).set(requestHeaders);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .get(`/services`)
        .set(requestHeaders)
        .query({ page: {} });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      const response2 = await request(usedHost)
        .get(`/services`)
        .set(requestHeaders)
        .query({ page: { number: 1 } });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .get(`/services`)
        .set(requestHeaders)
        .query({ page: { size: 1 } });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      const response4 = await request(usedHost)
        .get(`/services`)
        .set(requestHeaders)
        .query({ page: { number: 0, size: 1 } });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      const response5 = await request(usedHost)
        .get(`/services`)
        .set(requestHeaders)
        .query({ page: { number: 1, size: 0 } });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      const response6 = await request(usedHost)
        .get(`/services`)
        .set(requestHeaders)
        .query({ page: { number: "A", size: 2 } });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      const response7 = await request(usedHost)
        .get(`/services`)
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
      const response0 = await request(usedHost).get(`/services`);
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /tourism_company_api/services/delete ", () => {
    test("Should respond with status 200 and the edited object (data).", async () => {
      const response0 = await request(usedHost)
        .post("/services/delete")
        .set(requestHeaders)
        .send({
          id: testService3.id,
        });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(
        expect.objectContaining({
          id: testService3.id,
          companyId: testCompany0.id,
        })
      );
    });

    test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
      const response0 = await request(usedHost)
        .post("/services/delete")
        .set(requestHeaders)
        .send({
          id: "must be a number",
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .post("/services/delete")
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

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).post("/services/delete").send({
        id: testService3.id,
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
        .post("/services/delete")
        .set(requestHeaders)
        .send({
          id: 9999,
        });
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /tourism_company_api/services_bulk/delete ", () => {
    test("Should respond with status 200 and the edited object (data).", async () => {
      const response0 = await request(usedHost)
        .post("/services_bulk/delete")
        .set(requestHeaders)
        .send({
          ids: [editService0.id, editService1.id, editService2.id],
        });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(
        expect.objectContaining({
          ids: [editService0.id, editService1.id, editService2.id],
          companyId: testCompany0.id,
        })
      );
    });

    test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
      const response0 = await request(usedHost)
        .post("/services_bulk/delete")
        .set(requestHeaders)
        .send({
          ids: "must be a array",
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .post("/services_bulk/delete")
        .set(requestHeaders)
        .send({
          ids: -5,
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      const response4 = await request(usedHost)
        .post("/services_bulk/delete")
        .set(requestHeaders)
        .send({
          ids: [editService0.id, null, -5],
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost)
        .post("/services_bulk/delete")
        .send({
          ids: [editService0.id, editService1.id, editService2.id],
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
        .post("/services_bulk/delete")
        .set(requestHeaders)
        .send({
          ids: [99999, 99999, 99999],
        });
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("Delete the (test) category and company created. ", () => {
    test("Should respond with status 200 and the company/category id deleted.", async () => {
      const response1 = await request(`${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/tourism_company`)
        .post("/delete")
        .set(requestHeadersFirebase)
        .send({
          id: testCompany0.id,
        });
      expect(response1.statusCode).toBe(200);

      const response0 = await request(`${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/tourism_categories`)
        .post("/delete")
        .set(requestHeadersFirebase)
        .send({
          id: testTourCat0.id,
        });
      expect(response0.statusCode).toBe(200);
    });
  });
  
});
