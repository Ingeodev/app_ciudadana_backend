const request = require('supertest');

const localTestHost = 'http://localhost:3000/mobile/v1/notifications/publicity';
const onlineTestHost = 'https://k7gmmdc9dj.us-east-1.awsapprunner.com/mobile/v1/notifications/publicity';
const usedHost = localTestHost;

describe("Publicity consumption API points: ", () => {
    jest.setTimeout(8000);

    const bannersItem = {
        image: expect.any(String),
        url: expect.any(String),
        category: expect.any(String),
    };

    describe("GET /notifications/publicity/banners ", () => {
        test("should respond with status 200 and an array of objects with: image, url, and category.", async () => {
            const response0 = await request(usedHost).get('/banners');
            expect(response0.statusCode).toBe(200);
            expect(response0.body).toEqual(expect.any(Array));
            expect(response0.body.length).toBeGreaterThanOrEqual(0);
            response0.body.forEach(item => {
                expect(item).toMatchSnapshot(bannersItem);
            });
        });
    });
});