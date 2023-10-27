const request = require("supertest");
const { v4: uuidV4 } = require("uuid");
const path = require("path");

const usedHost = `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/city`;

const sleepNow = async (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay));

describe("WEB Cities configuration API points: ", () => {
  jest.setTimeout(10000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const generateAlphanumeric = () => {
    return uuidV4().replace(/-/g, "");
  };

  const filesPath = path.resolve(
    path.join("__tests__", "thirdParties", "web", "__testFiles__")
  );

  const creationXlsx = path.join(filesPath, "Codigos_municipios_DANE.xlsx");
  const creationXls = path.join(filesPath, "Codigos_municipios_DANE.xls");
  const badXlsx1 = path.join(filesPath, "Modifica Dep Mal 1.xlsx");
  const badXlsx2 = path.join(filesPath, "Modifica Dep Mal 2.xlsx");
  const badXlsx3 = path.join(filesPath, "Modifica Dep Mal 3.xlsx");
  const powerpoint = path.join(filesPath, "PowerPoint.pptx");
  const word = path.join(filesPath, "Word.docx");

  const min1 = 1000000;
  const max1 = 2000000;
  const min2 = 3000000;
  const max2 = 4000000;
  let citiesIdExcel = [];

  const testCity0 = {
    cityCode: `${Math.floor(Math.random() * (max1 - min1 + 1)) + min1}`,
    city: `TEST ${generateAlphanumeric()}`,
    state: "TEST",
  };

  const testCity1 = {
    cityCode: `${Math.floor(Math.random() * (max2 - min2 + 1)) + min2}`,
    city: `TEST ${generateAlphanumeric()}`,
    state: "TEST",
  };

  const editCity0 = {
    cityCode: `${Math.floor(Math.random() * (max1 - min1 + 1)) + min1}`,
    city: `TEST ${generateAlphanumeric()}`,
    state: "TEST",
  };

  const editCity1 = {
    cityCode: `${Math.floor(Math.random() * (max2 - min2 + 1)) + min2}`,
    city: `TEST ${generateAlphanumeric()}`,
    state: "TEST",
  };

  describe("Firebase - Get token ", () => {
    test("Should respond with status 200 and the firebase token .", async () => {
      const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
        .post("/accounts:signInWithPassword")
        .query({ key: global.firebaseKey })
        .send(global.firebaseTestWebUserLogin);
      expect(firebaseAuth.statusCode).toBe(200);
      requestHeaders.Authorization += firebaseAuth.body.idToken;
    });
  });

  // afterAll(async () => {
  //     await request(usedHost).post('/excel').set(requestHeaders)
  //             .attach('file', initialDependencies);
  // });

  describe("POST /city/excel ", () => {
    test("Should respond with status 201 and the number of successes and failures.", async () => {
      const response0 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", creationXlsx);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("success");
      expect(response0.body.data.success).toEqual(expect.any(Array));
      expect(response0.body.data.success.length).toBe(3);
      expect(response0.body.data).toHaveProperty("errors");
      expect(response0.body.data.errors).toEqual(expect.any(Array));
      expect(response0.body.data.errors.length).toBe(0);

      const response1 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", creationXls);
      expect(response1.statusCode).toBe(201);
      expect(response1.body.data).toHaveProperty("success");
      expect(response1.body.data.success).toEqual(expect.any(Array));
      expect(response1.body.data.success.length).toBe(3);
      expect(response1.body.data).toHaveProperty("errors");
      expect(response1.body.data.errors).toEqual(expect.any(Array));
      expect(response1.body.data.errors.length).toBe(0);

      const response2 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", badXlsx1);
      expect(response2.statusCode).toBe(201);
      expect(response2.body.data).toHaveProperty("success");
      expect(response2.body.data.success).toEqual(expect.any(Array));
      expect(response2.body.data.success.length).toBe(2);
      expect(response2.body.data).toHaveProperty("errors");
      expect(response2.body.data.errors).toEqual(expect.any(Array));
      expect(response2.body.data.errors.length).toBe(1);

      const response3 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", badXlsx2);
      expect(response3.statusCode).toBe(201);
      expect(response3.body.data).toHaveProperty("success");
      expect(response3.body.data.success).toEqual(expect.any(Array));
      expect(response3.body.data.success.length).toBe(2);
      expect(response3.body.data).toHaveProperty("errors");
      expect(response3.body.data.errors).toEqual(expect.any(Array));
      expect(response3.body.data.errors.length).toBe(1);

      const response4 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", badXlsx3);
      expect(response4.statusCode).toBe(201);
      expect(response4.body.data).toHaveProperty("success");
      expect(response4.body.data.success).toEqual(expect.any(Array));
      expect(response4.body.data.success.length).toBe(2);
      expect(response4.body.data).toHaveProperty("errors");
      expect(response4.body.data.errors).toEqual(expect.any(Array));
      expect(response4.body.data.errors.length).toBe(1);
    });

    test("Should fail with error 400 and a message if 'file' is not passed.", async () => {
      const response0 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders);
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
        .attach("file", word);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .post("/excel")
        .set(requestHeaders)
        .attach("file", powerpoint);
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).post("/excel");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /city/ ", () => {
    test("Should respond with status 201 and the new object (data) after creating a new city.", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testCity0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      testCity0.id = response0.body.data.id;
      editCity0.id = response0.body.data.id;

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testCity1);
      expect(response1.statusCode).toBe(201);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("id");
      testCity1.id = response1.body.data.id;
      editCity1.id = response1.body.data.id;
    });

    test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
      const response2 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testCity0,
          cityCode: -5,
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
          ...testCity0,
          city: -5,
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
          ...testCity0,
          state: -5,
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
        .send(testCity0);
      expect(response8.statusCode).toBe(400);
      expect(response8.body).not.toHaveProperty("meta");
      expect(response8.body).not.toHaveProperty("data");
      expect(response8.body).toHaveProperty("status", 400);
      expect(response8.body).toHaveProperty("code");
      expect(response8.body).toHaveProperty("detail");
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
  });

  describe("GET /city/ ", () => {
    test("Should respond with status 200 and a list of objects containing the two cities.", async () => {
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
      expect(response0.body.data[0]).toHaveProperty("city");
      expect(response0.body.data[1]).toHaveProperty("id");
      expect(response0.body.data[1]).toHaveProperty("city");
    });

    test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
      const response0 = await request(usedHost)
        .get("/")
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

    test("Disabled - Should respond with status 200 and an empty array, because there are no cities registered.", async () => {
      // const response0 = await request(usedHost)
      //   .get("/")
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

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost)
        .get("/")
        .query({ page: { number: 1, size: 2 } });
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /city/autocomplete ", () => {
    test("Should respond with status 200 and a list of objects containing the two cities.", async () => {
      const response0 = await request(usedHost)
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 100 }, q: "TEST" });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toHaveProperty("page");
      expect(response0.body.meta).toHaveProperty("pageSize");
      expect(response0.body.meta).toHaveProperty("totalRecords");
      expect(response0.body.meta.page).toBe(1);
      expect(response0.body.meta.pageSize).toBe(100);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(expect.any(Array));
      expect(response0.body.data[0]).toHaveProperty("id");
      expect(response0.body.data[0]).toHaveProperty("city");
      expect(response0.body.data[0]).toHaveProperty("cityCode");
      expect(response0.body.data[0]).toHaveProperty("state");
      for (let index = 0; index < response0.body.meta.totalRecords; index++) {
        citiesIdExcel.push(response0.body.data[index].id);
      }
    });

    test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
      const response0 = await request(usedHost)
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { number: 200000, size: 100 }, q: "TEST" });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta.page).toBe(200000);
      expect(response0.body.meta.pageSize).toBe(100);
      expect(response0.body.meta).toHaveProperty("message");
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(expect.any(Array));
      expect(response0.body.data.length).toBe(0);
    });

    test("Should respond with status 200 and an empty array, because there are no cities registered.", async () => {
      const response0 = await request(usedHost)
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 2 }, q: "xxxxxxxxxxxxxx" });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta.page).toBe(1);
      expect(response0.body.meta.pageSize).toBe(2);
      expect(response0.body.meta).toHaveProperty("message");
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(expect.any(Array));
      expect(response0.body.data.length).toBe(0);
    });

    test("Should fail with status 400 and an error with a message if no pagination is provided.", async () => {
      const response0 = await request(usedHost).get("/autocomplete").set(requestHeaders);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: {}, q: "TEST" });
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      const response2 = await request(usedHost)
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { number: 1 }, q: "TEST" });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { size: 1 }, q: "TEST" });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      const response4 = await request(usedHost)
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { number: 0, size: 1 }, q: "TEST" });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      const response5 = await request(usedHost)
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 0 }, q: "TEST" });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      const response6 = await request(usedHost)
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { number: "A", size: 2 }, q: "TEST" });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      const response7 = await request(usedHost)
        .get("/autocomplete")
        .set(requestHeaders)
        .query({ page: { number: 2, size: "B" }, q: "TEST" });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");
    });

    test("Should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost)
        .get("/autocomplete")
        .query({ page: { number: 1, size: 2 }, q: "TEST" });
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /city/edit ", () => {
    test("Should respond with status 200 and the edited object (data).", async () => {
      // 1. -------------------------------------------------
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send(editCity0);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data).toHaveProperty("city");
      expect(response0.body.data.city).toBe(editCity0.city);

      // 2. -------------------------------------------------
      const response1 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send(editCity1);
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("id");
      expect(response1.body.data).toHaveProperty("city");
      expect(response1.body.data.city).toBe(editCity1.city);
    });

    test("Should fail with status 400 and an error with a message if the entry is not well formatted.", async () => {
      // 1. -------------------------------------
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editCity0,
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
          ...editCity0,
          city: -5,
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
          ...editCity0,
          cityCode: -5,
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
          ...editCity0,
          state: -5,
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
          ...editCity0,
          id: editCity1.id,
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
        .post("/edit")
        .send(editCity0);
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
          ...editCity1,
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

  describe("POST /city/delete ", () => {
    test("Should respond with status 200 and the city id deleted.", async () => {
      for (let index = 0; index < citiesIdExcel.length; index++) {
        const response2 = await request(usedHost)
          .post("/delete")
          .set(requestHeaders)
          .send({
            id: citiesIdExcel[index],
          });
        expect(response2.statusCode).toBe(200);
        expect(response2.body).toHaveProperty("meta");
        expect(response2.body.meta).toBe(null);
        expect(response2.body).toHaveProperty("data");
        expect(response2.body.data).toEqual(
          expect.objectContaining({
            id: citiesIdExcel[index],
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
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

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

    test("Should fail with status 404 and an error with a message if the id does not exist.", async () => {
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
});
