import {
  ErrorFetchingAllUserDataAction,
  AllUserDataRetrievedAction,
  FetchingAllUserDataAction,
  FetchAllUserDataError,
  FetchAllUserDataSuccess,
  FetchAllUserDataRequest,
} from '../UserDataActions';
import { UserDataActionType } from '../UserDataActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const fetchingAllUserData = <Meta extends ActionMeta>(
  payload: FetchAllUserDataRequest,
  meta?: Meta
): FetchingAllUserDataAction<Meta> => ({
  type: UserDataActionType.FETCHING_ALL_USER_DATA,
  payload,
  meta,
});

export const allUserDataRetrieved = <
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: FetchAllUserDataSuccess<UserCustom>,
  meta?: Meta
): AllUserDataRetrievedAction<UserCustom, Meta> => ({
  type: UserDataActionType.ALL_USER_DATA_RETRIEVED,
  payload,
  meta,
});

export const errorFetchingAllUserData = <Meta extends ActionMeta = AnyMeta>(
  payload: FetchAllUserDataError,
  meta?: Meta
): ErrorFetchingAllUserDataAction<Meta> => ({
  type: UserDataActionType.ERROR_FETCHING_ALL_USER_DATA,
  payload,
  meta,
  error: true,
});

export const fetchAllUserData = <Meta extends ActionMeta = AnyMeta>(
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
