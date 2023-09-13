const request = require('supertest');

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/publicity`;

describe("Publicity consumption API points: ", () => {
    jest.setTimeout(8000);

    const requestHeaders = {
        Authorization: "Bearer ",
    };

    const bannersItem = {
        image: expect.any(String),
        url: expect.any(String),
        category: expect.any(String),
    };

    beforeAll(async () => {
        const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
            .post('/accounts:signInWithPassword')
            .query({ key: global.firebaseKey })
            .send(global.firebaseTestMobileUserLogin);
        requestHeaders.Authorization += firebaseAuth.body.idToken;
        // console.log(requestHeaders);
    });

    describe("GET /notifications/publicity/banners ", () => {
        test("should respond with status 200 and an array of objects with: image, url, and category.", async () => {
            const response0 = await request(usedHost).get('/banners').set(requestHeaders);
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toEqual(expect.any(Array));
            expect(response0.body.length).toBeGreaterThanOrEqual(0);
            response0.body.forEach(item => {
                expect(item).toEqual(bannersItem);
            });
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).get('/banners');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });
});