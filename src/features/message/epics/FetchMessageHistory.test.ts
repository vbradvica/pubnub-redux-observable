import Pubnub from 'pubnub';
import { MessageActionType } from '../MessageActionType.enum';
import {
  fetchMessageHistory,
  fetchMessageHistoryEpic,
} from './FetchMessageHistory';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubFetchMessageHistorySuccess() {
  const pubnub = {
    history: (
      _params: Pubnub.HistoryParameters,
      callback: (
        status: Pubnub.PubnubStatus,
        response: Pubnub.HistoryResponse
      ) => void
    ) => {
      callback(
        {
          error: false,
          statusCode: 200,
          operation: 'test',
        },
        {
          messages: [],
        }
      );
    },
  } as Pubnub;

  return pubnub;
}

function fixturePubnubFetchMessageHistoryFail() {
  const pubnub = {
    history: (
      _params: Pubnub.HistoryParameters,
      callback: (
        status: Pubnub.PubnubStatus,
        response: Pubnub.HistoryResponse
      ) => void
    ) => {
      callback(
        {
          error: true,
          statusCode: 200,
          operation: 'test',
        },
        {
          messages: [],
        }
      );
    },
  } as Pubnub;

  return pubnub;
}

describe('Fetching message history ', () => {
  it('should receive MESSAGE_HISTORY_RETRIEVED after succesfully fetching message history', async () => {
    const expectedActions = [
      MessageActionType.FETCH_MESSAGE_HISTORY_COMMAND,
      MessageActionType.FETCHING_MESSAGE_HISTORY,
      MessageActionType.MESSAGE_HISTORY_RETRIEVED,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchMessageHistorySuccess(),
      {},
      fetchMessageHistoryEpic
    );

    await store.dispatch(fetchMessageHistory({ channel: 'channela' }, {}));

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_FETCHING_MESSAGE_HISTORY after unsuccesfully fetching message history', async () => {
    const expectedActions = [
      MessageActionType.FETCH_MESSAGE_HISTORY_COMMAND,
      MessageActionType.FETCHING_MESSAGE_HISTORY,
      MessageActionType.ERROR_FETCHING_MESSAGE_HISTORY,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubFetchMessageHistoryFail(),
      {},
      fetchMessageHistoryEpic
    );

    await store.dispatch(fetchMessageHistory({ channel: 'channela' }, {}));

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
