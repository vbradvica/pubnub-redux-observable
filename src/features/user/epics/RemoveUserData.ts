import {
  UserDataRemovedAction,
  RemovingUserDataAction,
  ErrorRemovingUserDataAction,
  DeleteUserDataRequest,
  DeleteUserDataError,
  DeleteUserDataSuccess,
} from '../UserDataActions';
import { UserDataActionType } from '../UserDataActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicTypes';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const removingUserData = <Meta extends ActionMeta>(
  payload: DeleteUserDataRequest,
  meta?: Meta
): RemovingUserDataAction<Meta> => ({
  type: UserDataActionType.REMOVING_USER_DATA,
  payload,
  meta,
});

export const UserDataRemoved = <Meta extends ActionMeta>(
  payload: DeleteUserDataSuccess,
  meta?: Meta
): UserDataRemovedAction<Meta> => ({
  type: UserDataActionType.USER_DATA_REMOVED,
  payload,
  meta,
});

export const errorRemovingUserData = <Meta extends ActionMeta>(
  payload: DeleteUserDataError,
  meta?: Meta
): ErrorRemovingUserDataAction<Meta> => ({
  type: UserDataActionType.ERROR_REMOVING_USER_DATA,
  payload,
  meta,
  error: true,
});

export const removeUserData = <Meta extends ActionMeta = AnyMeta>(
  request: DeleteUserDataRequest,
  meta: Meta
): PayloadAction<DeleteUserDataRequest, string, ActionMeta> => ({
  type: UserDataActionType.REMOVE_USER_DATA_COMMAND,
  payload: request,
  meta,
});

export const removeUserDataEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(UserDataActionType.REMOVE_USER_DATA_COMMAND),
    mergeMap(
      (action: PayloadAction<DeleteUserDataRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(removingUserData(action.payload, action.meta));

          pubnub.api.objects.removeUUIDMetadata(
            { uuid: action.payload.uuid },
            (status) => {
              if (status.error) {
                observer.error(
                  errorRemovingUserData(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = UserDataRemoved(
                  {
                    request: action.payload,
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
