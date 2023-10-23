const request = require('supertest');

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/web/v1/notifications/advertisementCategory`;

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

    test('TODO: Replace with test of MobileServices', async () => {
        return true;
    });

    // describe("POST /notifications/advertisementCategory/ ", () => {
    //     test("should respond with status 201 and the new object (data) after creating a new advertisement category", async () => {
    //         const response0 = await request(usedHost).post('/')
    //             .set(requestHeaders)
    //             .send(testCategory0);
    //         expect(response0.statusCode).toBe(201);
    //         expect(response0.body).toHaveProperty("data");
    //         expect(response0.body.data).toHaveProperty("id");
    //         testCategory0.id = response0.body.data.id;
    //         expect(response0.body.data).toEqual(expect.objectContaining({ ...testCategory0 }));
    //         const response1 = await request(usedHost).post('/')
    //             .set(requestHeaders)
    //             .send(testCategory1);
    //         expect(response1.statusCode).toBe(201);
    //         expect(response1.body).toHaveProperty("data");
    //         expect(response1.body.data).toHaveProperty("id");
    //         testCategory1.id = response1.body.data.id;
    //         expect(response1.body.data).toEqual(expect.objectContaining({ ...testCategory1 }));
    //     });

    //     test("should fail with status 400 and an error with a message if the entry is not well formatted", async () => {
    //         const response0 = await request(usedHost).post('/')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory0,
    //                 name: ['not a string']
    //             });
    //         expect(response0.statusCode).toBe(400);
    //         expect(response0.body).not.toHaveProperty("data");
    //         expect(response0.body).toHaveProperty("status", 400);
    //         expect(response0.body).toHaveProperty("code");
    //         expect(response0.body).toHaveProperty("detail");

    //         const response1 = await request(usedHost).post('/')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory0,
    //                 color: 'not.an HEXColor.str'
    //             });
    //         expect(response1.statusCode).toBe(400);
    //         expect(response1.body).not.toHaveProperty("data");
    //         expect(response1.body).toHaveProperty("status", 400);
    //         expect(response1.body).toHaveProperty("code");
    //         expect(response1.body).toHaveProperty("detail");

    //         const response2 = await request(usedHost).post('/')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory0,
    //                 name: 0
    //             });
    //         expect(response2.statusCode).toBe(400);
    //         expect(response2.body).not.toHaveProperty("data");
    //         expect(response2.body).toHaveProperty("status", 400);
    //         expect(response2.body).toHaveProperty("code");
    //         expect(response2.body).toHaveProperty("detail");

    //         const response3 = await request(usedHost).post('/')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory0,
    //                 color: "Blue"
    //             });
    //         expect(response3.statusCode).toBe(400);
    //         expect(response3.body).not.toHaveProperty("data");
    //         expect(response3.body).toHaveProperty("status", 400);
    //         expect(response3.body).toHaveProperty("code");
    //         expect(response3.body).toHaveProperty("detail");

    //         const response4 = await request(usedHost).post('/')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory1,
    //                 color: "0xFAFEF0"
    //             });
    //         expect(response4.statusCode).toBe(400);
    //         expect(response4.body).not.toHaveProperty("data");
    //         expect(response4.body).toHaveProperty("status", 400);
    //         expect(response4.body).toHaveProperty("code");
    //         expect(response4.body).toHaveProperty("detail");
    //     });

    //     test("should fail with error 401 and a message if Authorization header is not set.", async () => {
    //         const response0 = await request(usedHost).post('/');
    //         expect(response0.statusCode).toBe(401);
    //         expect(response0.body).not.toHaveProperty("data");
    //         expect(response0.body).toHaveProperty("status", 401);
    //         expect(response0.body).toHaveProperty("code");
    //         expect(response0.body).toHaveProperty("detail");
    //     });
    // });

    // describe("GET /notifications/advertisementCategory/ ", () => {
    //     test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
    //         const response0 = await request(usedHost).get('/')
    //             .set(requestHeaders)
    //             .query({ page: { number: 1, size: 2 } });
    //         expect(response0.statusCode).toBe(200);
    //         expect(response0.body).toHaveProperty("meta");
    //         expect(response0.body).toHaveProperty("data");
    //         expect(response0.body.data).toEqual(expect.any(Array));
    //         expect(response0.body.data.length).toBe(2);
    //         expect(response0.body.data[0]).toEqual(expect.objectContaining(testCategory1));
    //         expect(response0.body.data[1]).toEqual(expect.objectContaining(testCategory0));
    //     });

    //     test("should respond with status 200 and a list of several objects if no pagination is provided", async () => {
    //         const response0 = await request(usedHost).get('/').set(requestHeaders);
    //         expect(response0.statusCode).toBe(200);
    //         expect(response0.body).toHaveProperty("meta");
    //         expect(response0.body).toHaveProperty("data");
    //         expect(response0.body.data).toEqual(expect.any(Array));
    //     });

    //     test("should respond with error 400 if pagination is wrongly provided", async () => {
    //         const response1 = await request(usedHost).get('/')
    //             .set(requestHeaders)
    //             .query({ page: null });
    //         expect(response1.statusCode).toBe(400);
    //         expect(response1.body).not.toHaveProperty("data");
    //         expect(response1.body).toHaveProperty("status", 400);
    //         expect(response1.body).toHaveProperty("code");
    //         expect(response1.body).toHaveProperty("detail");

    //         const response2 = await request(usedHost).get('/')
    //             .set(requestHeaders)
    //             .query({ page: { number: 1 } });
    //         expect(response2.statusCode).toBe(400);
    //         expect(response2.body).not.toHaveProperty("data");
    //         expect(response2.body).toHaveProperty("status", 400);
    //         expect(response2.body).toHaveProperty("code");
    //         expect(response2.body).toHaveProperty("detail");

    //         const response3 = await request(usedHost).get('/')
    //             .set(requestHeaders)
    //             .query({ page: { size: 1 } });
    //         expect(response3.statusCode).toBe(400);
    //         expect(response3.body).not.toHaveProperty("data");
    //         expect(response3.body).toHaveProperty("status", 400);
    //         expect(response3.body).toHaveProperty("code");
    //         expect(response3.body).toHaveProperty("detail");

    //         const response4 = await request(usedHost).get('/')
    //             .set(requestHeaders)
    //             .query({ page: { number: 0, size: 1 } });
    //         expect(response4.statusCode).toBe(400);
    //         expect(response4.body).not.toHaveProperty("data");
    //         expect(response4.body).toHaveProperty("status", 400);
    //         expect(response4.body).toHaveProperty("code");
    //         expect(response4.body).toHaveProperty("detail");

    //         const response5 = await request(usedHost).get('/')
    //             .set(requestHeaders)
    //             .query({ page: { number: 1, size: 0 } });
    //         expect(response5.statusCode).toBe(400);
    //         expect(response5.body).not.toHaveProperty("data");
    //         expect(response5.body).toHaveProperty("status", 400);
    //         expect(response5.body).toHaveProperty("code");
    //         expect(response5.body).toHaveProperty("detail");

    //         const response6 = await request(usedHost).get('/')
    //             .set(requestHeaders)
    //             .query({ page: { number: "A", size: 2 } });
    //         expect(response6.statusCode).toBe(400);
    //         expect(response6.body).not.toHaveProperty("data");
    //         expect(response6.body).toHaveProperty("status", 400);
    //         expect(response6.body).toHaveProperty("code");
    //         expect(response6.body).toHaveProperty("detail");

    //         const response7 = await request(usedHost).get('/')
    //             .set(requestHeaders)
    //             .query({ page: { number: 2, size: "B" } });
    //         expect(response7.statusCode).toBe(400);
    //         expect(response7.body).not.toHaveProperty("data");
    //         expect(response7.body).toHaveProperty("status", 400);
    //         expect(response7.body).toHaveProperty("code");
    //         expect(response7.body).toHaveProperty("detail");
    //     });

    //     test("should fail with error 401 and a message if Authorization header is not set.", async () => {
    //         const response0 = await request(usedHost).get('/');
    //         expect(response0.statusCode).toBe(401);
    //         expect(response0.body).not.toHaveProperty("data");
    //         expect(response0.body).toHaveProperty("status", 401);
    //         expect(response0.body).toHaveProperty("code");
    //         expect(response0.body).toHaveProperty("detail");
    //     });
    // });

    // describe("POST /notifications/advertisementCategory/edit ", () => {
    //     test("should respond with status 200 and the edited object (data)", async () => {
    //         const response0 = await request(usedHost).post('/edit')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory0, ...editCategory0
    //             });
    //         expect(response0.statusCode).toBe(200);
    //         expect(response0.body).toHaveProperty("data");
    //         expect(response0.body.data).toEqual(expect.objectContaining({
    //             ...testCategory0, ...editCategory0
    //         }));
    //         const response1 = await request(usedHost).post('/edit')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory1, ...editAdvertisement1
    //             });
    //         expect(response1.statusCode).toBe(200);
    //         expect(response1.body).toHaveProperty("data");
    //         expect(response1.body.data).toEqual(expect.objectContaining({
    //             ...testCategory1, ...editAdvertisement1
    //         }));
    //     });

    //     test("should fail with status 400 and an error with a message if the entry is not well formatted", async () => {
    //         const response0 = await request(usedHost).post('/edit')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory0,
    //                 id: undefined
    //             });
    //         expect(response0.statusCode).toBe(400);
    //         expect(response0.body).not.toHaveProperty("data");
    //         expect(response0.body).toHaveProperty("status", 400);
    //         expect(response0.body).toHaveProperty("code");
    //         expect(response0.body).toHaveProperty("detail");

    //         const response1 = await request(usedHost).post('/edit')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory0,
    //                 name: ['not a string']
    //             });
    //         expect(response1.statusCode).toBe(400);
    //         expect(response1.body).not.toHaveProperty("data");
    //         expect(response1.body).toHaveProperty("status", 400);
    //         expect(response1.body).toHaveProperty("code");
    //         expect(response1.body).toHaveProperty("detail");

    //         const response2 = await request(usedHost).post('/edit')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory0,
    //                 color: 'not.an HEXColor.str'
    //             });
    //         expect(response2.statusCode).toBe(400);
    //         expect(response2.body).not.toHaveProperty("data");
    //         expect(response2.body).toHaveProperty("status", 400);
    //         expect(response2.body).toHaveProperty("code");
    //         expect(response2.body).toHaveProperty("detail");

    //         const response3 = await request(usedHost).post('/edit')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory0,
    //                 name: 0
    //             });
    //         expect(response3.statusCode).toBe(400);
    //         expect(response3.body).not.toHaveProperty("data");
    //         expect(response3.body).toHaveProperty("status", 400);
    //         expect(response3.body).toHaveProperty("code");
    //         expect(response3.body).toHaveProperty("detail");

    //         const response4 = await request(usedHost).post('/edit')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory1,
    //                 color: "Blue"
    //             });
    //         expect(response4.statusCode).toBe(400);
    //         expect(response4.body).not.toHaveProperty("data");
    //         expect(response4.body).toHaveProperty("status", 400);
    //         expect(response4.body).toHaveProperty("code");
    //         expect(response4.body).toHaveProperty("detail");

    //         const response5 = await request(usedHost).post('/edit')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory1,
    //                 color: "0xFAFEF0"
    //             });
    //         expect(response5.statusCode).toBe(400);
    //         expect(response5.body).not.toHaveProperty("data");
    //         expect(response5.body).toHaveProperty("status", 400);
    //         expect(response5.body).toHaveProperty("code");
    //         expect(response5.body).toHaveProperty("detail");

    //         const response6 = await request(usedHost).post('/edit')
    //             .set(requestHeaders)
    //             .send({
    //                 id: testCategory1.id
    //             });
    //         expect(response6.statusCode).toBe(400);
    //         expect(response6.body).not.toHaveProperty("data");
    //         expect(response6.body).toHaveProperty("status", 400);
    //         expect(response6.body).toHaveProperty("code");
    //         expect(response6.body).toHaveProperty("detail");
    //     });

    //     test("should fail with status 404 and an error with a message if the id does not exist", async () => {
    //         const response0 = await request(usedHost).post('/edit')
    //             .set(requestHeaders)
    //             .send({
    //                 ...testCategory1,
    //                 id: testCategory1.id + 98976545120
    //             });
    //         expect(response0.statusCode).toBe(404);
    //         expect(response0.body).not.toHaveProperty("data");
    //         expect(response0.body).toHaveProperty("status", 404);
    //         expect(response0.body).toHaveProperty("code");
    //         expect(response0.body).toHaveProperty("detail");
    //     });

    //     test("should fail with error 401 and a message if Authorization header is not set.", async () => {
    //         const response0 = await request(usedHost).post('/edit');
    //         expect(response0.statusCode).toBe(401);
    //         expect(response0.body).not.toHaveProperty("data");
    //         expect(response0.body).toHaveProperty("status", 401);
    //         expect(response0.body).toHaveProperty("code");
    //         expect(response0.body).toHaveProperty("detail");
    //     });
    // });

    // describe("POST /notifications/advertisementCategory/delete ", () => {
    //     test("should respond with status 200 and the deleted object's id (data)", async () => {
    //         const response0 = await request(usedHost).post('/delete')
    //             .set(requestHeaders)
    //             .send({
    //                 id: testCategory0.id,
    //             });
    //         expect(response0.statusCode).toBe(200);
    //         expect(response0.body).toHaveProperty("data");
    //         expect(response0.body.data).toEqual({ id: testCategory0.id });

    //         const response1 = await request(usedHost).post('/delete')
    //             .set(requestHeaders)
    //             .send({
    //                 id: testCategory1.id,
    //             });
    //         expect(response1.statusCode).toBe(200);
    //         expect(response1.body).toHaveProperty("data");
    //         expect(response1.body.data).toEqual({ id: testCategory1.id });
    //     });

    //     test("should fail with status 400 and an error with a message if the entry is not well formatted", async () => {
    //         const response0 = await request(usedHost).post('/delete').set(requestHeaders);
    //         expect(response0.statusCode).toBe(400);
    //         expect(response0.body).not.toHaveProperty("data");
    //         expect(response0.body).toHaveProperty("status", 400);
    //         expect(response0.body).toHaveProperty("code");
    //         expect(response0.body).toHaveProperty("detail");

    //         const response1 = await request(usedHost).post('/delete')
    //             .set(requestHeaders)
    //             .send({
    //                 id: undefined
    //             });
    //         expect(response1.statusCode).toBe(400);
    //         expect(response1.body).not.toHaveProperty("data");
    //         expect(response1.body).toHaveProperty("status", 400);
    //         expect(response1.body).toHaveProperty("code");
    //         expect(response1.body).toHaveProperty("detail");

    //         const response2 = await request(usedHost).post('/delete')
    //             .set(requestHeaders)
    //             .send({
    //                 id: null,
    //             });
    //         expect(response2.statusCode).toBe(400);
    //         expect(response2.body).not.toHaveProperty("data");
    //         expect(response2.body).toHaveProperty("status", 400);
    //         expect(response2.body).toHaveProperty("code");
    //         expect(response2.body).toHaveProperty("detail");

    //         const response3 = await request(usedHost).post('/delete')
    //             .set(requestHeaders)
    //             .send({
    //                 id: { id: testCategory1.id },
    //             });
    //         expect(response3.statusCode).toBe(400);
    //         expect(response3.body).not.toHaveProperty("data");
    //         expect(response3.body).toHaveProperty("status", 400);
    //         expect(response3.body).toHaveProperty("code");
    //         expect(response3.body).toHaveProperty("detail");

    //         const response4 = await request(usedHost).post('/delete')
    //             .set(requestHeaders)
    //             .send({
    //                 id: "aBc",
    //             });
    //         expect(response4.statusCode).toBe(400);
    //         expect(response4.body).not.toHaveProperty("data");
    //         expect(response4.body).toHaveProperty("status", 400);
    //         expect(response4.body).toHaveProperty("code");
    //         expect(response4.body).toHaveProperty("detail");
    //     });

    //     test("should fail with status 404 and an error with a message if the id does not exist", async () => {
    //         const response0 = await request(usedHost).post('/delete')
    //             .set(requestHeaders)
    //             .send({
    //                 id: testCategory0.id,
    //             });
    //         expect(response0.statusCode).toBe(404);
    //         expect(response0.body).not.toHaveProperty("data");
    //         expect(response0.body).toHaveProperty("status", 404);
    //         expect(response0.body).toHaveProperty("code");
    //         expect(response0.body).toHaveProperty("detail");

    //         const response1 = await request(usedHost).post('/delete')
    //             .set(requestHeaders)
    //             .send({
    //                 id: testCategory1.id,
    //             });
    //         expect(response1.statusCode).toBe(404);
    //         expect(response1.body).not.toHaveProperty("data");
    //         expect(response1.body).toHaveProperty("status", 404);
    //         expect(response1.body).toHaveProperty("code");
    //         expect(response1.body).toHaveProperty("detail");
    //     });

    //     test("should fail with error 401 and a message if Authorization header is not set.", async () => {
    //         const response0 = await request(usedHost).post('/delete');
    //         expect(response0.statusCode).toBe(401);
    //         expect(response0.body).not.toHaveProperty("data");
    //         expect(response0.body).toHaveProperty("status", 401);
    //         expect(response0.body).toHaveProperty("code");
    //         expect(response0.body).toHaveProperty("detail");
    //     });
    // });
});