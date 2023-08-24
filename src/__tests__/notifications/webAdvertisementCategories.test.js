const request = require('supertest');

const usedHost = `${global.notificationsMicroserviceDefaultHost}/web/v1/notifications/advertisementCategory`;

describe("Advertisement Category management API points: ", () => {
    jest.setTimeout(8000);

    const requestHeaders = {
        Authorization: "Bearer ",
    };

    const testCategory0 = {
        name: 'sampleCategory 0',
        color: '#FAfe90',
    };

    const testCategory1 = {
        name: 'sampleCategory 1',
        color: '#00fe90',
    };

    const editCategory0 = {
        name: 'sampleCategory Edited 0',
        color: '#00fe90',
    };

    const editAdvertisement1 = {
        name: 'sampleCategory Edited 1',
        color: '#FAfe90',
    };

    beforeAll(async () => {
        const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
            .post('/accounts:signInWithPassword')
            .query({ key: global.firebaseKey })
            .send(global.firebaseTestWebUserLogin);
        requestHeaders.Authorization += firebaseAuth.body.idToken;
        // console.log(requestHeaders);
    });

    describe("POST /notifications/advertisementCategory/ ", () => {
        test("should respond with status 201 and the new object (data) after creating a new advertisement", async () => {
            const response0 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send(testCategory0);
            expect(response0.statusCode).toBe(201);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toHaveProperty("id");
            expect(response0.body.data).toHaveProperty("active");
            expect(response0.body.data.active).toBe(true);
            testCategory0.id = response0.body.data.id;
            const response1 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send(testCategory1);
            expect(response1.statusCode).toBe(201);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toHaveProperty("id");
            expect(response1.body.data).toHaveProperty("active");
            expect(response1.body.data.active).toBe(true);
            testCategory1.id = response1.body.data.id;
        });

        test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
            const response0 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send({
                    ...testCategory0,
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
                    ...testCategory0,
                    siteUri: 'not.an.URI.str'
                });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/')
                .set(requestHeaders)
                .send({
                    ...testCategory0,
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
                    ...testCategory0,
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
                    ...testCategory1,
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
                    ...testCategory1,
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
                    ...testCategory1,
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
                    ...testCategory1,
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

    describe("GET /notifications/advertisementCategory/ ", () => {
        test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
            const response0 = await request(usedHost).get('/')
                .set(requestHeaders)
                .query({ page: { number: 1, size: 2 } });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBe(2);
            expect(response0.body.data[0]).toEqual(expect.objectContaining(testCategory1));
            expect(response0.body.data[1]).toEqual(expect.objectContaining(testCategory0));
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

    describe("POST /notifications/advertisementCategory/edit ", () => {
        test("should respond with status 200 and the edited object (data)", async () => {
            const response0 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testCategory0, ...editCategory0
                });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.objectContaining({
                ...testCategory0, ...editCategory0
            }));
            const response1 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testCategory1, ...editAdvertisement1
                });
            expect(response1.statusCode).toBe(200);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toEqual(expect.objectContaining({
                ...testCategory1, ...editAdvertisement1
            }));
        });

        test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
            const response0 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testCategory0,
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
                    ...testCategory0,
                    siteUri: 'not.an.URI.str'
                });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/edit')
                .set(requestHeaders)
                .send({
                    ...testCategory0,
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
                    ...testCategory0,
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
                    ...testCategory1,
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
                    ...testCategory1,
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
                    id: testCategory1.id
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
                    ...testCategory1,
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
                    ...testCategory1,
                    id: testCategory1.id + 98976545120
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

    describe("POST /notifications/advertisementCategory/delete ", () => {
        test("should respond with status 200 and the deleted object's id (data)", async () => {
            const response0 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: testCategory0.id,
                });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual({ id: testCategory0.id });

            const response1 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: testCategory1.id,
                });
            expect(response1.statusCode).toBe(200);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toEqual({ id: testCategory1.id });
        });

        test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
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
                    id: { id: testCategory1.id },
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
                    id: testCategory0.id,
                });
            expect(response0.statusCode).toBe(404);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 404);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/delete')
                .set(requestHeaders)
                .send({
                    id: testCategory1.id,
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