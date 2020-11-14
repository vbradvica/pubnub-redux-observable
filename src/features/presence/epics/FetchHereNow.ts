import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  errorFetchingHereNow,
  fetchingHereNow,
  HereNowRequest,
  hereNowRetrieved,
  PresenceActionType,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export const fetchHereNow = <Meta extends ActionMeta = {}>(
  request: HereNowRequest,
  meta: Meta
): PayloadAction<HereNowRequest, string, ActionMeta> => ({
  type: PresenceActionType.HERE_NOW_COMMAND,
  payload: request,
  meta,
});

export const fetchHereNowEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(PresenceActionType.HERE_NOW_COMMAND),
    mergeMap((action: PayloadAction<HereNowRequest, string, ActionMeta>) =>
      new Observable((observer) => {
        observer.next(fetchingHereNow(action.payload, action.meta));

        pubnub.api?.hereNow(
          {
            ...action.payload,
            includeUUIDs: true,
            includeState: false,
          },
          (status, response) => {
            if (status.error) {
              observer.error(
                errorFetchingHereNow(
                  {
                    request: action.payload,
                    status,
                  },
                  action.meta
                )
              );
            } else {
              const finalized = hereNowRetrieved(
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
