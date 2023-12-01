import { KontentBundle } from "../../types/kontentBundle";

export const mockBundle: KontentBundle<{}> = {
  authData: {
    access_token:
      "67820d68140a115508715234d25d6a49c3fe1577d451f4157530fa6736fe422c",
    adminOf: [
      {
        subdomain: "example-space",
        name: "Example Space",
      },
    ],
  },
  inputData: {},
  inputDataRaw: {},
  meta: {
    isBulkRead: false,
    page: 0,
    isLoadingSample: false,
    isFillingDynamicDropdown: false,
    limit: 10,
    isPopulatingDedupe: false,
    isTestingAuth: false,
  },
};

type AnyReadonlyRecord = Readonly<Record<string, unknown>>;

export const addInputData = <
  InitialInputData extends AnyReadonlyRecord,
  AddedInputData extends AnyReadonlyRecord,
>(
  bundle: KontentBundle<InitialInputData>,
  toAdd: AddedInputData,
): KontentBundle<InitialInputData & AddedInputData> => ({
  ...bundle,
  inputData: {
    ...bundle.inputData,
    ...toAdd,
  },
});
