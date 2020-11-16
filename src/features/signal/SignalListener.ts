import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';
import { SignalReceivedAction, Signal } from './SignalActions';
import { SignalActionType } from './SignalActionType.enum';

export const signalReceived = <SignalType extends Signal>(
  payload: SignalType
): SignalReceivedAction<SignalType> => ({
  type: SignalActionType.SIGNAL_RECEIVED,
  payload,
});

export const createSignalListener = <SignalType extends Signal>(
  observer: Subscriber<SignalReceivedAction<SignalType>>
): Pubnub.ListenerParameters => ({
  signal: (payload) =>
    observer.next(
      signalReceived<SignalType>((payload as unknown) as SignalType)
    ),
});
