import Pubnub from 'pubnub';
import { PresenceActionType } from '../PresenceActionType.enum';
import { fetchHereNow, fetchHereNowEpic } from './FetchHereNow';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubFetchHereNowSuccess() {
  const pubnub = {
    hereNow: (
      _params: Pubnub.HereNowParameters,
      callback: (
        status: Pubnub.PubnubStatus,
        response: Pubnub.HereNowResponse
      ) => void
    ) => {
      callback(
        {
          error: false,
          statusCode: 200,
          operation: 'test',
        },
        {
          channels: {},
          totalChannels: 1,
          totalOccupancy: 1,
        }
      );
    },
  } as Pubnub;

  return pubnub;
}

function fixturePubnubFetchHereNowFail() {
  const pubnub = {
    hereNow: (
      _params: Pubnub.HereNowParameters,
      callback: (
        status: Pubnub.PubnubStatus,
        response: Pubnub.HereNowResponse
      ) => void
    ) => {
      callback(
        {
          error: true,
          statusCode: 200,
          operation: 'test',
        },
        {
          channels: {},
          totalChannels: 1,
          totalOccupancy: 1,
        }
      );
    },
  } as Pubnub;

  return pubnub;
}

describe('Fetching here now ', () => {
  it('should receive HERE_NOW_RETRIEVED after succesfully fetching here now', async () => {
    const expectedActions = [
      PresenceActionType.HERE_NOW_COMMAND,
      PresenceActionType.FETCHING_HERE_NOW,
      PresenceActionType.HERE_NOW_RETRIEVED,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchHereNowSuccess(),
      {},
      fetchHereNowEpic
    );

    await store.dispatch(fetchHereNow({ channels: ['channela'] }, {}));

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_FETCHING_HERE_NOW after unsuccesfully fetching here now', async () => {
    const expectedActions = [
      PresenceActionType.HERE_NOW_COMMAND,
      PresenceActionType.FETCHING_HERE_NOW,
      PresenceActionType.ERROR_FETCHING_HERE_NOW,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchHereNowFail(),
      {},
      fetchHereNowEpic
    );

    await store.dispatch(fetchHereNow({ channels: ['channela'] }, {}));

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
