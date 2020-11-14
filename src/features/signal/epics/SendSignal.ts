import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  errorSendingSignal,
  sendingSignal,
  SignalActionType,
  signalSent,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';
import { SendSignalRequest } from 'pubnub-redux/dist/features/signal/SignalActions';

export const sendSignal = <
  SignalContentType extends object = {},
  Meta extends ActionMeta = {}
>(
  request: SendSignalRequest<SignalContentType>,
  meta: Meta
): PayloadAction<SendSignalRequest<SignalContentType>, string, ActionMeta> => ({
  type: SignalActionType.SEND_SIGNAL_COMMAND,
  payload: request,
  meta,
});

export const sendSignalEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(SignalActionType.SEND_SIGNAL_COMMAND),
    mergeMap(
      (action: PayloadAction<SendSignalRequest<any>, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(sendingSignal(action.payload, action.meta));

          pubnub.api?.signal(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorSendingSignal(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = signalSent(
                  {
                    request: action.payload,
                    response,
                    status,
                  },
                  action.meta
                );

                observer.next(finalized);
                observer.complete();
              }
            }
          );
        }).pipe(
          map((action) => action),
          catchError((error) => of(error))
        )
    )
  );
