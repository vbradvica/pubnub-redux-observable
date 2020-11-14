import Pubnub from 'pubnub';
import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { FetchMessageHistoryResponse } from 'pubnub-redux/dist/features/message/MessageActions';
import {
  MessageActionType,
  ActionMeta,
  fetchingMessageHistory,
  messageHistoryRetrieved,
  errorFetchingMessageHistory,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

type FetchMessageHistoryRequest = ReturnType<
  typeof fetchingMessageHistory
>['payload'];

export const fetchMessageHistory = <Meta extends ActionMeta = {}>(
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
