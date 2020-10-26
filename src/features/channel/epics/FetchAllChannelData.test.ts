import Pubnub from 'pubnub';
import {
  fetchAllChannelData,
  fetchAllChannelDataEpic,
} from './FetchAllChannelData';
import { ChannelDataActionType } from '../ChannelDataActionType.enum';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubFetchChannelsSuccess() {
  const pubnub = {
    objects: {
      getAllChannelMetadata: (
        _params: Pubnub.GetAllMetadataParameters,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.GetAllChannelMetadataResponse<{}>
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

function fixturePubnubFetchChannelsFail() {
  const pubnub = {
    objects: {
      getAllChannelMetadata: (
        _params: Pubnub.GetAllMetadataParameters,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.GetAllChannelMetadataResponse<{}>
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

describe('Updating channel ', () => {
  it('should receive ALL_CHANNEL_DATA_RETRIEVED after succesfully fetching channels', async () => {
    const expectedActions = [
      ChannelDataActionType.FETCH_ALL_CHANNEL_DATA_COMMAND,
      ChannelDataActionType.FETCHING_ALL_CHANNEL_DATA,
      ChannelDataActionType.ALL_CHANNEL_DATA_RETRIEVED,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchChannelsSuccess(),
      {},
      fetchAllChannelDataEpic
    );

    await store.dispatch(fetchAllChannelData({}, {}));

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_FETCHING_ALL_CHANNEL_DATA after unsuccesfully fetching channels', async () => {
    const expectedActions = [
      ChannelDataActionType.FETCH_ALL_CHANNEL_DATA_COMMAND,
      ChannelDataActionType.FETCHING_ALL_CHANNEL_DATA,
      ChannelDataActionType.ERROR_FETCHING_ALL_CHANNEL_DATA,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchChannelsFail(),
      {},
      fetchAllChannelDataEpic
    );

    await store.dispatch(fetchAllChannelData({}, {}));

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
