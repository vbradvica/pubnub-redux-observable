import {
  SendSignalRequest,
  SendingSignalAction,
  SignalSentAction,
  SendSignalSuccess,
  ErrorSendingSignalAction,
  SendSignalError,
} from '../SignalActions';
import { SignalActionType } from '../SignalActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const sendingSignal = <
  SignalContentType extends object,
  Meta extends ActionMeta
>(
  payload: SendSignalRequest<SignalContentType>,
  meta?: Meta
): SendingSignalAction<SignalContentType, Meta> => ({
  type: SignalActionType.SENDING_SIGNAL,
  payload,
  meta,
});

export const signalSent = <
  SignalContentType extends object,
  Meta extends ActionMeta
>(
  payload: SendSignalSuccess<SignalContentType>,
  meta?: Meta
): SignalSentAction<SignalContentType, Meta> => ({
  type: SignalActionType.SIGNAL_SENT,
  payload,
  meta,
});

export const errorSendingSignal = <
  SignalContentType extends object,
  Meta extends ActionMeta
>(
  payload: SendSignalError<SignalContentType>,
  meta?: Meta
): ErrorSendingSignalAction<SignalContentType, Meta> => ({
  type: SignalActionType.ERROR_SENDING_SIGNAL,
  payload,
  meta,
});

export const sendSignal = <
  SignalContentType extends object = {},
  Meta extends ActionMeta = AnyMeta
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
