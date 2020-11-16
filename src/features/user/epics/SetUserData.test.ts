import Pubnub from 'pubnub';
import { UserDataActionType } from '../UserDataActionType.enum';
import { setUserData, setUserDataEpic } from './SetUserData';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubUpdateUserSuccess() {
  const pubnub = {
    objects: {
      setUUIDMetadata: (
        _params: Pubnub.SetUUIDMetadataParameters<{}>,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.SetUUIDMetadataResponse<{}>
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

function fixturePubnubUpdateUserFail() {
  const pubnub = {
    objects: {
      setUUIDMetadata: (
        _params: Pubnub.SetUUIDMetadataParameters<{}>,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.SetUUIDMetadataResponse<{}>
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

describe('Updating user ', () => {
  it('should receive USER_DATA_SET after succesfully updating user', async () => {
    const expectedActions = [
      UserDataActionType.SET_USER_DATA_COMMAND,
      UserDataActionType.SETTING_USER_DATA,
      UserDataActionType.USER_DATA_SET,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubUpdateUserSuccess(),
      {},
      setUserDataEpic
    );

    await store.dispatch(
      setUserData({ uuid: 'test', data: { name: 'test' } }, {})
    );

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_SETTING_USER_DATA after unsuccesfully updating user', async () => {
    const expectedActions = [
      UserDataActionType.SET_USER_DATA_COMMAND,
      UserDataActionType.SETTING_USER_DATA,
      UserDataActionType.ERROR_SETTING_USER_DATA,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubUpdateUserFail(),
      {},
      setUserDataEpic
    );

    await store.dispatch(
      setUserData({ uuid: 'test', data: { name: 'test' } }, {})
    );

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
