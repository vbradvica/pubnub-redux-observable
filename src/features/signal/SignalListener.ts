import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';

import { Signal } from 'pubnub-redux';
import { SignalReceivedAction } from 'pubnub-redux/dist/features/signal/SignalActions';
import { signalReceived } from 'pubnub-redux/dist/features/signal/SignalListener';

export const createSignalListener = <SignalType extends Signal>(
  observer: Subscriber<SignalReceivedAction<SignalType>>
): Pubnub.ListenerParameters => ({
  signal: (payload) =>
    observer.next(
      signalReceived<SignalType>((payload as unknown) as SignalType)
    ),
});
