import Pubnub from 'pubnub';
import { SignalActionType } from 'pubnub-redux';
import { sendSignal, sendSignalEpic } from './SendSignal';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubSendSignalSuccess() {
  const pubnub = {
    signal: (
      _params: Pubnub.SignalParameters,
      callback: (
        status: Pubnub.PubnubStatus,
        response: Pubnub.SignalResponse
      ) => void
    ) => {
      callback(
        {
          error: false,
          statusCode: 200,
          operation: 'test',
        },
        {
          timetoken: 0,
        }
      );
    },
  } as Pubnub;

  return pubnub;
}

function fixturePubnubSendSignalFail() {
  const pubnub = {
    signal: (
      _params: Pubnub.SignalParameters,
      callback: (
        status: Pubnub.PubnubStatus,
        response: Pubnub.SignalResponse
      ) => void
    ) => {
      callback(
        {
          error: true,
          statusCode: 200,
          operation: 'test',
        },
        {
          timetoken: 0,
        }
      );
    },
  } as Pubnub;

  return pubnub;
}

describe('Sending signal ', () => {
  it('should receive SIGNAL_SENT after succesfully sending signal', async () => {
    const expectedActions = [
      SignalActionType.SEND_SIGNAL_COMMAND,
      SignalActionType.SENDING_SIGNAL,
      SignalActionType.SIGNAL_SENT,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubSendSignalSuccess(),
      {},
      sendSignalEpic
    );

    await store.dispatch(
      sendSignal({ message: { some: 'thing' }, channel: 'test' }, {})
    );

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_SENDING_SIGNAL after unsuccesfully sending signal', async () => {
    const expectedActions = [
      SignalActionType.SEND_SIGNAL_COMMAND,
      SignalActionType.SENDING_SIGNAL,
      SignalActionType.ERROR_SENDING_SIGNAL,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubSendSignalFail(),
      {},
      sendSignalEpic
    );

    await store.dispatch(
      sendSignal({ message: { some: 'thing' }, channel: 'test' }, {})
    );

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
