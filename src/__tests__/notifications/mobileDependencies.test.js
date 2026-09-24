const request = require('supertest');

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/attention_lines/dependencies`;

describe("Dependencies consumption API points: ", () => {
    jest.setTimeout(8000);

    const requestHeaders = {
        Authorization: "Bearer ",
    };

    const dependenciesItem = {
        id: expect.any(Number),
        name: expect.any(String),
    };

    beforeAll(async () => {
        const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
            .post('/accounts:signInWithPassword')
            .query({ key: global.firebaseKey })
            .send(global.firebaseTestMobileUserLogin);
        requestHeaders.Authorization += firebaseAuth.body.idToken;
        // console.log(requestHeaders);
    });

    describe("GET /notifications/attention_lines/dependencies ", () => {
        test("should respond with status 200 and an array of objects with: id and name.", async () => {
            const response0 = await request(usedHost).get('/').set(requestHeaders);
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toEqual(expect.any(Array));
            expect(response0.body.length).toBeGreaterThanOrEqual(0);
            response0.body.forEach(item => {
                expect(item).toEqual(dependenciesItem);
            });
        });

        test("should respond with status 200 and a shorter array of objects with: id and name if request is paginated.", async () => {
            const response0 = await request(usedHost).get('/').set(requestHeaders)
                .query({ page: { number: 1, size: 2 } });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toEqual(expect.any(Array));
            expect(response0.body.length).toBeGreaterThanOrEqual(1);
            expect(response0.body.length).toBeLessThanOrEqual(2);
            response0.body.forEach(item => {
                expect(item).toEqual(dependenciesItem);
            });
        });

        test("should respond with error 400 if pagination is wrongly provided", async () => {
            const response1 = await request(usedHost).get('/')
                .set(requestHeaders)
                .query({ page: null });
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

        // Removed: GET /attention_lines/dependencies es un endpoint PÚBLICO (mobile.js:43-47, sin auth).
        // El test de 401 sin Authorization estaba obsoleto: responde 200 sin token.
    });
});