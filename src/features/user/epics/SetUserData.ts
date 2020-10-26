import {
  SettingUserDataAction,
  UserDataSetAction,
  ErrorSettingUserDataAction,
  UserDataError,
  UserDataSuccess,
  SetUserDataRequest,
} from '../UserDataActions';
import { UserDataActionType } from '../UserDataActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicTypes';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const settingUserData = <
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetUserDataRequest<UserCustom>,
  meta?: Meta
): SettingUserDataAction<Meta> => ({
  type: UserDataActionType.SETTING_USER_DATA,
  payload,
  meta,
});

export const UserDataSet = <
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: UserDataSuccess<UserCustom>,
  meta?: Meta
): UserDataSetAction<UserCustom, Meta> => ({
  type: UserDataActionType.USER_DATA_SET,
  payload,
  meta,
});

export const errorSettingUserData = <Meta extends ActionMeta>(
  payload: UserDataError,
  meta?: Meta
): ErrorSettingUserDataAction<Meta> => ({
  type: UserDataActionType.ERROR_SETTING_USER_DATA,
  payload,
  meta,
  error: true,
});

export const setUserData = <
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta = AnyMeta
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

          pubnub.api.objects.setUUIDMetadata(
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
