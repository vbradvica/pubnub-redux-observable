import Pubnub from 'pubnub';
import { fetchAllUserData, fetchAllUserDataEpic } from './FetchAllUserData';
import { UserDataActionType } from '../UserDataActionType.enum';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubFetchUsersSuccess() {
  const pubnub = {
    objects: {
      getAllUUIDMetadata: (
        _params: Pubnub.GetAllMetadataParameters,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.GetAllUUIDMetadataResponse<{}>
        ) => void
      ) => {
        callback(
          {
            error: false,
            statusCode: 200,
            operation: 'test',
          },
          {
            data: [],
            status: 200,
          }
        );
      },
    },
  } as Pubnub;

  return pubnub;
}

function fixturePubnubFetchUsersFail() {
  const pubnub = {
    objects: {
      getAllUUIDMetadata: (
        _params: Pubnub.GetAllMetadataParameters,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.GetAllUUIDMetadataResponse<{}>
        ) => void
      ) => {
        callback(
          {
            error: true,
            statusCode: 200,
            operation: 'test',
          },
          {
            data: [],
            status: 200,
          }
        );
      },
    },
  } as Pubnub;

  return pubnub;
}

describe('Updating user ', () => {
  it('should receive ALL_USER_DATA_RETRIEVED after succesfully fetching users', async () => {
    const expectedActions = [
      UserDataActionType.FETCH_ALL_USER_DATA_COMMAND,
      UserDataActionType.FETCHING_ALL_USER_DATA,
      UserDataActionType.ALL_USER_DATA_RETRIEVED,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchUsersSuccess(),
      {},
      fetchAllUserDataEpic
    );

    await store.dispatch(fetchAllUserData({}, {}));

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_FETCHING_USER_DATA after unsuccesfully fetching users', async () => {
    const expectedActions = [
      UserDataActionType.FETCH_ALL_USER_DATA_COMMAND,
      UserDataActionType.FETCHING_ALL_USER_DATA,
      UserDataActionType.ERROR_FETCHING_ALL_USER_DATA,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchUsersFail(),
      {},
      fetchAllUserDataEpic
    );

    await store.dispatch(fetchAllUserData({}, {}));

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
