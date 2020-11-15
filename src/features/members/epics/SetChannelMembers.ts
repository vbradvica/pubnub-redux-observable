import Pubnub from 'pubnub';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Epic, ofType } from 'redux-observable';

import {
  ActionMeta,
  ChannelMembersActionType,
  channelMembersSet,
  errorSettingChannelMembers,
  settingChannelMembers,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

type SetChannelMembersRequest<
  MembershipCustom extends Pubnub.ObjectCustom
> = Pubnub.SetChannelMembersParameters<MembershipCustom>;

export const setChannelMembers = <
  MembershipCustom extends Pubnub.ObjectCustom,
  Meta extends ActionMeta = {}
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
