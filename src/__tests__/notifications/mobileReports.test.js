const request = require("supertest");
const path = require('path');

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/security/reports`;
describe("Mobile - Reports management API points: ", () => {
  jest.setTimeout(8000);

  const requestHeaders = {
    Authorization: "Bearer ",
  };

  const filesPath = path.resolve(path.join('__tests__', 'notifications', '__testFiles__'));
  const testImage = path.join(filesPath, 'Sample Image.png');

  const testReport0 = {
    // title: "Reporte de prueba 1",
    description: "Ignorar reporte de prueba ",
    categoryId: null,
    userId: 6,
    imageUri: "https://www.cali.gov.co/info/principal/media/bloque210342.png",
    lat: 3.347622,
    lon: -76.530775
  };

  const testReport1 = {
    // title: "Reporte de prueba 2",
    description: "Ignorar reporte de prueba 2",
    categoryId: null,
    lat: 3.345678,
    lon: -76.535812
  };

  const testReport2 = {
    categoryId: null,
    lat: 3.345678,
    lon: -76.535812
  };

  const testReport3 = {
    // title: "Reporte de prueba 4",
    description: "Ignorar reporte de prueba 4",
    lat: 3.345678,
    lon: -76.535812
  };

  const testReport4 = {
    // title: "Reporte de prueba 5",
    description: "Ignorar reporte de prueba 5",
    categoryId: null,
    lat: 3.345678,
    lon: -76.535812
  };

  beforeAll(async () => {
    // Auth mobile user
    const firebaseAuth = await request(
      "https://identitytoolkit.googleapis.com/v1"
    )
      .post("/accounts:signInWithPassword")
      .query({ key: global.firebaseKey })
      .send(global.firebaseTestMobileUserLogin);
    requestHeaders.Authorization += firebaseAuth.body.idToken;
    // Create security category:
    const securityCategoryResponse = await request(global.notificationsMicroserviceDefaultHost)
      .post("/api/web/v1/notifications/security_category")
      .set(requestHeaders)
      .send({
        name: "Reportes de Prueba",
        imageUri: "https://www.cali.gov.co/info/principal/media/bloque210342.png",
        color: "#002955",
      });
    const securityCategoryId = securityCategoryResponse.body.data.id;
    testReport0.categoryId = securityCategoryId;
    testReport1.categoryId = securityCategoryId;
    testReport2.categoryId = securityCategoryId;
    testReport4.categoryId = securityCategoryId;
  });

  afterAll(async () => {
    await request(global.notificationsMicroserviceDefaultHost)
      .post("/api/web/v1/notifications/security_category/delete")
      .set(requestHeaders)
      .send({
        id: testReport0.categoryId,
      });
  });

  describe("POST /security/reports ", () => {
    test("should respond with status 201 and the new object (data) after creating a new attention line", async () => {
      //   {
      //     "meta": null,
      //     "data": {
      //         "id": 3,
      //         "title": "report title 3",
      //         "description": "report description 3",
      //         "securityCategoryId": 11,
      //         "userId": 6,
      //         "imageUri": "http://image/uri_3.jpg",
      //         "lat": 3.347622,
      //         "lon": -76.530775,
      //         "updatedAt": "2023-08-17T20:31:38.675Z",
      //         "createdAt": "2023-08-17T20:31:38.675Z",
      //         "deletedAt": null
      //     }
      // }
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
      expect(response0.body.data).toHaveProperty("description");
      expect(response0.body.data).toHaveProperty("categoryId");
      expect(response0.body.data).toHaveProperty("image");
      expect(response0.body.data).toHaveProperty("lat");
      expect(response0.body.data).toHaveProperty("lon");
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // {
      //   "status": 400,
      //   "detail": "\"title\" is required",
      //   "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({
          ...testReport0,
          description: "",
        }));
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("should fail with status 400 and an error with a message if the entry is not provided", async () => {
      // {
      //   "status": 400,
      //   "detail": "\"title\" is required",
      //   "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({}));
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("should fail with status 400 and an error with a message if the entry is not provided", async () => {
      // {
      //   "status": 400,
      //   "detail": "\"securityCategoryId\" is required",
      //   "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify(testReport3));
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // {
      //   "status": 400,
      //   "detail": "\"imageUri\" must be a valid uri",
      //   "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({
          ...testReport0,
          description: "",
        }));
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("should fail with status 500 and an error with a message if the entry is not provided", async () => {
      // {
      //   "status": 400,
      //   "detail": "\"imageUri\" is required",
      //   "code": "Bad Request"
      // }
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

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // {
      //   "status": 400,
      //   "detail": "\"lat\" must be greater than or equal to -90",
      //   "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({
          ...testReport0,
          lat: -999.9999,
        }));
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
      // {
      //   "status": 400,
      //   "detail": "\"lon\" must be greater than or equal to -180",
      //   "code": "Bad Request"
      // }
      const response1 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({
          ...testReport0,
          lon: -999.9999,
        }));
      expect(response1.statusCode).toBe(400);
      expect(response1.body).not.toHaveProperty("meta");
      expect(response1.body).not.toHaveProperty("data");
      expect(response1.body).toHaveProperty("status", 400);
      expect(response1.body).toHaveProperty("code");
      expect(response1.body).toHaveProperty("detail");
    });

    // {
    // "status": 500,
    // "detail": "Validation error",
    // "code": "Internal Server Error"
    // }
    // test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
    //   const response0 = await request(usedHost)
    //     .post("/")
    //     .set(requestHeaders)
    //     .send(testDocType0);
    //   // .send({
    //   //   ...testDocType0,
    //   //   code: -5,
    //   // });
    //   expect(response0.statusCode).toBe(500);
    //   expect(response0.body).not.toHaveProperty("meta");
    //   expect(response0.body).not.toHaveProperty("data");
    //   expect(response0.body).toHaveProperty("status", 500);
    //   expect(response0.body).toHaveProperty("code");
    //   expect(response0.body).toHaveProperty("detail");

    //   const response1 = await request(usedHost)
    //     .post("/")
    //     .set(requestHeaders)
    //     .send({
    //       ...testDocType1,
    //       code: 22,
    //     });
    //   expect(response1.statusCode).toBe(500);
    //   expect(response1.body).not.toHaveProperty("meta");
    //   expect(response1.body).not.toHaveProperty("data");
    //   expect(response1.body).toHaveProperty("status", 500);
    //   expect(response1.body).toHaveProperty("code");
    //   expect(response1.body).toHaveProperty("detail");
    // });

    // {
    //   "status": 500,
    //   "detail": "insert or update on table violates foreign key constraint",
    //   "code": "Internal Server Error"
    // }
    test("should fail with status 404 and an error with a message if categoryId is valid but does not exist.", async () => {
      const response0 = await request(usedHost)
        .post("/")
        .set(requestHeaders)
        .attach('image', testImage)
        .field('report', JSON.stringify({
          ...testReport0,
          categoryId: -999,
        }));
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
      const response0 = await request(usedHost).post("/");
      expect(response0.statusCode).toBe(401);
      expect(response0.body).not.toHaveProperty("meta");
      expect(response0.body).not.toHaveProperty("data");
      expect(response0.body).toHaveProperty("status", 401);
      expect(response0.body).toHaveProperty("code");
      expect(response0.body).toHaveProperty("detail");
    });
  });
});
