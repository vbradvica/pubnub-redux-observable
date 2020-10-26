import {
  SendMessageRequest,
  SendingMessageAction,
  MessageSentAction,
  SendMessageSuccess,
  ErrorSendingMessageAction,
  SendMessageError,
} from '../MessageActions';
import { MessageActionType } from '../MessageActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicTypes';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const sendingMessage = <
  MessageContentType extends object,
  MessageMeta extends object,
  Meta extends ActionMeta
>(
  payload: SendMessageRequest<MessageContentType, MessageMeta>,
  meta?: Meta
): SendingMessageAction<MessageContentType, MessageMeta, Meta> => ({
  type: MessageActionType.SENDING_MESSAGE,
  payload,
  meta,
});

export const messageSent = <
  MessageContentType extends object,
  MessageMeta extends object,
  Meta extends ActionMeta
>(
  payload: SendMessageSuccess<MessageContentType, MessageMeta>,
  meta?: Meta
): MessageSentAction<MessageContentType, MessageMeta, Meta> => ({
  type: MessageActionType.MESSAGE_SENT,
  payload,
  meta,
});

export const errorSendingMessage = <
  MessageContentType extends object,
  MessageMeta extends object,
  Meta extends ActionMeta
>(
  payload: SendMessageError<MessageContentType, MessageMeta>,
  meta?: Meta
): ErrorSendingMessageAction<MessageContentType, MessageMeta, Meta> => ({
  type: MessageActionType.ERROR_SENDING_MESSAGE,
  payload,
  meta,
});

export const sendMessage = <
  MessageContentType extends object = {},
  MessageMeta extends object = {},
  Meta extends ActionMeta = AnyMeta
>(
  request: SendMessageRequest<MessageContentType, MessageMeta>,
  meta: Meta
): PayloadAction<
  SendMessageRequest<MessageContentType, MessageMeta>,
  string,
  ActionMeta
> => ({
  type: MessageActionType.SEND_MESSAGE_COMMAND,
  payload: request,
  meta,
});

export const sendMessageEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(MessageActionType.SEND_MESSAGE_COMMAND),
    mergeMap(
      (
        action: PayloadAction<SendMessageRequest<any, any>, string, ActionMeta>
      ) =>
        new Observable((observer) => {
          observer.next(sendingMessage(action.payload, action.meta));

          pubnub.api.publish(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorSendingMessage(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = messageSent(
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
