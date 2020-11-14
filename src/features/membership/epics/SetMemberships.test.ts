import Pubnub from 'pubnub';
import { MembershipActionType } from 'pubnub-redux';
import { setMemberships, setMembershipsEpic } from './SetMemberships';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubUpdateMembershipSuccess() {
  const pubnub = {
    objects: {
      setMemberships: (
        _params: Pubnub.SetMembershipsParameters<{}>,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.ManageMembershipsResponse<{}, {}>
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

function fixturePubnubUpdateMembershipFail() {
  const pubnub = {
    objects: {
      setMemberships: (
        _params: Pubnub.SetMembershipsParameters<{}>,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.ManageMembershipsResponse<{}, {}>
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

describe('Updating membership ', () => {
  it('should receive MEMBERSHIPS_SET after succesfully updating membership', async () => {
    const expectedActions = [
      MembershipActionType.SET_MEMBERSHIPS_COMMAND,
      MembershipActionType.SETTING_MEMBERSHIPS,
      MembershipActionType.MEMBERSHIPS_SET,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubUpdateMembershipSuccess(),
      {},
      setMembershipsEpic
    );

    try {
      await store.dispatch(
        setMemberships({ uuid: 'test', channels: [{ id: 'channela' }] }, {})
      );
    } catch {
      console.log('dispatch updateMembership failed');
    }

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_SETTING_MEMBERSHIPS after unsuccesfully updating membership', async () => {
    const expectedActions = [
      MembershipActionType.SET_MEMBERSHIPS_COMMAND,
      MembershipActionType.SETTING_MEMBERSHIPS,
      MembershipActionType.ERROR_SETTING_MEMBERSHIPS,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubUpdateMembershipFail(),
      {},
      setMembershipsEpic
    );

    await store.dispatch(
      setMemberships({ uuid: 'test', channels: [{ id: 'channela' }] }, {})
    );

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
