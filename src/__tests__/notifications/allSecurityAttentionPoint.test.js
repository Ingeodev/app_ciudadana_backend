const request = require('supertest');

const usedWebHost = `${global.notificationsMicroserviceDefaultHost}/api/web/v1/notifications/security/attentionPoint`;
const usedMobileHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/security/attention_points`;

describe("All Security Attention Point API points: ", () => {
    jest.setTimeout(8000);

    const requestHeadersWeb = {
        Authorization: "Bearer ",
    };

    const requestHeadersMobile = {
        Authorization: "Bearer ",
    };

    const testPoint0 = {
        name: "Sample Point",
        description: "Example security attention Point",
        phone: "3001234567",
        color: "#AAFFBB",
        address: "Cl. 10 #35-2 a 35-60, Olimpico, Cali, Valle del Cauca",
        imageUri: "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f3.png",
        lat: -80.54321,
        lon: 5.12345,
    };

    const testPoint1 = {
        name: "Sample Point 2",
        description: "Second example security attention Point",
        phone: "3001234568",
        color: "#123456",
        address: "Cl. 11 #36-6, Olimpo, Cali, Valle del Cauca",
        imageUri: "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f4.png",
        lat: 80.54321,
        lon: -5.12345,
    };

    const editPoint0 = {
        description: "Edited example security attention Point",
        imageUri: 'https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-abcd-11bc0d1457f0.png',
        color: "#CCBBAA",
        phone: "5001234568",
    };

    const editPoint1 = {
        name: "Edited Sample Point 2",
        address: "Cl. 17 #55-15, Olimpo, Cali, Valle del Cauca",
        lat: 90,
        lon: -6,
    };

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

    describe("Web API points: ", () => {

        describe("POST notifications/security/attentionPoint ", () => {
            test("should respond with status 201 and the new object (data) after creating a new Security Attention Point", async () => {
                const response0 = await request(usedWebHost).post('/')
                    .set(requestHeadersWeb)
                    .send(testPoint0);
                expect(response0.statusCode).toBe(201);
                expect(response0.body).toHaveProperty("data");
                expect(response0.body.data).toHaveProperty("id");
                testPoint0.id = response0.body.data.id;
                expect(response0.body.data).toEqual(expect.objectContaining(testPoint0));
                const response1 = await request(usedWebHost).post('/')
                    .set(requestHeadersWeb)
                    .send(testPoint1);
                expect(response1.statusCode).toBe(201);
                expect(response1.body).toHaveProperty("data");
                expect(response1.body.data).toHaveProperty("id");
                testPoint1.id = response1.body.data.id;
                expect(response1.body.data).toEqual(expect.objectContaining(testPoint1));
            });

            test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
                const response0 = await request(usedWebHost).post('/')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint0,
                        imageUri: 'not an URI string'
                    });
                expect(response0.statusCode).toBe(400);
                expect(response0.body).not.toHaveProperty("data");
                expect(response0.body).toHaveProperty("status", 400);
                expect(response0.body).toHaveProperty("code");
                expect(response0.body).toHaveProperty("detail");

                const response1 = await request(usedWebHost).post('/')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint0,
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
                        ...testPoint0,
                        description: 0
                    });
                expect(response2.statusCode).toBe(400);
                expect(response2.body).not.toHaveProperty("data");
                expect(response2.body).toHaveProperty("status", 400);
                expect(response2.body).toHaveProperty("code");
                expect(response2.body).toHaveProperty("detail");

                const response3 = await request(usedWebHost).post('/')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint0,
                        phone: "Not a number"
                    });
                expect(response3.statusCode).toBe(400);
                expect(response3.body).not.toHaveProperty("data");
                expect(response3.body).toHaveProperty("status", 400);
                expect(response3.body).toHaveProperty("code");
                expect(response3.body).toHaveProperty("detail");

                const response4 = await request(usedWebHost).post('/')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint1,
                        address: ["not a string"]
                    });
                expect(response4.statusCode).toBe(400);
                expect(response4.body).not.toHaveProperty("data");
                expect(response4.body).toHaveProperty("status", 400);
                expect(response4.body).toHaveProperty("code");
                expect(response4.body).toHaveProperty("detail");

                const response5 = await request(usedWebHost).post('/')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint1,
                        lat: "0xAF"
                    });
                expect(response5.statusCode).toBe(400);
                expect(response5.body).not.toHaveProperty("data");
                expect(response5.body).toHaveProperty("status", 400);
                expect(response5.body).toHaveProperty("code");
                expect(response5.body).toHaveProperty("detail");

                const response6 = await request(usedWebHost).post('/')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint1,
                        lon: { number: 127 }
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
                        ...testPoint1,
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

        describe("GET /notifications/security/attentionPoint/ ", () => {
            test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
                const response0 = await request(usedWebHost).get('/')
                    .set(requestHeadersWeb)
                    .query({ page: { number: 1, size: 2 } });
                expect(response0.statusCode).toBe(200);
                expect(response0.body).toHaveProperty("data");
                expect(response0.body.data).toEqual(expect.any(Array));
                expect(response0.body.data.length).toBe(2);
                expect(response0.body.data[0]).toEqual(expect.objectContaining(testPoint1));
                expect(response0.body.data[1]).toEqual(expect.objectContaining(testPoint0));
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

        describe("POST /notifications/security/attentionPoint/edit ", () => {
            test("should respond with status 200 and the edited object (data)", async () => {
                const response0 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint0, ...editPoint0
                    });
                expect(response0.statusCode).toBe(200);
                expect(response0.body).toHaveProperty("data");
                expect(response0.body.data).toEqual(expect.objectContaining({
                    ...testPoint0, ...editPoint0
                }));
                const response1 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint1, ...editPoint1
                    });
                expect(response1.statusCode).toBe(200);
                expect(response1.body).toHaveProperty("data");
                expect(response1.body.data).toEqual(expect.objectContaining({
                    ...testPoint1, ...editPoint1
                }));
            });

            test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
                const response0 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint0,
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
                        ...testPoint0,
                        imageUri: { uri: testPoint0.imageUri }
                    });
                expect(response1.statusCode).toBe(400);
                expect(response1.body).not.toHaveProperty("data");
                expect(response1.body).toHaveProperty("status", 400);
                expect(response1.body).toHaveProperty("code");
                expect(response1.body).toHaveProperty("detail");

                const response2 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint0,
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
                        ...testPoint0,
                        description: null
                    });
                expect(response3.statusCode).toBe(400);
                expect(response3.body).not.toHaveProperty("data");
                expect(response3.body).toHaveProperty("status", 400);
                expect(response3.body).toHaveProperty("code");
                expect(response3.body).toHaveProperty("detail");

                const response4 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint1,
                        phone: "123"
                    });
                expect(response4.statusCode).toBe(400);
                expect(response4.body).not.toHaveProperty("data");
                expect(response4.body).toHaveProperty("status", 400);
                expect(response4.body).toHaveProperty("code");
                expect(response4.body).toHaveProperty("detail");

                const response5 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint1,
                        address: 12345
                    });
                expect(response5.statusCode).toBe(400);
                expect(response5.body).not.toHaveProperty("data");
                expect(response5.body).toHaveProperty("status", 400);
                expect(response5.body).toHaveProperty("code");
                expect(response5.body).toHaveProperty("detail");

                const response6 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint1,
                        lat: { lat: 123 }
                    });
                expect(response6.statusCode).toBe(400);
                expect(response6.body).not.toHaveProperty("data");
                expect(response6.body).toHaveProperty("status", 400);
                expect(response6.body).toHaveProperty("code");
                expect(response6.body).toHaveProperty("detail");

                const response7 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint1,
                        lon: "lon"
                    });
                expect(response7.statusCode).toBe(400);
                expect(response7.body).not.toHaveProperty("data");
                expect(response7.body).toHaveProperty("status", 400);
                expect(response7.body).toHaveProperty("code");
                expect(response7.body).toHaveProperty("detail");

                const response8 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        id: testPoint1.id,
                        lat: 5
                    });
                expect(response8.statusCode).toBe(400);
                expect(response8.body).not.toHaveProperty("data");
                expect(response8.body).toHaveProperty("status", 400);
                expect(response8.body).toHaveProperty("code");
                expect(response8.body).toHaveProperty("detail");

                const response9 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        id: testPoint1.id,
                        lat: 5
                    });
                expect(response9.statusCode).toBe(400);
                expect(response9.body).not.toHaveProperty("data");
                expect(response9.body).toHaveProperty("status", 400);
                expect(response9.body).toHaveProperty("code");
                expect(response9.body).toHaveProperty("detail");

                const response10 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        id: testPoint1.id
                    });
                expect(response10.statusCode).toBe(400);
                expect(response10.body).not.toHaveProperty("data");
                expect(response10.body).toHaveProperty("status", 400);
                expect(response10.body).toHaveProperty("code");
                expect(response10.body).toHaveProperty("detail");
            });

            test("should fail with status 404 and an error with a message if the id does not exist", async () => {
                const response0 = await request(usedWebHost).post('/edit')
                    .set(requestHeadersWeb)
                    .send({
                        ...testPoint1,
                        id: testPoint1.id + 98976545120
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

        describe("POST /notifications/security/attentionPoint/delete ", () => {
            test("should respond with status 200 and the deleted object's id (data)", async () => {
                const response0 = await request(usedWebHost).post('/delete')
                    .set(requestHeadersWeb)
                    .send({
                        id: testPoint0.id,
                    });
                expect(response0.statusCode).toBe(200);
                expect(response0.body).toHaveProperty("data");
                expect(response0.body.data).toEqual({ id: testPoint0.id });

                const response1 = await request(usedWebHost).post('/delete')
                    .set(requestHeadersWeb)
                    .send({
                        id: testPoint1.id,
                    });
                expect(response1.statusCode).toBe(200);
                expect(response1.body).toHaveProperty("data");
                expect(response1.body.data).toEqual({ id: testPoint1.id });
            });

            test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
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
                        id: { id: testPoint1.id },
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
                        id: testPoint0.id,
                    });
                expect(response0.statusCode).toBe(404);
                expect(response0.body).not.toHaveProperty("data");
                expect(response0.body).toHaveProperty("status", 404);
                expect(response0.body).toHaveProperty("code");
                expect(response0.body).toHaveProperty("detail");

                const response1 = await request(usedWebHost).post('/delete')
                    .set(requestHeadersWeb)
                    .send({
                        id: testPoint1.id,
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

    // describe("Mobile API points: ", async () => {
    // });
});