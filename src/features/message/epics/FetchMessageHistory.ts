import {
  FetchMessageHistoryRequest,
  FetchMessageHistoryResponse,
  FetchMessageHistoryError,
  FetchingMessageHistoryAction,
  ErrorFetchingMessageHistoryAction,
  MessageHistoryRetrievedAction,
  FetchMessageHistorySuccess,
} from '../../message/MessageActions';
import { MessageActionType } from '../../message/MessageActionType.enum';
import { ActionMeta } from 'foundations/ActionMeta';
import Pubnub from 'pubnub';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const fetchingMessageHistory = <Meta extends ActionMeta>(
  payload: FetchMessageHistoryRequest,
  meta?: Meta
): FetchingMessageHistoryAction<Meta> => ({
  type: MessageActionType.FETCHING_MESSAGE_HISTORY,
  payload,
  meta,
});

export const messageHistoryRetrieved = <
  MessageContentType,
  Meta extends ActionMeta
>(
  payload: FetchMessageHistorySuccess<MessageContentType>,
  meta?: Meta
): MessageHistoryRetrievedAction<MessageContentType, Meta> => ({
  type: MessageActionType.MESSAGE_HISTORY_RETRIEVED,
  payload,
  meta,
});

export const errorFetchingMessageHistory = <Meta extends ActionMeta>(
  payload: FetchMessageHistoryError,
  meta?: Meta
): ErrorFetchingMessageHistoryAction<Meta> => ({
  type: MessageActionType.ERROR_FETCHING_MESSAGE_HISTORY,
  payload,
  meta,
});

export const fetchMessageHistory = <Meta extends ActionMeta>(
  request: FetchMessageHistoryRequest,
  meta: Meta
): PayloadAction<FetchMessageHistoryRequest, string, ActionMeta> => ({
  type: MessageActionType.FETCH_MESSAGE_HISTORY_COMMAND,
  payload: request,
  meta,
});

export const fetchMessageHistoryEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(MessageActionType.FETCH_MESSAGE_HISTORY_COMMAND),
    mergeMap(
      (action: PayloadAction<FetchMessageHistoryRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(fetchingMessageHistory(action.payload, action.meta));

          pubnub.api?.history(
            {
              ...(action.payload as Pubnub.HistoryParameters),
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorFetchingMessageHistory(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = messageHistoryRetrieved(
                  {
                    request: action.payload,
                    response: response as FetchMessageHistoryResponse<any>,
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
