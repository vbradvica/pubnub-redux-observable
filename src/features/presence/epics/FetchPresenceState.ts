import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  errorFetchingPresenceState,
  fetchingPresenceState,
  PresenceActionType,
  PresenceStateRequest,
  presenceStateRetrieved,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export const fetchPresenceState = <Meta extends ActionMeta = {}>(
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
