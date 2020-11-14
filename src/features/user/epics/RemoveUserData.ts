import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  errorRemovingUserData,
  removingUserData,
  UserDataActionType,
  UserDataRemoved,
} from 'pubnub-redux';
import { DeleteUserDataRequest } from 'pubnub-redux/dist/features/user/UserDataActions';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export const removeUserData = <Meta extends ActionMeta = {}>(
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

          pubnub.api?.objects.removeUUIDMetadata(
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
