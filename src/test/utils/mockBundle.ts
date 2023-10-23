import { KontentBundle } from '../../types/kontentBundle';

export const mockBundle: KontentBundle<{}> = {
  authData: {
    access_token: '67820d68140a115508715234d25d6a49c3fe1577d451f4157530fa6736fe422c',
    refresh_token: 'refresh_token',
    subdomain: 'trial',
    space: "Trial",
    membershipId: '',
    memberships: [
        {
            "id": "fc994dd891a5147093418cb3d89f3d23",
            "link": "https://trial.cobot.me/api/memberships/fc994dd891a5147093418cb3d89f3d23",
            "name": "username",
            "space_link": "https://www.cobot.me/api/spaces/trial",
            "space_subdomain": "trial",
            "space_name": "Trial"
        }
    ],
    subdomains: [
        {
            "space_subdomain": "trial",
            "space_link": "https://www.cobot.me/api/spaces/trial",
            "name": "username",
            "space_name": "Trial"
        }
    ]
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

export const addInputData = <InitialInputData extends AnyReadonlyRecord, AddedInputData extends AnyReadonlyRecord>(
  bundle: KontentBundle<InitialInputData>,
  toAdd: AddedInputData,
): KontentBundle<InitialInputData & AddedInputData> => ({
  ...bundle,
  inputData: {
    ...bundle.inputData,
    ...toAdd,
  },
});
