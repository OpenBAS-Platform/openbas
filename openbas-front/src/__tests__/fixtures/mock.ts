import { vi } from 'vitest';

const mockStoreMethodWithReturn = async <T> (methodName: string, returnValue: T) => {
  const mockedMethod = vi.hoisted(() => vi.fn());
  const hoistedMethodName = vi.hoisted(() => vi.fn());

  vi.mock('../../actions/Schema',
    async (imported) => {
      const orig: typeof module = await imported();
      let cache: any = null;
      const mock = (state: any) => {
        if (!cache) {
          // @ts-expect-error ; TS can't figure out type of 'orig'
          const helper = orig.storeHelper(state);
            type StoreKey = keyof typeof helper;
            const key: StoreKey = hoistedMethodName();
            helper[key] = mockedMethod; // 200
            cache = helper;
        }
        return cache;
      };
      return {
        ...orig,
        storeHelper: mock,
      };
    },
  );

  mockedMethod.mockReturnValue(returnValue);
  hoistedMethodName.mockReturnValue(methodName);
};

export default mockStoreMethodWithReturn;
