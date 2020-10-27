import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';
import { MessageReceivedAction, Message } from './MessageActions';
import { MessageActionType } from './MessageActionType.enum';

export const messageReceived = <MessageType extends Message>(
  payload: MessageType
): MessageReceivedAction<MessageType> => ({
  type: MessageActionType.MESSAGE_RECEIVED,
  payload,
});

export const createMessageListener = <MessageType extends Message>(
  observer: Subscriber<MessageReceivedAction<MessageType>>
): Pubnub.ListenerParameters => ({
  message: (payload) =>
    observer.next(
      messageReceived<MessageType>((payload as unknown) as MessageType)
    ),
});
