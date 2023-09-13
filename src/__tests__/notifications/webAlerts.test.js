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
        isAlertList: expect.any(Boolean),
        expiresAt: expect.any(String),
        createdAt: expect.any(String),
    }

    // Should expire in 60 seconds
    const alertList_AlertItem = {
        title: "Prueba: Ignorar",
        message: "Esta es una prueba automática, por favor ignórela.",
        siteUri: "https://www.cali.gov.co/",
        imageUri: "https://www.cali.gov.co/info/principal/media/bloque210342.png",
        push: false,
        sms: false,
        alertList: true,
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
            // NOTE: testing with alertList only since other alerts may bother users.
            const response0 = await request(usedHost).post('/alert').set(requestHeaders)
                .send({ ...alertList_AlertItem });
            expect(response0.statusCode).toBe(202);
            expect(response0.body).toHaveProperty("meta");
            expect(response0.body.meta).toHaveProperty("message");
            expect(response0.body.meta).toHaveProperty("successfulAlerts");
            expect(response0.body.meta.successfulAlerts).toEqual(expect.any(Object));
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toHaveProperty("id");
            alertList_AlertItem.id = response0.body.data.id;
            expect(response0.body.data).toEqual(returnItemFormat);
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).post('/alert').send(alertList_AlertItem);
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