const request = require('supertest');

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/mobile/v1/notifications/`;

describe("MOBILE Alert configuration API points: ", () => {
    jest.setTimeout(8000);

    const requestHeaders = {
        Authorization: "Bearer ",
    };

    const badTokenItem = {
        deviceToken: "14095475-7695-4fd5-b334-4e521d0c3262",
    };

    beforeAll(async () => {
        const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
            .post('/accounts:signInWithPassword')
            .query({ key: global.firebaseKey })
            .send(global.firebaseTestMobileUserLogin);
        requestHeaders.Authorization += firebaseAuth.body.idToken;
        // console.log(requestHeaders);
    });

    describe("POST /notifications/register ", () => {
        // TODO: Before testing this feature, we must have a real token from a mobile user.
        // test("should respond with status 200 and an echo in data.", async () => {
        //     const response0 = await request(usedHost).post('/register').set(requestHeaders)
        //         .send(badTokenItem);
        //     expect(response0.statusCode).toBe(200);
        //     expect(response0.body).toHaveProperty("data");
        //     expect(response0.body.data).toEqual(badTokenItem);
        // });

        test("should respond with status 400 and an error object if device token is not present or is not string.", async () => {
            const response0 = await request(usedHost).post('/register').set(requestHeaders)
                .send();
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/register').set(requestHeaders)
                .send({ deviceToken: 12345 });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/register').set(requestHeaders)
                .send({ deviceToken: [12345] });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");
        });

        test("should respond with status 422 and an error object if device token is erroneous.", async () => {
            const response0 = await request(usedHost).post('/register').set(requestHeaders)
                .send({ deviceToken: "12345" });
            expect(response0.statusCode).toBe(422);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 422);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).post('/register').send(badTokenItem);
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("GET /notifications/ ", () => {
        // TODO: complete description.
        test("should respond with status 200 and an array of objects with: .", async () => {
            // TODO: Complete validation
            const response0 = await request(usedHost).get('/').set(requestHeaders)
                .query({ page: { number: 1, size: 2 } });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBeGreaterThanOrEqual(0);
            // response0.body.forEach(item => {
            //     expect(item).toMatchSnapshot(alertsItem);
            // });
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
});