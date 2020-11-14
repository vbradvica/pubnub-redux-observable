import Pubnub from 'pubnub';
import { fetchUserData, fetchUserDataEpic } from './FetchUserData';
import { createMockStore } from 'foundations/Test-utils';

import { UserDataActionType } from 'pubnub-redux';

function fixturePubnubFetchUserSuccess() {
  const pubnub = {
    objects: {
      getUUIDMetadata: (
        _params: Pubnub.GetUUIDMetadataParameters,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.GetUUIDMetadataResponse<{}>
        ) => void
      ) => {
        callback(
          {
            error: false,
            statusCode: 200,
            operation: 'test',
          },
          {
            data: {
              id: 'test',
              name: 'test',
              eTag: 'test',
              updated: 'test',
            },
            status: 200,
          }
        );
      },
    },
  } as Pubnub;

  return pubnub;
}

function fixturePubnubFetchUserFail() {
  const pubnub = {
    objects: {
      getUUIDMetadata: (
        _params: Pubnub.GetUUIDMetadataParameters,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.GetUUIDMetadataResponse<{}>
        ) => void
      ) => {
        callback(
          {
            error: true,
            statusCode: 200,
            operation: 'test',
          },
          {
            data: {
              id: 'test',
              name: 'test',
              eTag: 'test',
              updated: 'test',
            },
            status: 200,
          }
        );
      },
    },
  } as Pubnub;

  return pubnub;
}

describe('Fetching user by ID ', () => {
  it('should receive USER_DATA_RETRIEVED after succesfully fetching user by id', async () => {
    const expectedActions = [
      UserDataActionType.FETCH_USER_DATA_COMMAND,
      UserDataActionType.FETCHING_USER_DATA,
      UserDataActionType.USER_DATA_RETRIEVED,
    ];

    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchUserSuccess(),
      {},
      fetchUserDataEpic
    );

    await store.dispatch(fetchUserData({ uuid: 'test' }, {}));

    receivedActions = store.getActions().map((action: any) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_FETCHING_USER_DATA after unsuccesfully fetching user by id', async () => {
    const expectedActions = [
      UserDataActionType.FETCH_USER_DATA_COMMAND,
      UserDataActionType.FETCHING_USER_DATA,
      UserDataActionType.ERROR_FETCHING_USER_DATA,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchUserFail(),
      {},
      fetchUserDataEpic
    );

    await store.dispatch(fetchUserData({ uuid: 'test' }, {}));

    receivedActions = store.getActions().map((action: any) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
