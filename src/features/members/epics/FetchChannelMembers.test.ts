import Pubnub from 'pubnub';
import {
  fetchChannelMembers,
  fetchChannelMembersEpic,
} from './FetchChannelMembers';
import { ChannelMembersActionType } from 'pubnub-redux';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubFetchMembersSuccess() {
  const pubnub = {
    objects: {
      getChannelMembers: (
        _params: Pubnub.GetChannelMembersParameters,
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

function fixturePubnubFetchMembersFail() {
  const pubnub = {
    objects: {
      getChannelMembers: (
        _params: Pubnub.GetChannelMembersParameters,
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
  it('should receive CHANNEL_MEMBERS_RETRIEVED after succesfully fetching members', async () => {
    const expectedActions = [
      ChannelMembersActionType.FETCH_CHANNEL_MEMBERS_COMMAND,
      ChannelMembersActionType.FETCHING_CHANNEL_MEMBERS,
      ChannelMembersActionType.CHANNEL_MEMBERS_RETRIEVED,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchMembersSuccess(),
      {},
      fetchChannelMembersEpic
    );

    try {
      await store.dispatch(fetchChannelMembers({ channel: 'test' }, {}));
    } catch {
      console.log('dispatch fetchMembers failed');
    }

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_FETCHING_CHANNEL_MEMBERS after unsuccesfully fetching members', async () => {
    const expectedActions = [
      ChannelMembersActionType.FETCH_CHANNEL_MEMBERS_COMMAND,
      ChannelMembersActionType.FETCHING_CHANNEL_MEMBERS,
      ChannelMembersActionType.ERROR_FETCHING_CHANNEL_MEMBERS,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchMembersFail(),
      {},
      fetchChannelMembersEpic
    );

    await store.dispatch(fetchChannelMembers({ channel: 'test' }, {}));

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
