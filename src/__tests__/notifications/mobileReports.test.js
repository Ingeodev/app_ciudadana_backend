const request = require("supertest");
const path = require('path');
const { v4: uuidv4 } = require("uuid");

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/security/reports`;
describe("Reports management API points: ", () => {
  jest.setTimeout(20000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const requestHeadersWeb = {
    Authorization: "Bearer ",
  };

  const filesPath = path.resolve(path.join('__tests__', 'notifications', '__testFiles__'));
  const testImage = path.join(filesPath, 'Sample Image.png');

  const lonNoCali = -76.59027606073045;
  const latNoCali = 2.460658430870321;
  const lonCali = -76.52496476354585;
  const latCali = 3.4270331133664707;

  const testCategory = {
    id: null,
    name: `Reportes ${uuidv4().replace(/-/g, "")}`,
    iconMap: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/" + global.testImageInStorage,
    color: "#002955",
  };

  const testReport0 = {
    description: "Ignorar reporte de prueba 1",
    categoryId: null,
    lat: latCali,
    lon: lonCali,
  };

  const testReport1 = {
    description: "Ignorar reporte de prueba 2",
    categoryId: null,
    lat: latCali,
    lon: lonCali,
  };

  const testReport3 = {
    description: "Ignorar reporte de prueba 3",
    lat: latCali,
    lon: lonCali,
  };

  describe("Firebase - Get tokens ", () => {
    test("Should respond with status 200 and the firebase mobile token .", async () => {
      // Auth mobile user
      const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
        .post("/accounts:signInWithPassword")
        .query({ key: global.firebaseKey })
        .send(global.firebaseTestMobileUserLogin);
      expect(firebaseAuth.statusCode).toBe(200);
      requestHeaders.Authorization += firebaseAuth.body.idToken;
    });

    test("Should respond with status 200 and the firebase web token .", async () => {
      // Auth web user
      const firebaseAuthWeb = await request("https://identitytoolkit.googleapis.com/v1")
        .post("/accounts:signInWithPassword")
        .query({ key: global.firebaseKey })
        .send(global.firebaseTestWebUserLogin);
      expect(firebaseAuthWeb.statusCode).toBe(200);
      requestHeadersWeb.Authorization += firebaseAuthWeb.body.idToken;
    });
  });

  describe("Ensure a ReportConfiguration exists (required by POST /security/reports) ", () => {
    test("Should respond with 201 (created) or 409 (already configured).", async () => {
      // POST /security/reports devuelve 500 "Report configuration data could not be retrieved"
      // si no existe una fila en ReportConfiguration (webReportConfigurations.js / mobileReports.js:37-41).
      // El test crea la config si falta y acepta 409 si ya existe (idempotente).
      const response0 = await request(global.notificationsMicroserviceDefaultHost)
        .post("/api/web/v1/notifications/security/report_configuration")
        .set(requestHeadersWeb)
        .send({ automaticApproval: true });
      expect([201, 409]).toContain(response0.statusCode);
    });
  });

  describe("Create a (test) category . ", () => {
    test("Should respond with status 201 and the new object (data) after creating a new category.", async () => {
      // Create security category:
      const securityCategoryResponse = await request(global.notificationsMicroserviceDefaultHost)
        .post("/api/web/v1/notifications/security_category")
        .set(requestHeadersWeb)
        .send(testCategory);
      expect(securityCategoryResponse.statusCode).toBe(201);
      expect(securityCategoryResponse.body.data).toHaveProperty("id");
      testCategory.id = securityCategoryResponse.body.data.id;
      testReport0.categoryId = testCategory.id;
      testReport1.categoryId = testCategory.id;    
    });
  });

  describe("Mobile - POST /security/reports ", () => {
    test("Should respond with status 201 and the new object (data) after creating a new attention line", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify(testReport0));
      expect(response0.statusCode).toBe(201);
      expect(response0.body).toHaveProperty("meta");
      expect(response0.body.meta).toBe(null);
      expect(response0.body).toHaveProperty("data");
      expect(response0.body.data).toHaveProperty("description");
      expect(response0.body.data).toHaveProperty("categoryId");
      expect(response0.body.data).toHaveProperty("image");
      expect(response0.body.data).toHaveProperty("lat");
      expect(response0.body.data).toHaveProperty("lon");

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify(testReport1));
      expect(response1.statusCode).toBe(201);
      expect(response1.body).toHaveProperty("meta");
      expect(response1.body.meta).toBe(null);
      expect(response1.body).toHaveProperty("data");
      expect(response1.body.data).toHaveProperty("description");
      expect(response1.body.data).toHaveProperty("categoryId");
      expect(response1.body.data).toHaveProperty("image");
      expect(response1.body.data).toHaveProperty("lat");
      expect(response1.body.data).toHaveProperty("lon");
    });

    test("Should fail with status 400 and an error with a message if the entry is not provided", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({}));
      expect(response0.statusCode).toBe(400);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 400);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");

      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach("image", testImage)
        .field("report", JSON.stringify(testReport3));
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");

      const response2 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({
          ...testReport0,
          description: "",
        }));
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("meta");
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({
          ...testReport0,
          lon: lonNoCali,
          lat: latNoCali,
        }));
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      const response4 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({
          ...testReport0,
          lon: -999.9999,
        }));
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      const response5 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({
          ...testReport0,
          lat: -999.9999,
        }));
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      const response6 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach("image", testImage)
        .field(
          "report",
          JSON.stringify({
            ...testReport0,
            description: "",
          })
        );
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      const response7 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach("image", null)
        .field("report", JSON.stringify(testReport0));
      // El validador hace imageUri OPCIONAL (validatorReports.js:17) y el endpoint no usa el
      // campo multipart 'image' (solo parsea 'report'). Un report sin imagen se crea con 201.
      expect(response7.statusCode).toBe(201);
      expect(response7.body).toHaveProperty("meta");
      expect(response7.body).toHaveProperty("data");
      expect(response7.body.data).toHaveProperty("description");
      expect(response7.body.data).toHaveProperty("categoryId");
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

    test("Should fail with status 404 and an error with a message if categoryId is valid but does not exist.", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({
          ...testReport0,
          categoryId: 99999,
        }));
      expect(response0.statusCode).toBe(404);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 404);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });

    test("Should fail with status 500 and an error with a message if the entry is not provided", async () => {
      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders);
      expect(response1.statusCode).toBe(500);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 500);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });
  });

  describe("Delete the (test) category created. ", () => {
    test("Should fail with status 422 because the category has related reports.", async () => {
      // Guard del backend (webSecurityCategories.js:170-174): una categoría con reports
      // asociados NO puede eliminarse (422). No existe endpoint de borrado de reports,
      // así que la limpieza vía API de la categoría es imposible tras crear reports.
      const response0 = await request(global.notificationsMicroserviceDefaultHost)
        .post("/api/web/v1/notifications/security_category/delete")
        .set(requestHeadersWeb)
        .send({
          id: testCategory.id,
        });
      expect(response0.statusCode).toBe(422);
      expect(response0.body).toHaveProperty("status", 422);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });

  afterAll(async () => {
    const response0 = await request(global.notificationsMicroserviceDefaultHost)
      .get("/api/web/v1/notifications/security/reports")
      .set(requestHeadersWeb)
      .query({ page: { number: 1, size: 100 } });
    expect(response0.statusCode).toBe(200);
    expect(response0.body).toHaveProperty("data");
    const created = response0.body.data.filter(
      (r) => r.description && r.description.startsWith("Ignorar reporte de prueba")
    );
    expect(created.length).toBeGreaterThanOrEqual(2);
    for (const report of created) {
      expect(report).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          securityCategoryName: expect.any(String),
          description: expect.any(String),
          securityCategoryId: expect.any(Number),
          userId: expect.any(Number),
          lat: expect.any(Number),
          lon: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
      // imageUri puede ser null (report sin imagen) o string.
      expect(report.imageUri === null || typeof report.imageUri === "string").toBe(true);
    }
  });
});
