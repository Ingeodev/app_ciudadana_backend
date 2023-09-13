const request = require("supertest");
const { v4: uuidV4 } = require("uuid");

// Deployed
// const usedHost = `${global.usersMicroserviceOnlineHost}/api/web/v1/third_parties/company`;
// Local
const usedHost = `${global.thirdPartiesMicroserviceLocalHost}/api/web/v1/third_parties/company`;
describe("Web - Third Party Companies management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const testCategoryId = 22;
  const min = 100000;
  const max = 900000;

  const testCompany0 = {
    name: uuidV4(),
    nit: `${Math.floor(Math.random() * (max - min + 1)) + min}-1`,
    categoryId: testCategoryId,
    description: "test description",
    phone: "3122334455",
    siteUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    address: "Calle 70 norte #17N-24, Popayán, Cauca",
    imageUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    lat: 2.482661,
    lon: -76.562636,
  };

  const testCompany1 = {
    name: uuidV4(),
    nit: `${Math.floor(Math.random() * (max - min + 1)) + min}-2`,
    categoryId: testCategoryId,
    description: "test description",
    phone: "3122334455",
    siteUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    address: "Calle 70 norte #17N-24, Popayán, Cauca",
    imageUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    lat: 2.482661,
    lon: -76.562636,
  };

  const editCompany0 = {
    name: uuidV4(),
    nit: `${Math.floor(Math.random() * (max - min + 1)) + min}-3`,
    categoryId: testCategoryId,
    description: "test description 1 edit",
    phone: "3122334455",
    siteUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    address: "Calle 70 norte #17N-24, Popayán, Cauca",
    imageUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    lat: 2.482661,
    lon: -76.562636,
  };

  const editCompany1 = {
    name: uuidV4(),
    nit: `${Math.floor(Math.random() * (max - min + 1)) + min}-4`,
    categoryId: testCategoryId,
    description: "test description 2 edit",
    phone: "3122334455",
    siteUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    address: "Calle 70 norte #17N-24, Popayán, Cauca",
    imageUri: "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
    lat: 2.482661,
    lon: -76.562636,
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

  describe("POST /company/ ", () => {
    test("should respond with status 201 and the new object (data) after creating a new category", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testCompany0);
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      testCompany0.id = response0.body.data.id;
      editCompany0.id = response0.body.data.id;

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testCompany1);
      expect(response1.statusCode).toBe(201);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("id");
      testCompany1.id = response1.body.data.id;
      editCompany1.id = response1.body.data.id;
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      const response2 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testCompany0,
          name: -5,
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
          ...testCompany0,
          nit: "is.not.nit",
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
          ...testCompany0,
          categoryId: "must be a number",
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
          ...testCompany0,
          description: -5,
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
          ...testCompany0,
          phone: -5,
        });
      expect(response8.statusCode).toBe(400);
      expect(response8.body).not.toHaveProperty("meta");
      expect(response8.body).not.toHaveProperty("data");
      expect(response8.body).toHaveProperty("status", 400);
      expect(response8.body).toHaveProperty("code");
      expect(response8.body).toHaveProperty("detail");

      // 2. ----------------------------------------------
      const response3 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testCompany0,
          siteUri: "is.not uri",
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 8. ----------------------------------------------
      const response9 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testCompany0,
          address: -5,
        });
      expect(response9.statusCode).toBe(400);
      expect(response9.body).not.toHaveProperty("meta");
      expect(response9.body).not.toHaveProperty("data");
      expect(response9.body).toHaveProperty("status", 400);
      expect(response9.body).toHaveProperty("code");
      expect(response9.body).toHaveProperty("detail");

      // 3. ----------------------------------------------
      const response4 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testCompany0,
          imageUri: "not uri",
        });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      // 9. ----------------------------------------------
      const response10 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testCompany0,
          lat: "must be a float number",
        });
      expect(response10.statusCode).toBe(400);
      expect(response10.body).not.toHaveProperty("meta");
      expect(response10.body).not.toHaveProperty("data");
      expect(response10.body).toHaveProperty("status", 400);
      expect(response10.body).toHaveProperty("code");
      expect(response10.body).toHaveProperty("detail");

      // 10. ----------------------------------------------
      const response11 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testCompany0,
          lon: "must be a float number",
        });
      expect(response11.statusCode).toBe(400);
      expect(response11.body).not.toHaveProperty("meta");
      expect(response11.body).not.toHaveProperty("data");
      expect(response11.body).toHaveProperty("status", 400);
      expect(response11.body).toHaveProperty("code");
      expect(response11.body).toHaveProperty("detail");
    });

    test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testCompany0);
      expect(response0.statusCode).toBe(500);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 500);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send(testCompany1);
      expect(response1.statusCode).toBe(500);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 500);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      const response2 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .send({
          ...testCompany1,
          categoryId: 999
        });
      expect(response2.statusCode).toBe(500);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 500);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");
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

  describe("GET /company/:id ", () => {
    test("should respond with status 200 and one document_type object created.", async () => {
      const response0 = await request(usedHost)
        .get(`/${testCompany0.id}`)
        .set(requestHeaders);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      // expect(response0.body.data).toHaveProperty("id");
      // expect(response0.body.data).toHaveProperty("name");
      // expect(response0.body.data.name).toBe(testCompany0.name);
      expect(response0.body.data).toHaveProperty("company");
      expect(response0.body.data.company).toHaveProperty("name");
      expect(response0.body.data.company.name).toBe(testCompany0.name);
      expect(response0.body.data).toHaveProperty("services");

      const response1 = await request(usedHost)
        .get(`/${testCompany1.id}`)
        .set(requestHeaders);
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      // expect(response1.body.data).toHaveProperty("id");
      // expect(response1.body.data).toHaveProperty("name");
      // expect(response1.body.data.name).toBe(testCompany1.name);
      expect(response1.body.data).toHaveProperty("company");
      expect(response1.body.data.company).toHaveProperty("name");
      expect(response1.body.data.company.name).toBe(testCompany1.name);
      expect(response1.body.data).toHaveProperty("services");
    });

    test("should fail with status 400 and an error with a message id must be a number", async () => {
      const response0 = await request(usedHost).get(`/ddd`).set(requestHeaders);
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get(`/${testCompany0.id}`);
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("should fail with status 404 and an error with a message not found", async () => {
      const response0 = await request(usedHost).get(`/999`).set(requestHeaders);
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("GET /company/ ", () => {
    test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
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
      expect(response0.body.data[0]).toHaveProperty("name");
      expect(response0.body.data[0].name).toBe(testCompany1.name);
      expect(response0.body.data[1]).toHaveProperty("id");
      expect(response0.body.data[1]).toHaveProperty("name");
      expect(response0.body.data[1].name).toBe(testCompany0.name);
    });

    // {
    // "status": 400,
    // "detail": "\"number\" must be a number",
    // "code": "Bad Request"
    // }
    test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
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

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
      const response0 = await request(usedHost).get("/").query({ page: { number: 1, size: 2 } });
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("DISABLED - Companies table must not have any records. should fail with status 404 and an error with a message of categories not found.", async () => {
      // 1. ------------------------------------------------
      // const response0 = await request(usedHost)
      //   .get("/")
      //   .set(requestHeaders)
      //   .query({ page: { number: 1, size: 2 } });
      // expect(response0.statusCode).toBe(404);
      // expect(response0.body).not.toHaveProperty("meta");
      // expect(response0.body).not.toHaveProperty("data");
      // expect(response0.body).toHaveProperty("status", 404);
      // expect(response0.body).toHaveProperty("code");
      // expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /company/edit ", () => {

    test("should respond with status 200 and the edited object (data)", async () => {
      // 1. -------------------------------------------------
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send(editCompany0);
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("id");
      expect(response0.body.data).toHaveProperty("name");
      expect(response0.body.data.name).toBe(editCompany0.name);

      // 2. -------------------------------------------------
      const response1 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send(editCompany1);
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("id");
      expect(response1.body.data).toHaveProperty("name");
      expect(response1.body.data.name).toBe(editCompany1.name);
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // 1. -------------------------------------
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editCompany0,
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
          ...editCompany0,
          name: -5,
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
          ...editCompany0,
          nit: "is no nit",
        });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      // 4. -------------------------------------
      const response5 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editCompany0,
          categoryId: "must be a number",
        });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      // 5. -------------------------------------
      const response6 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editCompany0,
          phone: 3331122,
        });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

    });

    
    test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...testCompany1,
          categoryId: 999,
        });
      expect(response0.statusCode).toBe(500);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 500);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    // {
    //     "status": 404,
    //     "detail": "The category with id=99 does not exist",
    //     "code": "Not Found"
    // }
    test("should fail with status 404 and an error with a message if the id does not exist", async () => {
      const response0 = await request(usedHost)
        .post("/edit")
        .set(requestHeaders)
        .send({
          ...editCompany1,
          id: 999,
        });
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
      const response0 = await request(usedHost).post("/edit").send(editCompany0);
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  describe("POST /company/delete ", () => {
    // {
    //     "meta": null,
    //     "data": {
    //         "id": 1,
    //         "active": false
    //     }
    // }
    test("should respond with status 200 and the edited object (data)", async () => {
      const response0 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: testCompany0.id,
        });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(
        expect.objectContaining({
          id: testCompany0.id,
        })
      );
      const response1 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          id: testCompany1.id,
        });
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toEqual(
        expect.objectContaining({
          id: testCompany1.id,
        })
      );
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // {
      //     "status": 400,
      //     "detail": "\"id\" is required",
      //     "code": "Bad Request"
      // }
      const response0 = await request(usedHost)
        .post("/delete")
        .set(requestHeaders)
        .send({
          active: false,
          id: "",
        });
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      // {
      //     "status": 400,
      //     "detail": "\"id\" must be greater than 0",
      //     "code": "Bad Request"
      // }
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

    // {
    //     "status": 404,
    //     "detail": "The document type with id=999 does not exist",
    //     "code": "Not Found"
    // }
    test("should fail with status 404 and an error with a message if the id does not exist", async () => {
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

    // {
    //     "status": 401,
    //     "detail": "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.",
    //     "code": "Unauthorized"
    // }
    test("should fail with error 401 and a message if Authorization header is not set.", async () => {
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
