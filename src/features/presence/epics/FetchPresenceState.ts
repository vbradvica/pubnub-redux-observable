import {
  PresenceStateRequest,
  PresenceStateError,
  FetchingPresenceStateAction,
  ErrorFetchingPresenceStateAction,
  PresenceStateRetrievedAction,
  PresenceStateSuccess,
} from '../PresenceActions';
import { PresenceActionType } from '../PresenceActionType.enum';
import { ActionMeta } from 'foundations/ActionMeta';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const fetchingPresenceState = <Meta extends ActionMeta>(
  payload: PresenceStateRequest,
  meta?: Meta
): FetchingPresenceStateAction<Meta> => ({
  type: PresenceActionType.FETCHING_PRESENCE_STATE,
  payload,
  meta,
});

export const presenceStateRetrieved = <Meta extends ActionMeta>(
  payload: PresenceStateSuccess,
  meta?: Meta
): PresenceStateRetrievedAction<Meta> => ({
  type: PresenceActionType.PRESENCE_STATE_RETRIEVED,
  payload,
  meta,
});

export const errorFetchingPresenceState = <Meta extends ActionMeta>(
  payload: PresenceStateError,
  meta?: Meta
): ErrorFetchingPresenceStateAction<Meta> => ({
  type: PresenceActionType.ERROR_FETCHING_PRESENCE_STATE,
  payload,
  meta,
});

export const fetchPresenceState = <Meta extends ActionMeta>(
  request: PresenceStateRequest,
  meta: Meta
): PayloadAction<PresenceStateRequest, string, ActionMeta> => ({
  type: PresenceActionType.PRESENCE_STATE_COMMAND,
  payload: request,
  meta,
});

export const fetchPresenceStateEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(PresenceActionType.PRESENCE_STATE_COMMAND),
    mergeMap(
      (action: PayloadAction<PresenceStateRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(fetchingPresenceState(action.payload, action.meta));

          pubnub.api?.getState(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorFetchingPresenceState(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = presenceStateRetrieved(
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
