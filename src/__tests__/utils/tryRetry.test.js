const { tryRetry } = require('../../utils/tryRetry');

describe("The tryRetry general util ", () => {
    const testFuncs = {
        syncSuccessSimple: () => {
            return 'Sync ok';
        },
        asyncSuccessSimple: async () => {
            return 'Async ok';
        },
        successParams: async (a, b, c) => {
            return { a, b, c };
        },
        sum: async (a, b) => {
            return a + b;
        },
        failSyncSimple: () => {
            throw {
                message: 'Error!!!',
                time: new Date().getTime(),
            };
        },
        failAsyncSimple: async () => {
            throw new Error('Async Error.');
        },
    };
    const testParam0 = 'First Test P4r#m.';
    const testParam1 = { k1: '1', k2: 2, k3: [1, 2, '3'] };
    const testParam2 = ['a', 'b', 'abcd'];

    describe('In the asyncronous tryRetry function ', () => {
        test("should return a result if the function succeeds, even if it is asyncronous or syncronous and has no parameters. ", async () => {
            const response0 = await tryRetry(testFuncs.asyncSuccessSimple);
            expect(response0.result).toBe('Async ok');
            expect(response0.errors.length).toBe(0);
            const response1 = await tryRetry(testFuncs.syncSuccessSimple);
            expect(response1.result).toBe('Sync ok');
            expect(response1.errors.length).toBe(0);
        });

        test("should return a result if the function succeeds, even if it has parameters. ", async () => {
            const response0 = await tryRetry(testFuncs.successParams);
            expect(response0.result).toEqual({});
            expect(response0.errors.length).toBe(0);
            const response1 = await tryRetry(testFuncs.successParams, [testParam0, testParam1, testParam2]);
            expect(response1.result).toEqual({ a: testParam0, b: testParam1, c: testParam2 });
            expect(response1.errors.length).toBe(0);
            const response2 = await tryRetry(testFuncs.sum, [5, 6], 0, null, null);
            expect(response2.result).toBe(11);
            expect(response2.errors.length).toBe(0);
        });

        test("should return an array of errors with the length equals to the number of attempts. ", async () => {
            const response0 = await tryRetry(testFuncs.failAsyncSimple, null, 1);
            expect(response0.result).toBeNull();
            expect(response0.errors.length).toBe(1);
            const response1 = await tryRetry(testFuncs.failAsyncSimple, null, 3, null, 10);
            expect(response1.result).toBeNull();
            expect(response1.errors.length).toBe(3);
        });

        test("should wait for each attempt. ", async () => {
            const startTime0 = new Date().getTime();
            const response0 = await tryRetry(testFuncs.failSyncSimple, null, 2, null, 100);
            expect(response0.result).toBeNull();
            expect(response0.errors.length).toBe(2);
            expect(response0.errors[1].time - startTime0).toBeGreaterThanOrEqual(100);
            const startTime1 = new Date().getTime();
            const response1 = await tryRetry(testFuncs.failSyncSimple, null, 4, null, 200);
            expect(response1.result).toBeNull();
            expect(response1.errors.length).toBe(4);
            expect(response1.errors[1].time - startTime1).toBeGreaterThanOrEqual(200);
            expect(response1.errors[1].time - response1.errors[0].time).toBeGreaterThanOrEqual(200);
            expect(response1.errors[2].time - response1.errors[1].time).toBeGreaterThanOrEqual(200);
            expect(response1.errors[3].time - response1.errors[2].time).toBeGreaterThanOrEqual(200);
            expect(response1.errors[3].time - startTime1).toBeGreaterThanOrEqual(600);
        });
    });
});