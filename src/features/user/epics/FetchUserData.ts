import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  errorFetchingUserData,
  fetchingUserData,
  UserDataActionType,
  UserDataRetrieved,
} from 'pubnub-redux';
import { FetchUserDataRequest } from 'pubnub-redux/dist/features/user/UserDataActions';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export const fetchUserData = <Meta extends ActionMeta = {}>(
  request: FetchUserDataRequest,
  meta: Meta
): PayloadAction<FetchUserDataRequest, string, ActionMeta> => ({
  type: UserDataActionType.FETCH_USER_DATA_COMMAND,
  payload: request,
  meta,
});

export const fetchUserDataEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(UserDataActionType.FETCH_USER_DATA_COMMAND),
    mergeMap(
      (action: PayloadAction<FetchUserDataRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(fetchingUserData(action.payload, action.meta));

          pubnub.api?.objects.getUUIDMetadata(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorFetchingUserData(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = UserDataRetrieved(
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
