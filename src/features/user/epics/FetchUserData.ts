import { UserDataActionType } from '../UserDataActionType.enum';
import {
  ErrorFetchingUserDataAction,
  UserDataRetrievedAction,
  FetchingUserDataAction,
  FetchUserDataError,
  FetchUserDataSuccess,
  FetchUserDataRequest,
} from '../UserDataActions';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const fetchingUserData = <Meta extends ActionMeta>(
  payload: FetchUserDataRequest,
  meta?: Meta
): FetchingUserDataAction<Meta> => ({
  type: UserDataActionType.FETCHING_USER_DATA,
  payload,
  meta,
});

export const UserDataRetrieved = <
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: FetchUserDataSuccess<UserCustom>,
  meta?: Meta
): UserDataRetrievedAction<UserCustom, Meta> => ({
  type: UserDataActionType.USER_DATA_RETRIEVED,
  payload,
  meta,
});

export const errorFetchingUserData = <Meta extends ActionMeta>(
  payload: FetchUserDataError,
  meta?: Meta
): ErrorFetchingUserDataAction<Meta> => ({
  type: UserDataActionType.ERROR_FETCHING_USER_DATA,
  payload,
  meta,
  error: true,
});

export const fetchUserData = <Meta extends ActionMeta = AnyMeta>(
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
