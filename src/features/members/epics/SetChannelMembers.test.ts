import Pubnub from 'pubnub';
import { ChannelMembersActionType } from '../ChannelMembersActionType.enum';
import { setChannelMembers, setChannelMembersEpic } from './SetChannelMembers';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubUpdateMembersSuccess() {
  const pubnub = {
    objects: {
      setChannelMembers: (
        _params: Pubnub.SetChannelMembersParameters<{}>,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.ManageChannelMembersResponse<{}, {}>
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

function fixturePubnubUpdateMembersFail() {
  const pubnub = {
    objects: {
      setChannelMembers: (
        _params: Pubnub.SetChannelMembersParameters<{}>,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.ManageChannelMembersResponse<{}, {}>
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
            status: 500,
          }
        );
      },
    },
  } as Pubnub;

  return pubnub;
}

describe('Updating members ', () => {
  it('should receive CHANNEL_MEMBERS_UPDATED after succesfully updating members', async () => {
    const expectedActions = [
      ChannelMembersActionType.SET_CHANNEL_MEMBERS_COMMAND,
      ChannelMembersActionType.SETTING_CHANNEL_MEMBERS,
      ChannelMembersActionType.CHANNEL_MEMBERS_SET,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubUpdateMembersSuccess(),
      {},
      setChannelMembersEpic
    );

    try {
      await store.dispatch(
        setChannelMembers({ channel: 'test', uuids: ['usera'] }, {})
      );
    } catch {
      console.log('dispatch updateMembers failed');
    }

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_SETTING_CHANNEL_MEMBERS after unsuccesfully updating members', async () => {
    const expectedActions = [
      ChannelMembersActionType.SET_CHANNEL_MEMBERS_COMMAND,
      ChannelMembersActionType.SETTING_CHANNEL_MEMBERS,
      ChannelMembersActionType.ERROR_SETTING_CHANNEL_MEMBERS,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubUpdateMembersFail(),
      {},
      setChannelMembersEpic
    );

    await store.dispatch(
      setChannelMembers({ channel: 'test', uuids: ['usera'] }, {})
    );

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
