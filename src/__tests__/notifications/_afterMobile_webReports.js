const request = require("supertest");
const { v4: uuidv4 } = require("uuid");

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/web/v1/notifications/security/reports`;
const mobileReportsHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/security/reports`;
const usedWebHost = `${global.notificationsMicroserviceDefaultHost}/api/web/v1/notifications`;

// Suite INDEPENDIENTE e idempotente: crea sus propios datos (categoría + report) y NO
// depende de que mobileReports.test.js haya corrido antes.
describe("Web - Reports management API points: ", () => {
  jest.setTimeout(20000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };
  const requestHeadersMobile = {
    Authorization: "Bearer ",
  };

  const suffix = uuidv4().replace(/-/g, "");
  const testCategory = {
    id: null,
    name: `ReportesWeb ${suffix}`,
    iconMap: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/" + global.testImageInStorage,
    color: "#002955",
  };
  const testReport = {
    description: `Ignorar reporte web independiente ${suffix}`,
    categoryId: null,
    lat: 3.4270331133664707,
    lon: -76.52496476354585,
  };

  beforeAll(async () => {
    const firebaseAuth = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestWebUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken;

    const firebaseAuthMobile = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestMobileUserLogin);
    requestHeadersMobile.Authorization += firebaseAuthMobile.body.idToken;

    // POST /security/reports devuelve 500 si no existe una fila en ReportConfiguration.
    const config = await request(usedWebHost)
      .post("/security/report_configuration")
      .set(requestHeaders)
      .send({ automaticApproval: true });
    expect([201, 409]).toContain(config.statusCode);

    const category = await request(usedWebHost)
      .post("/security_category/")
      .set(requestHeaders)
      .send(testCategory);
    expect(category.statusCode).toBe(201);
    testCategory.id = category.body.data.id;
    testReport.categoryId = testCategory.id;

    const created = await request(mobileReportsHost)
      .post("/")
      .set(requestHeadersMobile)
      .field("report", JSON.stringify(testReport));
    expect(created.statusCode).toBe(201);
  });

  describe("GET /security/reports ", () => {
    test("should respond with status 200 and a list of objects containing the created object.", async () => {
      const response0 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 100 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta.page).toBe(1);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toEqual(expect.any(Array));

      // Busca el report creado por esta suite (no depende del estado global de la BD).
      const created = response0.body.data.filter(
        (r) => r.description === testReport.description
      );
      expect(created.length).toBe(1);
      const report = created[0];
      expect(report).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          securityCategoryName: expect.any(String),
          description: testReport.description,
          securityCategoryId: testCategory.id,
          userId: expect.any(Number),
          lat: expect.any(Number),
          lon: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
      // imageUri puede ser null (report sin imagen) o string.
      expect(report.imageUri === null || typeof report.imageUri === "string").toBe(true);
    });

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