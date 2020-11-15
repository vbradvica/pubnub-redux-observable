import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';

import { Signal, SignalActionType } from 'pubnub-redux';
declare const signalReceived: <SignalType extends Signal>(
  payload: SignalType
) => SignalReceivedAction<SignalType>;

export interface SignalReceivedAction<SignalType> {
  type: typeof SignalActionType.SIGNAL_RECEIVED;
  payload: SignalType;
}

export const createSignalListener = <SignalType extends Signal>(
  observer: Subscriber<SignalReceivedAction<SignalType>>
): Pubnub.ListenerParameters => ({
  signal: (payload) =>
    observer.next(
      signalReceived<SignalType>((payload as unknown) as SignalType)
    ),
});
