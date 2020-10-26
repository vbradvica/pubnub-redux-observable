import {
  HereNowRequest,
  HereNowError,
  FetchingHereNowAction,
  ErrorFetchingHereNowAction,
  HereNowRetrievedAction,
  HereNowSuccess,
} from '../PresenceActions';
import { PresenceActionType } from '../PresenceActionType.enum';
import { ActionMeta } from 'foundations/ActionMeta';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicTypes';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const fetchingHereNow = <Meta extends ActionMeta>(
  payload: HereNowRequest,
  meta?: Meta
): FetchingHereNowAction<Meta> => ({
  type: PresenceActionType.FETCHING_HERE_NOW,
  payload,
  meta,
});

export const hereNowRetrieved = <Meta extends ActionMeta>(
  payload: HereNowSuccess,
  meta?: Meta
): HereNowRetrievedAction<Meta> => ({
  type: PresenceActionType.HERE_NOW_RETRIEVED,
  payload,
  meta,
});

export const errorFetchingHereNow = <Meta extends ActionMeta>(
  payload: HereNowError,
  meta?: Meta
): ErrorFetchingHereNowAction<Meta> => ({
  type: PresenceActionType.ERROR_FETCHING_HERE_NOW,
  payload,
  meta,
});

export const fetchHereNow = <Meta extends ActionMeta>(
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

        pubnub.api.hereNow(
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
