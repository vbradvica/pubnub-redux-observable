import {
  RemovingChannelMembersAction,
  ChannelMembersRemovedAction,
  ErrorRemovingChannelMembersAction,
  SetChannelMembersError,
  SetChannelMembersSuccess,
  RemoveChannelMembersRequest,
} from '../ChannelMembersActions';
import { ChannelMembersActionType } from '../ChannelMembersActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const removingChannelMembers = <Meta extends ActionMeta>(
  payload: RemoveChannelMembersRequest,
  meta?: Meta
): RemovingChannelMembersAction<Meta> => ({
  type: ChannelMembersActionType.REMOVING_CHANNEL_MEMBERS,
  payload,
  meta,
});

export const channelMembersRemoved = <
  MembershipCustom extends ObjectsCustom,
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetChannelMembersSuccess<MembershipCustom, UserCustom>,
  meta?: Meta
): ChannelMembersRemovedAction<MembershipCustom, UserCustom, Meta> => ({
  type: ChannelMembersActionType.CHANNEL_MEMBERS_REMOVED,
  payload,
  meta,
});

export const errorRemovingChannelMembers = <
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetChannelMembersError<UserCustom>,
  meta?: Meta
): ErrorRemovingChannelMembersAction<UserCustom, Meta> => ({
  type: ChannelMembersActionType.ERROR_REMOVING_CHANNEL_MEMBERS,
  payload,
  meta,
  error: true,
});

export const removeChannelMembers = <Meta extends ActionMeta = AnyMeta>(
  request: RemoveChannelMembersRequest,
  meta: Meta
): PayloadAction<RemoveChannelMembersRequest, string, ActionMeta> => ({
  type: ChannelMembersActionType.REMOVE_CHANNEL_MEMBERS_COMMAND,
  payload: request,
  meta,
});

export const removeChannelMembersEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(ChannelMembersActionType.REMOVE_CHANNEL_MEMBERS_COMMAND),
    mergeMap(
      (
        action: PayloadAction<RemoveChannelMembersRequest, string, ActionMeta>
      ) =>
        new Observable((observer) => {
          observer.next(removingChannelMembers(action.payload, action.meta));

          pubnub.api?.objects.removeChannelMembers(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorRemovingChannelMembers(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = channelMembersRemoved(
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
