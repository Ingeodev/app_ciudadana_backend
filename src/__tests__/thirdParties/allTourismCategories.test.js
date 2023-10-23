const request = require('supertest');

const usedWebHost = `${global.thirdPartiesMicroserviceDefaultHost}/api/web/v1/third_parties/tourism_categories`;
const usedMobileHost = `${global.thirdPartiesMicroserviceDefaultHost}/api/mobile/v1/third_parties/tourism/categories`;

describe("All Tourism Categories API points: ", () => {
    jest.setTimeout(8000);

    const requestHeadersWeb = {
        Authorization: "Bearer ",
    };

    const requestHeadersMobile = {
        Authorization: "Bearer ",
    };

    const testTourCat0 = {
        name: "Sample Tourism Category 1",
        color: "#AAFFBB",
        icon: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f3.png",
        iconMap: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f3.png",
    };

    const testTourCat1 = {
        name: "Sample Tourism Category 2",
        color: "#123456",
        icon: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f4.png",
        iconMap: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f4.png",
    };

    const editPoint0 = {
        name: "Edited Sample Tourism Category 1",
        color: "#CCBBAA",
    };

    const editPoint1 = {
        icon: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f7.png",
        iconMap: global.fileManagementMicroserviceOnlineHost + "/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f7.png",
    };

    const mobileResponseFormat = {
        id: expect.any(Number),
        name: expect.any(String),
        color: expect.any(String),
        icon: expect.any(String),
        iconMap: expect.any(String),
    }

    beforeAll(async () => {
        const firebaseAuthWeb = await request("https://identitytoolkit.googleapis.com/v1")
            .post('/accounts:signInWithPassword')
            .query({ key: global.firebaseKey })
            .send(global.firebaseTestWebUserLogin);
        requestHeadersWeb.Authorization += firebaseAuthWeb.body.idToken;
        // console.log(requestHeadersWeb);

        const firebaseAuthMobile = await request("https://identitytoolkit.googleapis.com/v1")
            .post('/accounts:signInWithPassword')
            .query({ key: global.firebaseKey })
            .send(global.firebaseTestMobileUserLogin);
        requestHeadersMobile.Authorization += firebaseAuthMobile.body.idToken;
        // console.log(requestHeadersMobile);

    });

    describe("Web POST third_parties/tourism_categories ", () => {
        test("should respond with status 201 and the new object (data) after creating a new Tourism Category", async () => {
            const response0 = await request(usedWebHost).post('/')
                .set(requestHeadersWeb)
                .send(testTourCat0);
            expect(response0.statusCode).toBe(201);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toHaveProperty("id");
            testTourCat0.id = response0.body.data.id;
            expect(response0.body.data).toEqual(expect.objectContaining(testTourCat0));
            const response1 = await request(usedWebHost).post('/')
                .set(requestHeadersWeb)
                .send(testTourCat1);
            expect(response1.statusCode).toBe(201);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toHaveProperty("id");
            testTourCat1.id = response1.body.data.id;
            expect(response1.body.data).toEqual(expect.objectContaining(testTourCat1));
        });

        test("should fail with status 400 and an error with a message if the entry is not well formatted", async () => {
            const response0 = await request(usedWebHost).post('/')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat0,
                    icon: 'not an URI string'
                });
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedWebHost).post('/')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat0,
                    name: 123456
                });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedWebHost).post('/')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat0,
                    iconMap: 0
                });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedWebHost).post('/')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat0,
                    color: "Not a color"
                });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedWebHost).post('/')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat1,
                    name: ["not a string"]
                });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedWebHost).post('/')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat1,
                    color: "0xAF"
                });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedWebHost).post('/')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat1,
                    icon: { number: 127 }
                });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");
        });

        test("should fail with status 403 and an error with a message if the request comes from a web user", async () => {
            const response0 = await request(usedWebHost).post('/')
                .set(requestHeadersMobile)
                .send({
                    ...testTourCat1,
                });
            expect(response0.statusCode).toBe(403);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 403);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedWebHost).post('/');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("Web GET /third_parties/tourism_categories/ ", () => {
        test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
            const response0 = await request(usedWebHost).get('/')
                .set(requestHeadersWeb)
                .query({ page: { number: 1, size: 2 } });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBe(2);
            expect(response0.body.data[0]).toEqual(expect.objectContaining(testTourCat1));
            expect(response0.body.data[1]).toEqual(expect.objectContaining(testTourCat0));
        });

        test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
            const response0 = await request(usedWebHost).get('/').set(requestHeadersWeb);
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedWebHost).get('/')
                .set(requestHeadersWeb)
                .query({ page: {} });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedWebHost).get('/')
                .set(requestHeadersWeb)
                .query({ page: { number: 1 } });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedWebHost).get('/')
                .set(requestHeadersWeb)
                .query({ page: { size: 1 } });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedWebHost).get('/')
                .set(requestHeadersWeb)
                .query({ page: { number: 0, size: 1 } });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedWebHost).get('/')
                .set(requestHeadersWeb)
                .query({ page: { number: 1, size: 0 } });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedWebHost).get('/')
                .set(requestHeadersWeb)
                .query({ page: { number: "A", size: 2 } });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");

            const response7 = await request(usedWebHost).get('/')
                .set(requestHeadersWeb)
                .query({ page: { number: 2, size: "B" } });
            expect(response7.statusCode).toBe(400);
            expect(response7.body).not.toHaveProperty("data");
            expect(response7.body).toHaveProperty("status", 400);
            expect(response7.body).toHaveProperty("code");
            expect(response7.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedWebHost).get('/');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("Web POST /third_parties/tourism_categories/edit ", () => {
        test("should respond with status 200 and the edited object (data)", async () => {
            const response0 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat0, ...editPoint0
                });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.objectContaining({
                ...testTourCat0, ...editPoint0
            }));
            const response1 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat1, ...editPoint1
                });
            expect(response1.statusCode).toBe(200);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toEqual(expect.objectContaining({
                ...testTourCat1, ...editPoint1
            }));
        });

        test("should fail with status 400 and an error with a message if the entry is not well formatted", async () => {
            const response0 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat0,
                    id: undefined
                });
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat0,
                    icon: { uri: testTourCat0.icon }
                });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat0,
                    name: ["123456"]
                });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat0,
                    iconMap: null
                });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat1,
                    color: "123"
                });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat1,
                    name: 12345
                });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat1,
                    iconMap: { iconMap: 123 }
                });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");

            const response7 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat1,
                    iconMap: "lon map"
                });
            expect(response7.statusCode).toBe(400);
            expect(response7.body).not.toHaveProperty("data");
            expect(response7.body).toHaveProperty("status", 400);
            expect(response7.body).toHaveProperty("code");
            expect(response7.body).toHaveProperty("detail");

            const response8 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    id: testTourCat1.id,
                });
            expect(response8.statusCode).toBe(400);
            expect(response8.body).not.toHaveProperty("data");
            expect(response8.body).toHaveProperty("status", 400);
            expect(response8.body).toHaveProperty("code");
            expect(response8.body).toHaveProperty("detail");
        });

        test("should fail with status 404 and an error with a message if the id does not exist", async () => {
            const response0 = await request(usedWebHost).post('/edit')
                .set(requestHeadersWeb)
                .send({
                    ...testTourCat1,
                    id: testTourCat1.id + 98976545120
                });
            expect(response0.statusCode).toBe(404);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 404);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedWebHost).post('/edit');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("Mobile API point: ", () => {

        describe("GET /third_parties/tourism/categories ", () => {
            test("should respond with status 200 and a list of at least two objects in the required format.", async () => {
                const response0 = await request(usedMobileHost).get('/')
                    .set(requestHeadersMobile);
                expect(response0.statusCode).toBe(200);
                expect(response0.body).toEqual(expect.any(Array));
                expect(response0.body.length).toBeGreaterThanOrEqual(2);
                response0.body.forEach(item => {
                    expect(item).toEqual(mobileResponseFormat);
                });

                const response1 = await request(usedMobileHost).get('/')
                    .set(requestHeadersMobile)
                    .query({ page: { size: 1, number: 1 } });
                expect(response1.statusCode).toBe(200);
                expect(response1.body).toEqual(expect.any(Array));
                expect(response1.body.length).toBe(1);
                response0.body.forEach(item => {
                    expect(item).toEqual(mobileResponseFormat);
                });
            });

            test("should fail with status 400 and an error with a message if pagination is wrongly provided", async () => {
                const response0 = await request(usedWebHost).get('/').set(requestHeadersMobile)
                    .query({ page: { size: "n", number: 1 } });
                expect(response0.statusCode).toBe(400);
                expect(response0.body).not.toHaveProperty("data");
                expect(response0.body).toHaveProperty("status", 400);
                expect(response0.body).toHaveProperty("code");
                expect(response0.body).toHaveProperty("detail");

                const response1 = await request(usedMobileHost).get('/')
                    .set(requestHeadersMobile)
                    .query({ page: { size: 1, number: null } });
                expect(response1.statusCode).toBe(400);
                expect(response1.body).not.toHaveProperty("data");
                expect(response1.body).toHaveProperty("status", 400);
                expect(response1.body).toHaveProperty("code");
                expect(response1.body).toHaveProperty("detail");

                const response2 = await request(usedMobileHost).get('/')
                    .set(requestHeadersMobile)
                    .query({ page: { size: 1 } });
                expect(response2.statusCode).toBe(400);
                expect(response2.body).not.toHaveProperty("data");
                expect(response2.body).toHaveProperty("status", 400);
                expect(response2.body).toHaveProperty("code");
                expect(response2.body).toHaveProperty("detail");

                const response3 = await request(usedMobileHost).get('/')
                    .set(requestHeadersMobile)
                    .query({ page: { number: 1 } });
                expect(response3.statusCode).toBe(400);
                expect(response3.body).not.toHaveProperty("data");
                expect(response3.body).toHaveProperty("status", 400);
                expect(response3.body).toHaveProperty("code");
                expect(response3.body).toHaveProperty("detail");
            });

            test("should fail with error 401 and a message if Authorization header is not set.", async () => {
                const response0 = await request(usedMobileHost).get('/');
                expect(response0.statusCode).toBe(401);
                expect(response0.body).not.toHaveProperty("data");
                expect(response0.body).toHaveProperty("status", 401);
                expect(response0.body).toHaveProperty("code");
                expect(response0.body).toHaveProperty("detail");
            });
        });

    });

    describe("Web POST /third_parties/tourism_categories/delete ", () => {
        test("should respond with status 200 and the deleted object's id (data)", async () => {
            const response0 = await request(usedWebHost).post('/delete')
                .set(requestHeadersWeb)
                .send({
                    id: testTourCat0.id,
                });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual({ id: testTourCat0.id });

            const response1 = await request(usedWebHost).post('/delete')
                .set(requestHeadersWeb)
                .send({
                    id: testTourCat1.id,
                });
            expect(response1.statusCode).toBe(200);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toEqual({ id: testTourCat1.id });
        });

        test("should fail with status 400 and an error with a message if the entry is not well formatted", async () => {
            const response0 = await request(usedWebHost).post('/delete').set(requestHeadersWeb);
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedWebHost).post('/delete')
                .set(requestHeadersWeb)
                .send({
                    id: undefined
                });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedWebHost).post('/delete')
                .set(requestHeadersWeb)
                .send({
                    id: null,
                });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedWebHost).post('/delete')
                .set(requestHeadersWeb)
                .send({
                    id: { id: testTourCat1.id },
                });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedWebHost).post('/delete')
                .set(requestHeadersWeb)
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
            const response0 = await request(usedWebHost).post('/delete')
                .set(requestHeadersWeb)
                .send({
                    id: testTourCat0.id,
                });
            expect(response0.statusCode).toBe(404);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 404);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedWebHost).post('/delete')
                .set(requestHeadersWeb)
                .send({
                    id: testTourCat1.id,
                });
            expect(response1.statusCode).toBe(404);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 404);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedWebHost).post('/delete');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });
});