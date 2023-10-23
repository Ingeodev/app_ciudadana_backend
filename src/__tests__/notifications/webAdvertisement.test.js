const request = require('supertest');

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/web/v1/notifications/informationmb`;

describe("Advertisement management API points: ", () => {
    jest.setTimeout(8000);

    const requestHeaders = {
        Authorization: "Bearer ",
    };

    const testAdvertisement0 = {
        imageUri: 'https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f1.png',
        siteUri: 'http://test.site.url',
    };

    const testAdvertisement1 = {
        imageUri: 'https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png',
        siteUri: 'https://test.site.url/second',
        categoryId: 1,
    };

    const editAdvertisement0 = {
        siteUri: 'http://edited.site.url',
        categoryId: 1,
        active: false,
    };

    const editAdvertisement1 = {
        imageUri: 'https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f7.png',
        categoryId: null,
    };

    beforeAll(async () => {
        const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
            .post('/accounts:signInWithPassword')
            .query({ key: global.firebaseKey })
            .send(global.firebaseTestWebUserLogin);
        requestHeaders.Authorization += firebaseAuth.body.idToken;
        // console.log(requestHeaders);
        // Create Mobile Service:
        const mobileServicesResponse = await request(global.notificationsMicroserviceDefaultHost)
            .post("/api/web/v1/notifications/mobile_services")
            .set(requestHeaders)
            .send({
                route: "Test Service Adv",
                name: "Test Service Adv",
                subtitle: "Test Service Adv",
                imageUri: "https://www.cali.gov.co/info/principal/media/bloque210342.png",
                icon: "https://www.cali.gov.co/info/principal/media/bloque210342.png",
                accessLevel: "Test Service Adv",
            });
        const categoryId = mobileServicesResponse.body.data.id;
        testAdvertisement1.categoryId = categoryId;
        editAdvertisement0.categoryId = categoryId;
    });

    afterAll(async () => {
        await request(global.notificationsMicroserviceDefaultHost)
            .post("/api/web/v1/notifications/mobile_services/delete")
            .set(requestHeaders)
            .send({
                id: testAdvertisement1.categoryId,
            });
    });

    describe("POST /notifications/informationmb/ ", () => {
        test("should respond with status 201 and the new object (data) after creating a new advertisement", async () => {
            const response0 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send(testAdvertisement0);
            expect(response0.statusCode).toBe(201);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toHaveProperty("id");
            expect(response0.body.data).toHaveProperty("active");
            expect(response0.body.data.active).toBe(true);
            testAdvertisement0.id = response0.body.data.id;
            const response1 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send(testAdvertisement1);
            expect(response1.statusCode).toBe(201);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toHaveProperty("id");
            expect(response1.body.data).toHaveProperty("active");
            expect(response1.body.data.active).toBe(true);
            testAdvertisement1.id = response1.body.data.id;
        });

        test("should fail with status 400 and an error with a message if the entry is not well formatted", async () => {
            const response0 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement0,
                    imageUri: 'not an URI string'
                });
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement0,
                    siteUri: 'not.an URI.str'
                });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement0,
                    imageUri: 0
                });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement0,
                    siteUri: { url: 'http://test.site.url' }
                });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement1,
                    categoryId: "not a number"
                });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement1,
                    categoryId: 1.5
                });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement1,
                    categoryId: { number: 127 }
                });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");
        });

        test("should fail with status 404 and an error with a message if the category does not exist", async () => {
            const response0 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement1,
                    categoryId: -5,
                });
            expect(response0.statusCode).toBe(404);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 404);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).post('/');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("GET /notifications/informationmb/ ", () => {
        test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
            const response0 = await request(usedHost).get('/')
                .set(requestHeaders)
                .query({ page: { number: 1, size: 2 } });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBe(2);
            expect(response0.body.data[0]).toEqual(expect.objectContaining(testAdvertisement1));
            expect(response0.body.data[1]).toEqual(expect.objectContaining(testAdvertisement0));
        });

        test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
            const response0 = await request(usedHost).get('/').set(requestHeaders);
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).get('/')
                .set(requestHeaders)
                .query({ page: {} });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).get('/')
                .set(requestHeaders)
                .query({ page: { number: 1 } });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).get('/')
                .set(requestHeaders)
                .query({ page: { size: 1 } });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedHost).get('/')
                .set(requestHeaders)
                .query({ page: { number: 0, size: 1 } });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedHost).get('/')
                .set(requestHeaders)
                .query({ page: { number: 1, size: 0 } });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedHost).get('/')
                .set(requestHeaders)
                .query({ page: { number: "A", size: 2 } });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");

            const response7 = await request(usedHost).get('/')
                .set(requestHeaders)
                .query({ page: { number: 2, size: "B" } });
            expect(response7.statusCode).toBe(400);
            expect(response7.body).not.toHaveProperty("data");
            expect(response7.body).toHaveProperty("status", 400);
            expect(response7.body).toHaveProperty("code");
            expect(response7.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).get('/');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("POST /notifications/informationmb/edit ", () => {
        test("should respond with status 200 and the edited object (data)", async () => {
            const response0 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement0, ...editAdvertisement0
                });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.objectContaining({
                ...testAdvertisement0, ...editAdvertisement0
            }));
            const response1 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement1, ...editAdvertisement1
                });
            expect(response1.statusCode).toBe(200);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toEqual(expect.objectContaining({
                ...testAdvertisement1, ...editAdvertisement1
            }));
        });

        test("should fail with status 400 and an error with a message if the entry is not well formatted", async () => {
            const response0 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement0,
                    id: undefined
                });
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement0,
                    siteUri: 'not.an URI.str'
                });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement0,
                    imageUri: 0
                });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement0,
                    siteUri: { url: 'http://test.site.url' }
                });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement1,
                    categoryId: "not a number"
                });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement1,
                    categoryId: 1.5
                });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement1.id
                });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");
        });

        test("should fail with status 404 and an error with a message if the category does not exist.", async () => {
            const response0 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement1,
                    categoryId: -5,
                });
            expect(response0.statusCode).toBe(404);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 404);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });

        test("should fail with status 404 and an error with a message if the id does not exist", async () => {
            const response0 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testAdvertisement1,
                    id: testAdvertisement1.id + 98976545120
                });
            expect(response0.statusCode).toBe(404);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 404);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).post('/edit');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("POST /notifications/informationmb/status ", () => {
        test("should respond with status 200 and the edited object (data)", async () => {
            const response0 = await request(usedHost).post('/status')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement0.id,
                    active: true,
                });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.objectContaining({
                ...testAdvertisement0, ...editAdvertisement0, active: true,
            }));
            const response1 = await request(usedHost).post('/status')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement1.id,
                    active: false,
                });
            expect(response1.statusCode).toBe(200);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toEqual(expect.objectContaining({
                ...testAdvertisement1, ...editAdvertisement1, active: false,
            }));
        });

        test("should fail with status 400 and an error with a message if the entry is not well formatted", async () => {
            const response0 = await request(usedHost).post('/status')
                .set(requestHeaders)
                .send({
                    active: false,
                    id: undefined
                });
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/status')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement1.id,
                });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/status')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement1.id,
                    active: null,
                });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).post('/status')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement1.id,
                    active: { url: 'http://test.site.url' }
                });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedHost).post('/status')
                .set(requestHeaders)
                .send({
                    id: "aBc",
                    active: true
                });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");
        });

        test("should fail with status 404 and an error with a message if the id does not exist", async () => {
            const response0 = await request(usedHost).post('/status')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement1.id + 98976545125,
                    active: true,
                });
            expect(response0.statusCode).toBe(404);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 404);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).post('/status');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("POST /notifications/informationmb/delete ", () => {
        test("should respond with status 200 and the deleted object's id (data)", async () => {
            const response0 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement0.id,
                });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual({ id: testAdvertisement0.id });

            const response1 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement1.id,
                });
            expect(response1.statusCode).toBe(200);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toEqual({ id: testAdvertisement1.id });
        });

        test("should fail with status 400 and an error with a message if the entry is not well formatted", async () => {
            const response0 = await request(usedHost).post('/delete').set(requestHeaders);
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: undefined
                });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: null,
                });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: { id: testAdvertisement1.id },
                });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: "aBc",
                });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");
        });

        test("should fail with status 404 and an error with a message if the id does not exist", async () => {
            const response0 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement0.id,
                });
            expect(response0.statusCode).toBe(404);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 404);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: testAdvertisement1.id,
                });
            expect(response1.statusCode).toBe(404);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 404);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).post('/delete');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });
});