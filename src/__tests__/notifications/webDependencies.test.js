const request = require('supertest');
const path = require('path');

const usedHost = `${global.notificationsMicroserviceDefaultHost}/web/v1/notifications/`;

const sleepNow = async (delay) => new Promise((resolve) => setTimeout(resolve, delay));

describe("WEB Dependencies configuration API points: ", () => {
    jest.setTimeout(10000);

    const requestHeaders = {
        Authorization: "Bearer ",
    };

    const filesPath = path.resolve(path.join('__tests__', 'notifications', '__testFiles__'));

    const creationXlsx = path.join(filesPath, 'Plantilla Dependencias.xlsx');
    const creationXls = path.join(filesPath, 'Plantilla Dependencias OLD.xls');
    const updateXlsx = path.join(filesPath, 'Modifica Dependencias.xlsx');
    const validXlsx0 = path.join(filesPath, 'validTest0.xlsx');
    const validXlsx1 = path.join(filesPath, 'validTest1.xlsx');
    const badXlsx0 = path.join(filesPath, 'Modifica Dep Mal 0.xlsx');
    const badXlsx1 = path.join(filesPath, 'Modifica Dep Mal 1.xlsx');
    const badXlsx2 = path.join(filesPath, 'Modifica Dep Mal 2.xlsx');
    const badXlsx3 = path.join(filesPath, 'Modifica Dep Mal 3.xlsx');
    const powerpoint = path.join(filesPath, 'PowerPoint.pptx');
    const word = path.join(filesPath, 'Word.docx');

    const xlsxContent = [{
        id: 2,
        name: 'Tercer ejemplo de Dependencia de prueba',
    }];
    const xlsContent = [{
        id: 0,
        name: 'Primer ejemplo de Dependencia de prueba',
    }, {
        id: 1,
        name: 'Segunda dependencia de prueba',
    }];
    const updateContent = [{
        id: 0,
        name: 'Primero',
    }, {
        id: 1,
        name: 'Segundo',
    }, {
        id: 2,
        name: 'Tercero',
    }];

    beforeAll(async () => {
        const firebaseAuth = await request("https://identitytoolkit.googleapis.com/v1")
            .post('/accounts:signInWithPassword')
            .query({ key: global.firebaseKey })
            .send(global.firebaseTestWebUserLogin);
        requestHeaders.Authorization += firebaseAuth.body.idToken;
        // console.log(requestHeaders);
    });

    describe("POST /notifications/dependencies/excel ", () => {
        test("should respond with status 201 and the created objects in data.", async () => {
            const response0 = await request(usedHost).post('/dependencies/excel').set(requestHeaders)
                .attach('file', creationXlsx);
            expect(response0.statusCode).toBe(201);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBe(1);
            expect(response0.body.data[0]).toEqual(expect.objectContaining(xlsxContent[0]));

            const response1 = await request(usedHost).post('/dependencies/excel').set(requestHeaders)
                .attach('file', creationXls);
            expect(response1.statusCode).toBe(201);
            expect(response1.body).toHaveProperty("data");
            expect(response1.body.data).toEqual(expect.any(Array));
            expect(response1.body.data.length).toBe(2);
            expect(response1.body.data[0]).toEqual(expect.objectContaining(xlsContent[0]));
            expect(response1.body.data[1]).toEqual(expect.objectContaining(xlsContent[1]));
        });

        test("should have deleted objects that are not present in the last create", async () => {
            const response0 = await request(usedHost).get('/dependencies').set(requestHeaders)
                .query({ page: { number: 1, size: 10 } });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBe(2);
            const receiveExpect = xlsContent.map(item => expect.objectContaining(item));
            expect(response0.body.data).toEqual(expect.arrayContaining(receiveExpect));
        });

        test("should respond with status 201 and the updated objects in data if objects already exist.", async () => {
            const response0 = await request(usedHost).post('/dependencies/excel').set(requestHeaders)
                .attach('file', updateXlsx);
            expect(response0.statusCode).toBe(201);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBe(3);
            const updateExpect = updateContent.map(item => expect.objectContaining(item));
            expect(response0.body.data).toEqual(expect.arrayContaining(updateExpect));
        });

        test("should have reactivated previously deleted objects that are present in the last create", async () => {
            const response0 = await request(usedHost).get('/dependencies').set(requestHeaders)
                .query({ page: { number: 1, size: 10 } });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBe(3);
            const updateExpect = updateContent.map(item => expect.objectContaining(item));
            expect(response0.body.data).toEqual(expect.arrayContaining(updateExpect));
        });

        test("should fail with error 400 and a message if 'file' is not passed.", async () => {
            const response0 = await request(usedHost).post('/dependencies/excel').set(requestHeaders);
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });

        test("should fail with error 400 and a message if 'file' is not excel (xls or xlsx).", async () => {
            const response0 = await request(usedHost).post('/dependencies/excel').set(requestHeaders)
                .attach('file', word);
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/dependencies/excel').set(requestHeaders)
                .attach('file', powerpoint);
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");
        });

        test("should fail with error 500 and a message if a different field (other than 'file') is passed.", async () => {
            await sleepNow(2000);   // Should sleep or fails with <read ECONNRESET>
            const response1 = await request(usedHost).post('/dependencies/excel').set(requestHeaders)
                .attach('notFile', validXlsx0);
            expect(response1.statusCode).toBe(500);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 500);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");
        });

        test("should fail with error 422 and a message if the excel file has not the expected format.", async () => {
            const response0 = await request(usedHost).post('/dependencies/excel').set(requestHeaders)
                .attach('file', badXlsx0);
            expect(response0.statusCode).toBe(422);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 422);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).post('/dependencies/excel').set(requestHeaders)
                .attach('file', badXlsx1);
            expect(response1.statusCode).toBe(422);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 422);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).post('/dependencies/excel').set(requestHeaders)
                .attach('file', badXlsx2);
            expect(response2.statusCode).toBe(422);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 422);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).post('/dependencies/excel').set(requestHeaders)
                .attach('file', badXlsx3);
            expect(response3.statusCode).toBe(422);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 422);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).post('/dependencies/excel');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("GET /notifications/dependencies/excel ", () => {
        test("should respond with status 200 and an array of objects with: .", async () => {
            const response0 = await request(usedHost).get('/dependencies/excel').set(requestHeaders);
            expect(response0.statusCode).toBe(200);
            expect(response0.headers).toHaveProperty("content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            expect(response0.headers).toHaveProperty("content-disposition", "attachment; filename=Dependencias.xlsx");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).get('/dependencies/excel');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("GET /notifications/dependencies/template ", () => {
        test("should respond with status 200 and an array of objects with: .", async () => {
            const response0 = await request(usedHost).get('/dependencies/template').set(requestHeaders);
            expect(response0.statusCode).toBe(200);
            expect(response0.headers).toHaveProperty("content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).get('/dependencies/template');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });

    describe("GET /notifications/dependencies ", () => {
        test("should respond with status 200 and an array of objects that match the last update.", async () => {
            const response0 = await request(usedHost).get('/dependencies').set(requestHeaders)
                .query({ page: { number: 1, size: 10 } });
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toHaveProperty("data");
            expect(response0.body.data).toEqual(expect.any(Array));
            expect(response0.body.data.length).toBe(3);
            const updateExpect = updateContent.map(item => expect.objectContaining(item));
            expect(response0.body.data).toEqual(expect.arrayContaining(updateExpect));
        });

        test("should fail with status 400 and an error with a message if no pagination is provided", async () => {
            const response0 = await request(usedHost).get('/dependencies').set(requestHeaders);
            expect(response0.statusCode).toBe(400);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 400);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");

            const response1 = await request(usedHost).get('/dependencies')
                .set(requestHeaders)
                .query({ page: {} });
            expect(response1.statusCode).toBe(400);
            expect(response1.body).not.toHaveProperty("data");
            expect(response1.body).toHaveProperty("status", 400);
            expect(response1.body).toHaveProperty("code");
            expect(response1.body).toHaveProperty("detail");

            const response2 = await request(usedHost).get('/dependencies')
                .set(requestHeaders)
                .query({ page: { number: 1 } });
            expect(response2.statusCode).toBe(400);
            expect(response2.body).not.toHaveProperty("data");
            expect(response2.body).toHaveProperty("status", 400);
            expect(response2.body).toHaveProperty("code");
            expect(response2.body).toHaveProperty("detail");

            const response3 = await request(usedHost).get('/dependencies')
                .set(requestHeaders)
                .query({ page: { size: 1 } });
            expect(response3.statusCode).toBe(400);
            expect(response3.body).not.toHaveProperty("data");
            expect(response3.body).toHaveProperty("status", 400);
            expect(response3.body).toHaveProperty("code");
            expect(response3.body).toHaveProperty("detail");

            const response4 = await request(usedHost).get('/dependencies')
                .set(requestHeaders)
                .query({ page: { number: 0, size: 1 } });
            expect(response4.statusCode).toBe(400);
            expect(response4.body).not.toHaveProperty("data");
            expect(response4.body).toHaveProperty("status", 400);
            expect(response4.body).toHaveProperty("code");
            expect(response4.body).toHaveProperty("detail");

            const response5 = await request(usedHost).get('/dependencies')
                .set(requestHeaders)
                .query({ page: { number: 1, size: 0 } });
            expect(response5.statusCode).toBe(400);
            expect(response5.body).not.toHaveProperty("data");
            expect(response5.body).toHaveProperty("status", 400);
            expect(response5.body).toHaveProperty("code");
            expect(response5.body).toHaveProperty("detail");

            const response6 = await request(usedHost).get('/dependencies')
                .set(requestHeaders)
                .query({ page: { number: "A", size: 2 } });
            expect(response6.statusCode).toBe(400);
            expect(response6.body).not.toHaveProperty("data");
            expect(response6.body).toHaveProperty("status", 400);
            expect(response6.body).toHaveProperty("code");
            expect(response6.body).toHaveProperty("detail");

            const response7 = await request(usedHost).get('/dependencies')
                .set(requestHeaders)
                .query({ page: { number: 2, size: "B" } });
            expect(response7.statusCode).toBe(400);
            expect(response7.body).not.toHaveProperty("data");
            expect(response7.body).toHaveProperty("status", 400);
            expect(response7.body).toHaveProperty("code");
            expect(response7.body).toHaveProperty("detail");
        });

        test("should fail with error 401 and a message if Authorization header is not set.", async () => {
            const response0 = await request(usedHost).get('/dependencies');
            expect(response0.statusCode).toBe(401);
            expect(response0.body).not.toHaveProperty("data");
            expect(response0.body).toHaveProperty("status", 401);
            expect(response0.body).toHaveProperty("code");
            expect(response0.body).toHaveProperty("detail");
        });
    });
});