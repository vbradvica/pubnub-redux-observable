import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  errorSendingMessage,
  MessageActionType,
  MessageRequestOptions,
  messageSent,
  sendingMessage,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

type SendMessageRequest<
  MessageContentType,
  MessageMetaType
> = MessageRequestOptions<MessageContentType, MessageMetaType>;

export const sendMessage = <
  MessageContentType extends object = {},
  MessageMeta extends object = {},
  Meta extends ActionMeta = {}
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

          pubnub.api?.publish(
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
