import Pubnub from 'pubnub';
import { MessageActionType } from 'pubnub-redux';
import { sendMessage, sendMessageEpic } from './SendMessage';
import { createMockStore } from 'foundations/Test-utils';

function fixturePubnubSendMessageSuccess() {
  const pubnub = {
    publish: (
      _params: Pubnub.PublishParameters,
      callback: (
        status: Pubnub.PubnubStatus,
        response: Pubnub.PublishResponse
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

function fixturePubnubSendMessageFail() {
  const pubnub = {
    publish: (
      _params: Pubnub.PublishParameters,
      callback: (
        status: Pubnub.PubnubStatus,
        response: Pubnub.PublishResponse
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

describe('Sending message ', () => {
  it('should receive MESSAGE_SENT after succesfully sending message', async () => {
    const expectedActions = [
      MessageActionType.SEND_MESSAGE_COMMAND,
      MessageActionType.SENDING_MESSAGE,
      MessageActionType.MESSAGE_SENT,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubSendMessageSuccess(),
      {},
      sendMessageEpic
    );

    await store.dispatch(
      sendMessage({ message: { some: 'thing' }, channel: 'test' }, {})
    );

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should receive ERROR_SENDING_MESSAGE after unsuccesfully sending message', async () => {
    const expectedActions = [
      MessageActionType.SEND_MESSAGE_COMMAND,
      MessageActionType.SENDING_MESSAGE,
      MessageActionType.ERROR_SENDING_MESSAGE,
    ];
    let receivedActions = [];

    const store = createMockStore(
      fixturePubnubSendMessageFail(),
      {},
      sendMessageEpic
    );

    await store.dispatch(
      sendMessage({ message: { some: 'thing' }, channel: 'test' }, {})
    );

    receivedActions = store.getActions().map((action) => action.type);
    expect(receivedActions).toEqual(expectedActions);
  });
});
