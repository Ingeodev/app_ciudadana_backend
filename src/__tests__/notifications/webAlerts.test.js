const request = require('supertest');

const usedHost = `${global.notificationsMicroserviceDefaultHost}/api/web/v1/notifications/`;

describe("WEB Alert configuration API points: ", () => {
    jest.setTimeout(8000);

    const requestHeaders = {
        Authorization: "Bearer ",
    };

    const returnItemFormat = {
        id: expect.any(Number),
        title: expect.any(String),
        message: expect.any(String),
        siteUri: expect.any(String),
        imageUri: expect.any(String),
        sentBy: expect.any(Number),
        isPUSH: expect.any(Boolean),
        isSMS: expect.any(Boolean),
        expiresAt: expect.any(String),
        createdAt: expect.any(String),
    };

    // Should expire in 60 seconds
    const push_AlertItem = {
        title: "Prueba: Ignorar",
        message: "Esta es una prueba automática, por favor ignórela.",
        siteUri: "https://www.cali.gov.co/",
        imageUri: "https://www.cali.gov.co/info/principal/media/bloque210342.png",
        push: true,
        sms: false,
        expiresAt: new Date(Date.now() + (1000 * 60)).toUTCString(),
    };

    beforeAll(async () => {
        const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
            .post('/accounts:signInWithPassword')
            .query({ key: global.firebaseKey })
            .send(global.firebaseTestWebUserLogin);
        requestHeaders.Authorization += firebaseAuth.body.idToken;
        // console.log(requestHeaders);
    });

    describe("POST /notifications/alert ", () => {
        test("should respond with status 202, a message in meta, and the created object in data.", async () => {
            // NOTE: testing with push only since SMS will cost.
            const response0 = await request(usedHost).post('/alert').set(requestHeaders)
                .send({ ...push_AlertItem });
            expect(response0.statusCode).toBe(202);
            expect(response0.body).toHaveProperty("meta");
            expect(response0.body.meta).toHaveProperty("message");
            expect(response0.body.meta).toHaveProperty("acceptedAlerts");
            expect(response0.body.meta.acceptedAlerts).toEqual(expect.any(Object));
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toHaveProperty("id");
            push_AlertItem.id = response0.body.data.id;
            expect(response0.body.data).toEqual(returnItemFormat);
        });

        test("should fail with error 422 and a message if no alert is defined.", async () => {
            const response0 = await request(usedHost).post('/alert').set(requestHeaders)
                .send({ ...push_AlertItem, push: false });
            expect(response0.statusCode).toBe(422);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 422);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });

        test("should fail with error 400 and a message if request data is not complete and well-formatted.", async () => {
            const response0 = await request(usedHost).post('/alert').set(requestHeaders)
                .send({
                    ...push_AlertItem,
                    push: undefined
                });
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/alert').set(requestHeaders)
                .send({
                    ...push_AlertItem,
                    sms: undefined
                });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/alert').set(requestHeaders)
                .send({
                    ...push_AlertItem,
                    imageUri: "not an uri"
                });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).post('/alert').set(requestHeaders)
                .send({
                    ...push_AlertItem,
                    siteUri: null
                });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedHost).post('/alert').set(requestHeaders)
                .send({
                    ...push_AlertItem,
                    message: ["no message"]
                });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedHost).post('/alert').set(requestHeaders)
                .send({
                    ...push_AlertItem,
                    title: 12356
                });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedHost).post('/alert').set(requestHeaders)
                .send({
                    ...push_AlertItem,
                    expiresAt: "Not a date"
                });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).post('/alert').send(push_AlertItem);
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("GET /notifications/alert ", () => {
        test("should respond with status 200 and an array of alert objects.", async () => {
            const response0 = await request(usedHost).get('/alert').set(requestHeaders)
                .query({ page: { number: 1, size: 10 } });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBeGreaterThanOrEqual(1);
            response0.body.data.forEach(item => {
                expect(item).toEqual(returnItemFormat);
            });
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).get('/alert');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });
});