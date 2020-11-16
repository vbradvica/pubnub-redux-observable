import Pubnub from 'pubnub';
import { ChannelDataActionType } from '../ChannelDataActionType.enum';
import { setChannelData, setChannelDataEpic } from './SetChannelData';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubUpdateChannelSuccess() {
  const pubnub = {
    objects: {
      setChannelMetadata: (
        _params: Pubnub.SetChannelMetadataParameters<{}>,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.SetChannelMetadataResponse<{}>
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

function fixturePubnubUpdateChannelFail() {
  const pubnub = {
    objects: {
      setChannelMetadata: (
        _params: Pubnub.SetChannelMetadataParameters<{}>,
        callback: (
          status: Pubnub.PubnubStatus,
          response: Pubnub.SetChannelMetadataResponse<{}>
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

describe('Updating channel ', () => {
  it('should receive CHANNEL_DATA_SET after succesfully updating channel', async () => {
    const expectedActions = [
      ChannelDataActionType.SET_CHANNEL_DATA_COMMAND,
      ChannelDataActionType.SETTING_CHANNEL_DATA,
      ChannelDataActionType.CHANNEL_DATA_SET,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubUpdateChannelSuccess(),
      {},
      setChannelDataEpic
    );

    await store.dispatch(
      setChannelData({ channel: 'test', data: { name: 'test' } }, {})
    );

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_SETTING_CHANNEL_DATA after unsuccesfully updating channel', async () => {
    const expectedActions = [
      ChannelDataActionType.SET_CHANNEL_DATA_COMMAND,
      ChannelDataActionType.SETTING_CHANNEL_DATA,
      ChannelDataActionType.ERROR_SETTING_CHANNEL_DATA,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubUpdateChannelFail(),
      {},
      setChannelDataEpic
    );

    await store.dispatch(
      setChannelData({ channel: 'test', data: { name: 'test' } }, {})
    );

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
