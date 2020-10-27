import {
  SettingMembershipsAction,
  MembershipsSetAction,
  SetMembershipsSuccess,
  ErrorSettingMembershipsAction,
  SetMembershipsError,
  SetMembershipsRequest,
} from '../MembershipActions';
import { MembershipActionType } from '../MembershipActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const settingMemberships = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetMembershipsRequest<ChannelCustom>,
  meta?: Meta
): SettingMembershipsAction<ChannelCustom, Meta> => ({
  type: MembershipActionType.SETTING_MEMBERSHIPS,
  payload,
  meta,
});

export const membershipsSet = <
  MembershipCustom extends ObjectsCustom,
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetMembershipsSuccess<MembershipCustom, ChannelCustom>,
  meta?: Meta
): MembershipsSetAction<MembershipCustom, ChannelCustom, Meta> => ({
  type: MembershipActionType.MEMBERSHIPS_SET,
  payload,
  meta,
});

export const errorSettingMemberships = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetMembershipsError<ChannelCustom>,
  meta?: Meta
): ErrorSettingMembershipsAction<ChannelCustom, Meta> => ({
  type: MembershipActionType.ERROR_SETTING_MEMBERSHIPS,
  payload,
  meta,
  error: true,
});

export const setMemberships = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta = AnyMeta
>(
  request: SetMembershipsRequest<ChannelCustom>,
  meta: Meta
): PayloadAction<SetMembershipsRequest<ChannelCustom>, string, ActionMeta> => ({
  type: MembershipActionType.SET_MEMBERSHIPS_COMMAND,
  payload: request,
  meta,
});

export const setMembershipsEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(MembershipActionType.SET_MEMBERSHIPS_COMMAND),
    mergeMap(
      (action: PayloadAction<SetMembershipsRequest<any>, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(settingMemberships(action.payload, action.meta));

          pubnub.api?.objects.setMemberships(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorSettingMemberships(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = membershipsSet(
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
