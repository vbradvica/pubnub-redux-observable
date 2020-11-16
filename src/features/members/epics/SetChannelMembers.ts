import {
  SettingChannelMembersAction,
  ChannelMembersSetAction,
  ErrorSettingChannelMembersAction,
  SetChannelMembersError,
  SetChannelMembersSuccess,
  SetChannelMembersRequest,
} from '../ChannelMembersActions';
import { ChannelMembersActionType } from '../ChannelMembersActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';

export const settingChannelMembers = <
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetChannelMembersRequest<UserCustom>,
  meta?: Meta
): SettingChannelMembersAction<UserCustom, Meta> => ({
  type: ChannelMembersActionType.SETTING_CHANNEL_MEMBERS,
  payload,
  meta,
});

export const channelMembersSet = <
  MembershipCustom extends ObjectsCustom,
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetChannelMembersSuccess<MembershipCustom, UserCustom>,
  meta?: Meta
): ChannelMembersSetAction<MembershipCustom, UserCustom, Meta> => ({
  type: ChannelMembersActionType.CHANNEL_MEMBERS_SET,
  payload,
  meta,
});

export const errorSettingChannelMembers = <
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetChannelMembersError<UserCustom>,
  meta?: Meta
): ErrorSettingChannelMembersAction<UserCustom, Meta> => ({
  type: ChannelMembersActionType.ERROR_SETTING_CHANNEL_MEMBERS,
  payload,
  meta,
  error: true,
});

export const setChannelMembers = <
  MembershipCustom extends ObjectsCustom,
  Meta extends ActionMeta = AnyMeta
>(
  request: SetChannelMembersRequest<MembershipCustom>,
  meta: Meta
): PayloadAction<
  SetChannelMembersRequest<MembershipCustom>,
  string,
  ActionMeta
> => ({
  type: ChannelMembersActionType.SET_CHANNEL_MEMBERS_COMMAND,
  payload: request,
  meta,
});

export const setChannelMembersEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(ChannelMembersActionType.SET_CHANNEL_MEMBERS_COMMAND),
    mergeMap(
      (
        action: PayloadAction<SetChannelMembersRequest<any>, string, ActionMeta>
      ) =>
        new Observable((observer) => {
          observer.next(settingChannelMembers(action.payload, action.meta));

          pubnub.api?.objects.setChannelMembers(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorSettingChannelMembers(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = channelMembersSet(
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
