const request = require('supertest');

const localTestHost = 'http://localhost:3000/web/v1/notifications/advertising';
const onlineTestHost = 'https://k7gmmdc9dj.us-east-1.awsapprunner.com/web/v1/notifications/advertising';
const usedHost = localTestHost;

describe("Advertisement management API points: ", () => {
    jest.setTimeout(8000);

    const testAdvertisement0 = {
        imageUri: 'gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png',
        siteUri: 'http://test.site.url',
    };

    const testAdvertisement1 = {
        imageUri: 'gs://documentainotery.appspot.com/dance%20dance%20danseur.jpg',
        siteUri: 'https://test.site.url/second',
        categoryId: 2,
    };

    const editAdvertisement0 = {
        siteUri: 'http://edited.site.url',
        categoryId: 2,
        active: false,
    };

    const editAdvertisement1 = {
        imageUri: 'gs://documentainotery.appspot.com/myUploads',
        categoryId: null,
    };

    describe("POST /notifications/advertising/ ", () => {
        test("should respond with status 201 and the new object (data) after creating a new advertisement", async () => {
            const response0 = await request(usedHost).post('/').send(testAdvertisement0);
            expect(response0.statusCode).toBe(201);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toHaveProperty("id");
            expect(response0.body.data).toHaveProperty("active");
            expect(response0.body.data.active).toBe(true);
            testAdvertisement0.id = response0.body.data.id;
            const response1 = await request(usedHost).post('/').send(testAdvertisement1);
            expect(response1.statusCode).toBe(201);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toHaveProperty("id");
            expect(response1.body.data).toHaveProperty("active");
            expect(response1.body.data.active).toBe(true);
            testAdvertisement1.id = response1.body.data.id;
        });

        test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
            const response0 = await request(usedHost).post('/').send({
                ...testAdvertisement0,
                imageUri: 'not an URI string'
            });
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/').send({
                ...testAdvertisement0,
                siteUri: 'not.an.URI.str'
            });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/').send({
                ...testAdvertisement0,
                imageUri: 0
            });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).post('/').send({
                ...testAdvertisement0,
                siteUri: { url: 'http://test.site.url' }
            });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedHost).post('/').send({
                ...testAdvertisement1,
                categoryId: "not a number"
            });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedHost).post('/').send({
                ...testAdvertisement1,
                categoryId: 1.5
            });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedHost).post('/').send({
                ...testAdvertisement1,
                categoryId: { number: 127 }
            });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");
        });

        test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
            const response0 = await request(usedHost).post('/').send({
                ...testAdvertisement1,
                categoryId: -5,
            });
            expect(response0.statusCode).toBe(500);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 500);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("GET /notifications/advertising/ ", () => {
        test("should respond with status 200 and a list of objects containing the two created objects.", async () => {
            const response0 = await request(usedHost).get('/').query({ page: { number: 1, size: 2 } });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBe(2);
            expect(response0.body.data[0]).toEqual(expect.objectContaining(testAdvertisement1));
            expect(response0.body.data[1]).toEqual(expect.objectContaining(testAdvertisement0));
        });

        test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
            const response0 = await request(usedHost).get('/');
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).get('/').query({
                page: {}
            });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).get('/').query({
                page: { number: 1 }
            });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).get('/').query({
                page: { size: 1 }
            });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedHost).get('/').query({
                page: { number: 0, size: 1 }
            });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedHost).get('/').query({
                page: { number: 1, size: 0 }
            });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedHost).get('/').query({
                page: { number: "A", size: 2 }
            });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");

            const response7 = await request(usedHost).get('/').query({
                page: { number: 2, size: "B" }
            });
            expect(response7.statusCode).toBe(400);
            expect(response7.body).not.toHaveProperty("data");
            expect(response7.body).toHaveProperty("status", 400);
            expect(response7.body).toHaveProperty("code");
            expect(response7.body).toHaveProperty("detail");
        });
    });

    describe("POST /notifications/advertising/edit ", () => {
        test("should respond with status 200 and the edited object (data)", async () => {
            const response0 = await request(usedHost).post('/edit').send({
                ...testAdvertisement0, ...editAdvertisement0
            });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.objectContaining({
                ...testAdvertisement0, ...editAdvertisement0
            }));
            const response1 = await request(usedHost).post('/edit').send({
                ...testAdvertisement1, ...editAdvertisement1
            });
            expect(response1.statusCode).toBe(200);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toEqual(expect.objectContaining({
                ...testAdvertisement1, ...editAdvertisement1
            }));
        });

        test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
            const response0 = await request(usedHost).post('/edit').send({
                ...testAdvertisement0,
                id: undefined
            });
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/edit').send({
                ...testAdvertisement0,
                siteUri: 'not.an.URI.str'
            });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/edit').send({
                ...testAdvertisement0,
                imageUri: 0
            });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).post('/edit').send({
                ...testAdvertisement0,
                siteUri: { url: 'http://test.site.url' }
            });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedHost).post('/edit').send({
                ...testAdvertisement1,
                categoryId: "not a number"
            });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedHost).post('/edit').send({
                ...testAdvertisement1,
                categoryId: 1.5
            });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedHost).post('/edit').send({
                id: testAdvertisement1.id
            });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");
        });

        test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
            const response0 = await request(usedHost).post('/edit').send({
                ...testAdvertisement1,
                categoryId: -5,
            });
            expect(response0.statusCode).toBe(500);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 500);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });

        test("should fail with status 404 and an error with a message if the id does not exist", async () => {
            const response0 = await request(usedHost).post('/edit').send({
                ...testAdvertisement1,
                id: testAdvertisement1.id + 98976545120
            });
            expect(response0.statusCode).toBe(404);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 404);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });
});