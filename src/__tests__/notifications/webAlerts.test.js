const request = require('supertest');

const usedHost = `${global.notificationsMicroserviceDefaultHost}/web/v1/notifications/`;

describe("WEB Alert configuration API points: ", () => {
    jest.setTimeout(8000);

    const requestHeaders = {
        Authorization: "Bearer ",
    };

    const badAlertItem = {
        title: "test",
        message: "test message",
        siteUri: "http://sample.uri/of/site",
        imageUri: "http://sample.image.uri/1234",
        push: false,
        sms: false,
        alertList: false,
        expiresAt: "2100-08-15T23:16:41.000Z"
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
        // TODO: Before testing this feature, we must have a web user.
        // test("should respond with status 202, a message in meta, and the created object in data.", async () => {
        //     // NOTE: testing with alertList only since it is still in process (14-08-2023).
        //     const response0 = await request(usedHost).post('/alert').set(requestHeaders)
        //         .send({ ...badAlertItem, alertList: true });
        //     expect(response0.statusCode).toBe(202);
        //     expect(response0.body).toHaveProperty("meta");
        //     expect(response0.body.meta).toHaveProperty("message");
        //     expect(response0.body.meta).toHaveProperty("successfulAlerts");
        //     expect(response0.body.meta.successfulAlerts).toEqual(expect.any(Object));
        //     expect(response0.body).toHaveProperty("data");
        //     expect(response0.body.data).toHaveProperty("id");
        //     badAlertItem.id = response0.body.data.id;
        //     expect(response0.body.data).toEqual(expect.objectContaining({ ...badAlertItem }));
        // });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).post('/alert').send(badAlertItem);
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("GET /notifications/alert ", () => {
        // TODO: complete description.
        test("should respond with status 200 and an array of objects with: .", async () => {
            // TODO: Complete validation
            const response0 = await request(usedHost).get('/alert').set(requestHeaders)
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
            const response0 = await request(usedHost).get('/alert');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });
});