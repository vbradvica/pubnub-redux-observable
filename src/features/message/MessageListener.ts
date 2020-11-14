import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';

import { Message } from 'pubnub-redux';
import { MessageReceivedAction } from 'pubnub-redux/dist/features/message/MessageActions';
import { messageReceived } from 'pubnub-redux/dist/features/message/MessageListener';

export const createMessageListener = <MessageType extends Message>(
  observer: Subscriber<MessageReceivedAction<MessageType>>
): Pubnub.ListenerParameters => ({
  message: (payload) =>
    observer.next(
      messageReceived<MessageType>((payload as unknown) as MessageType)
    ),
});
