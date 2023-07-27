const request = require('supertest');

const localTestHost = 'http://localhost:3000/v1/notifications/advertising';
const onlineTestHost = 'https://k7gmmdc9dj.us-east-1.awsapprunner.com/v1/notifications/advertising';
const usedHost = localTestHost;

describe("Advertisement management API points: ", () => {
    jest.setTimeout(8000);

    const testAdvertisement0 = {
        imageUri: 'gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png',
        siteUri: 'http://test.site.url',
    };

    const testAdvertisement1 = {
        imageUri: 'gs://documentainotery.appspot.com/dance dance danseur.jpg',
        siteUri: 'https://test.site.url/second',
        categoryId: 2,
    };

    describe("POST /v1/notifications/advertising/ ", () => {
        test("should respond with status 201, a message and the new object after creating a new advertisement", async () => {
            const response0 = await request(usedHost).post('/').send(testAdvertisement0);
            expect(response0.statusCode).toBe(201);
            expect(response0.body).toHaveProperty("msg");
            expect(response0.body).toHaveProperty("newAdvertisement");
            expect(response0.body.newAdvertisement).toHaveProperty("id");
            expect(response0.body.newAdvertisement).toHaveProperty("active");
            expect(response0.body.newAdvertisement.active).toBe(true);
            testAdvertisement0.id = response0.body.newAdvertisement.id;
            const response1 = await request(usedHost).post('/').send(testAdvertisement1);
            expect(response1.statusCode).toBe(201);
            expect(response1.body).toHaveProperty("msg");
            expect(response1.body).toHaveProperty("newAdvertisement");
            expect(response1.body.newAdvertisement).toHaveProperty("id");
            expect(response1.body.newAdvertisement).toHaveProperty("active");
            expect(response1.body.newAdvertisement.active).toBe(true);
            testAdvertisement1.id = response1.body.newAdvertisement.id;
        });

        test("should fail with status 400 and an error with a message if the entry is not well formated", async () => {
            const response0 = await request(usedHost).post('/').send({
                ...testAdvertisement0,
                imageUri: 'not an URI string'
            });
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("newAdvertisement");
            expect(response0.body).toHaveProperty("error");
            expect(response0.body.error).toHaveProperty("message");

            const response1 = await request(usedHost).post('/').send({
                ...testAdvertisement0,
                siteUri: 'not.an.URI.str'
            });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("newAdvertisement");
            expect(response1.body).toHaveProperty("error");
            expect(response1.body.error).toHaveProperty("message");

            const response2 = await request(usedHost).post('/').send({
                ...testAdvertisement0,
                imageUri: 0
            });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("newAdvertisement");
            expect(response2.body).toHaveProperty("error");
            expect(response2.body.error).toHaveProperty("message");

            const response3 = await request(usedHost).post('/').send({
                ...testAdvertisement0,
                siteUri: { url: 'http://test.site.url' }
            });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("newAdvertisement");
            expect(response3.body).toHaveProperty("error");
            expect(response3.body.error).toHaveProperty("message");

            const response4 = await request(usedHost).post('/').send({
                ...testAdvertisement1,
                categoryId: "not a number"
            });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("newAdvertisement");
            expect(response4.body).toHaveProperty("error");
            expect(response4.body.error).toHaveProperty("message");

            const response5 = await request(usedHost).post('/').send({
                ...testAdvertisement1,
                categoryId: 1.5
            });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("newAdvertisement");
            expect(response5.body).toHaveProperty("error");
            expect(response5.body.error).toHaveProperty("message");

            const response6 = await request(usedHost).post('/').send({
                ...testAdvertisement1,
                categoryId: { number: 127 }
            });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("newAdvertisement");
            expect(response6.body).toHaveProperty("error");
            expect(response6.body.error).toHaveProperty("message");
        });

        test("should fail with status 500 and an error with a message if the data cannot be saved", async () => {
            const response0 = await request(usedHost).post('/').send({
                ...testAdvertisement1,
                categoryId: -5,
            });
            expect(response0.statusCode).toBe(500);
            expect(response0.body).not.toHaveProperty("newAdvertisement");
            expect(response0.body).toHaveProperty("error");
            expect(response0.body.error).toHaveProperty("message");
        });
    });
});