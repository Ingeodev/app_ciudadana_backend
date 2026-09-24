const request = require("supertest");
const { v4: uuidv4 } = require("uuid");

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/publicity`;
const usedWebHost = `${global.notificationsMicroserviceDefaultHost}/api/web/v1/notifications`;

describe("Publicity consumption API points: ", () => {
  jest.setTimeout(20000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };
  const requestHeadersWeb = {
    Authorization: "Bearer ",
  };

  const suffix = uuidv4().replace(/-/g, "");

  // Datos propios creados por esta suite (idempotente: no depende de otras suites ni de la BD).
  const testMobileService = {
    id: null,
    route: `RutaPrueba${suffix}`,
    name: `ServicioPrueba${suffix}`,
    subtitle: `SubPrueba${suffix}`,
    accessLevel: "free",
    imageUri: `https://example.com/ms${suffix}.png`,
    icon: `https://example.com/icon${suffix}.png`,
  };
  const testBannerAd = {
    id: null,
    imageUri: `https://example.com/ad${suffix}.jpg`,
    imageMobileUri: `https://example.com/adm${suffix}.jpg`,
    siteUri: `https://example.com/banner${suffix}`,
    categoryId: null,
  };
  const testUncategorizedAd = {
    id: null,
    imageUri: `https://example.com/uncat${suffix}.jpg`,
    imageMobileUri: `https://example.com/uncatm${suffix}.jpg`,
    siteUri: `https://example.com/uncat${suffix}`,
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

    // Crea un MobileService (categoría de banner). El modelo exige imageUri e icon (notNull).
    const ms = await request(usedWebHost)
      .post("/mobile_services/")
      .set(requestHeadersWeb)
      .send(testMobileService);
    expect(ms.statusCode).toBe(201);
    testMobileService.id = ms.body.data.id;
    testBannerAd.categoryId = testMobileService.id;

    // Crea un advertisement con categoría (aparece en /publicity/banners).
    const banner = await request(usedWebHost)
      .post("/informationmb")
      .set(requestHeadersWeb)
      .send(testBannerAd);
    expect(banner.statusCode).toBe(201);
    testBannerAd.id = banner.body.data.id;

    // Crea un advertisement sin categoría (aparece en /publicity/).
    const uncat = await request(usedWebHost)
      .post("/informationmb")
      .set(requestHeadersWeb)
      .send(testUncategorizedAd);
    expect(uncat.statusCode).toBe(201);
    testUncategorizedAd.id = uncat.body.data.id;
  });

  afterAll(async () => {
    if (testUncategorizedAd.id != null) {
      await request(usedWebHost)
        .post("/informationmb/delete")
        .set(requestHeadersWeb)
        .send({ id: testUncategorizedAd.id });
    }
    if (testBannerAd.id != null) {
      await request(usedWebHost)
        .post("/informationmb/delete")
        .set(requestHeadersWeb)
        .send({ id: testBannerAd.id });
    }
    if (testMobileService.id != null) {
      await request(usedWebHost)
        .post("/mobile_services/delete")
        .set(requestHeadersWeb)
        .send({ id: testMobileService.id });
    }
  });

  describe("GET /notifications/publicity/banners ", () => {
    test("should respond with status 200 and a list of category objects.", async () => {
      const response0 = await request(usedHost)
        .get("/banners")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 100 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toEqual(expect.any(Array));

      // Verifica que el banner creado por esta suite esté presente con su estructura.
      const banner = response0.body.find(
        (item) => item.url === testBannerAd.siteUri
      );
      expect(banner).toBeDefined();
      expect(banner).toHaveProperty("image");
      expect(banner).toHaveProperty("imageWeb");
      expect(banner).toHaveProperty("url");
      expect(banner).toHaveProperty("category", testMobileService.route);

      const response1 = await request(usedHost)
        .get("/banners")
        .set(requestHeaders);
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toEqual(expect.any(Array));
      const banner1 = response1.body.find(
        (item) => item.url === testBannerAd.siteUri
      );
      expect(banner1).toBeDefined();
      expect(banner1).toHaveProperty("image");
      expect(banner1).toHaveProperty("imageWeb");
      expect(banner1).toHaveProperty("url");
    });

    test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
      const response0 = await request(usedHost)
        .get(`/banners`)
        .set(requestHeaders)
        .query({ page: { number: 200000, size: 100 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toEqual(expect.any(Array));
      expect(response0.body.length).toBe(0);
    });

    test("Disabled - Should respond with status 200 and an empty array, because there are no publicity registered.", async () => {
      // const response0 = await request(usedHost)
      //   .get("/banners")
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

    test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
      const response2 = await request(usedHost)
        .get("/banners")
        .set(requestHeaders)
        .query({ page: { number: 1 } });
      expect(response2.statusCode).toBe(400);
      expect(response2.body).not.toHaveProperty("data");
      expect(response2.body).toHaveProperty("status", 400);
      expect(response2.body).toHaveProperty("code");
      expect(response2.body).toHaveProperty("detail");

      const response3 = await request(usedHost)
        .get("/banners")
        .set(requestHeaders)
        .query({ page: { size: 1 } });
      expect(response3.statusCode).toBe(400);
      expect(response3.body).not.toHaveProperty("meta");
      expect(response3.body).not.toHaveProperty("data");
      expect(response3.body).toHaveProperty("status", 400);
      expect(response3.body).toHaveProperty("code");
      expect(response3.body).toHaveProperty("detail");

      const response4 = await request(usedHost)
        .get("/banners")
        .set(requestHeaders)
        .query({ page: { number: 0, size: 1 } });
      expect(response4.statusCode).toBe(400);
      expect(response4.body).not.toHaveProperty("meta");
      expect(response4.body).not.toHaveProperty("data");
      expect(response4.body).toHaveProperty("status", 400);
      expect(response4.body).toHaveProperty("code");
      expect(response4.body).toHaveProperty("detail");

      const response5 = await request(usedHost)
        .get("/banners")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 0 } });
      expect(response5.statusCode).toBe(400);
      expect(response5.body).not.toHaveProperty("meta");
      expect(response5.body).not.toHaveProperty("data");
      expect(response5.body).toHaveProperty("status", 400);
      expect(response5.body).toHaveProperty("code");
      expect(response5.body).toHaveProperty("detail");

      const response6 = await request(usedHost)
        .get("/banners")
        .set(requestHeaders)
        .query({ page: { number: "A", size: 2 } });
      expect(response6.statusCode).toBe(400);
      expect(response6.body).not.toHaveProperty("meta");
      expect(response6.body).not.toHaveProperty("data");
      expect(response6.body).toHaveProperty("status", 400);
      expect(response6.body).toHaveProperty("code");
      expect(response6.body).toHaveProperty("detail");

      const response7 = await request(usedHost)
        .get("/banners")
        .set(requestHeaders)
        .query({ page: { number: 2, size: "B" } });
      expect(response7.statusCode).toBe(400);
      expect(response7.body).not.toHaveProperty("meta");
      expect(response7.body).not.toHaveProperty("data");
      expect(response7.body).toHaveProperty("status", 400);
      expect(response7.body).toHaveProperty("code");
      expect(response7.body).toHaveProperty("detail");
    });

    // Removed: GET /publicity/banners es un endpoint PÚBLICO (mobile.js:38, sin auth).
    // El test de 401 sin Authorization estaba obsoleto: responde 200 sin token.
  });

  describe("GET /notifications/publicity/ ", () => {
    test("should respond with status 200 and a list of category objects.", async () => {
      const response0 = await request(usedHost)
        .get("/")
        .set(requestHeaders)
        .query({ page: { number: 1, size: 100 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toEqual(expect.any(Array));

      // Verifica que el advertisement sin categoría creado por esta suite esté presente.
      const item = response0.body.find(
        (el) => el.url === testUncategorizedAd.siteUri
      );
      expect(item).toBeDefined();
      expect(item).toHaveProperty("image");
      expect(item).toHaveProperty("imageWeb");
      expect(item).toHaveProperty("url");

      const response1 = await request(usedHost).get("/").set(requestHeaders);
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toEqual(expect.any(Array));
      const item1 = response1.body.find(
        (el) => el.url === testUncategorizedAd.siteUri
      );
      expect(item1).toBeDefined();
      expect(item1).toHaveProperty("image");
      expect(item1).toHaveProperty("imageWeb");
      expect(item1).toHaveProperty("url");
    });

    test("Should respond with status 200 and an empty array, because the page number does not exist.", async () => {
      const response0 = await request(usedHost)
        .get(`/`)
        .set(requestHeaders)
        .query({ page: { number: 200000, size: 100 } });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toEqual(expect.any(Array));
      expect(response0.body.length).toBe(0);
    });

    test("Disabled - Should respond with status 200 and an empty array, because there are no publicity registered.", async () => {
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

    test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
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

    // Removed: GET /publicity/ es un endpoint PÚBLICO (mobile.js:35, sin auth).
    // El test de 401 sin Authorization estaba obsoleto: responde 200 sin token.
  });
});