import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';

import { Message, MessageActionType } from 'pubnub-redux';

export interface MessageReceivedAction<MessageType> {
  type: typeof MessageActionType.MESSAGE_RECEIVED;
  payload: MessageType;
}
export declare const messageReceived: <MessageType extends Message>(
  payload: MessageType
) => MessageReceivedAction<MessageType>;

export const createMessageListener = <MessageType extends Message>(
  observer: Subscriber<MessageReceivedAction<MessageType>>
): Pubnub.ListenerParameters => ({
  message: (payload) =>
    observer.next(
      messageReceived<MessageType>((payload as unknown) as MessageType)
    ),
});
