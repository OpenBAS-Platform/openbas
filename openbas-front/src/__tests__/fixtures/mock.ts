import {vi} from 'vitest';

export const mockStoreMethodWithReturn = async <T> (methodName: string, returnValue: T) => {
    const mockedMethod = vi.hoisted(() => vi.fn());
    const hoistedMethodName = vi.hoisted(() => vi.fn());

    vi.mock('../../actions/Schema',
        async (imported) => {
            const orig: typeof module = await imported();
            let _cache: any = null;
            const mock = (state: any) => {
                if(!_cache) {
                    // @ts-ignore
                    const helper = orig.storeHelper(state);

                    type StoreKey = keyof typeof helper;
                    let key: StoreKey = hoistedMethodName();
                    helper[key] = mockedMethod; // 200

                    _cache = helper;
                }
                return _cache;
            };
            return { ...orig, storeHelper: mock };
        }
    );

    mockedMethod.mockReturnValue(returnValue);
    hoistedMethodName.mockReturnValue(methodName);
}