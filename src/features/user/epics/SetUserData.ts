import Pubnub from 'pubnub';
import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  errorSettingUserData,
  settingUserData,
  UserDataActionType,
  UserDataSet,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export declare type SetUserDataRequest<
  UserCustom extends Pubnub.ObjectCustom
> = Pubnub.SetUUIDMetadataParameters<UserCustom>;

export const setUserData = <
  UserCustom extends Pubnub.ObjectCustom,
  Meta extends ActionMeta = {}
>(
  request: SetUserDataRequest<UserCustom>,
  meta: Meta
): PayloadAction<SetUserDataRequest<UserCustom>, string, ActionMeta> => ({
  type: UserDataActionType.SET_USER_DATA_COMMAND,
  payload: request,
  meta,
});

export const setUserDataEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(UserDataActionType.SET_USER_DATA_COMMAND),
    mergeMap(
      (action: PayloadAction<SetUserDataRequest<any>, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(settingUserData(action.payload, action.meta));

          pubnub.api?.objects.setUUIDMetadata(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorSettingUserData(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = UserDataSet(
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
