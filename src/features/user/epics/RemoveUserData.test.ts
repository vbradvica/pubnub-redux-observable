import Pubnub from 'pubnub';
import { UserDataActionType } from '../UserDataActionType.enum';
import { removeUserData, removeUserDataEpic } from './RemoveUserData';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubDeleteUserSuccess() {
  const pubnub = {
    objects: {
      removeUUIDMetadata: (
        _params: Pubnub.RemoveUUIDMetadataParameters,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.RemoveUUIDMetadataResponse
        ) => void
      ) => {
        callback(
          {
            error: false,
            statusCode: 200,
            operation: 'test',
          },
          {
            status: 200,
            data: {},
          }
        );
      },
    },
  } as Pubnub;

  return pubnub;
}

function fixturePubnubDeleteUserFail() {
  const pubnub = {
    objects: {
      removeUUIDMetadata: (
        _params: Pubnub.RemoveUUIDMetadataParameters,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.RemoveUUIDMetadataResponse
        ) => void
      ) => {
        callback(
          {
            error: true,
            statusCode: 200,
            operation: 'test',
          },
          {
            status: 200,
            data: {},
          }
        );
      },
    },
  } as Pubnub;

  return pubnub;
}

describe('Deleting user ', () => {
  it('should receive USER_DATA_REMOVED after succesfully deleting user', async () => {
    const expectedActions = [
      UserDataActionType.REMOVE_USER_DATA_COMMAND,
      UserDataActionType.REMOVING_USER_DATA,
      UserDataActionType.USER_DATA_REMOVED,
    ];

    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubDeleteUserSuccess(),
      {},
      removeUserDataEpic
    );

    await store.dispatch(removeUserData({ uuid: 'test' }, {}));

    receivedActions = store.getActions().map((action: any) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_REMOVING_USER_DATA after unsuccesfully deleting user', async () => {
    const expectedActions = [
      UserDataActionType.REMOVE_USER_DATA_COMMAND,
      UserDataActionType.REMOVING_USER_DATA,
      UserDataActionType.ERROR_REMOVING_USER_DATA,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubDeleteUserFail(),
      {},
      removeUserDataEpic
    );

    await store.dispatch(removeUserData({ uuid: 'test' }, {}));

    receivedActions = store.getActions().map((action: any) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
