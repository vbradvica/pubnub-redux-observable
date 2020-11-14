import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  allUserDataRetrieved,
  errorFetchingAllUserData,
  fetchingAllUserData,
  UserDataActionType,
} from 'pubnub-redux';
import { FetchAllUserDataRequest } from 'pubnub-redux/dist/features/user/UserDataActions';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export const fetchAllUserData = <Meta extends ActionMeta = {}>(
  request: FetchAllUserDataRequest = {},
  meta: Meta
): PayloadAction<FetchAllUserDataRequest, string, ActionMeta> => ({
  type: UserDataActionType.FETCH_ALL_USER_DATA_COMMAND,
  payload: request,
  meta,
});

export const fetchAllUserDataEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(UserDataActionType.FETCH_ALL_USER_DATA_COMMAND),
    mergeMap(
      (action: PayloadAction<FetchAllUserDataRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(fetchingAllUserData(action.payload, action.meta));

          pubnub.api?.objects.getAllUUIDMetadata(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorFetchingAllUserData(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = allUserDataRetrieved(
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
