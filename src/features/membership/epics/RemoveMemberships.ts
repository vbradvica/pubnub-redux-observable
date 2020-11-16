import {
  RemovingChannelsAction,
  MembershipsRemovedAction,
  SetMembershipsSuccess,
  ErrorRemovingMembershipsAction,
  SetMembershipsError,
  SetMembershipsRequest,
  RemoveMembershipsRequest,
} from '../MembershipActions';
import { MembershipActionType } from '../MembershipActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { ObjectCustom } from 'pubnub';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const removingMemberships = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetMembershipsRequest<ChannelCustom>,
  meta?: Meta
): RemovingChannelsAction<ChannelCustom, Meta> => ({
  type: MembershipActionType.REMOVING_MEMBERSHIPS,
  payload,
  meta,
});

export const membershipsRemoved = <
  MembershipCustom extends ObjectCustom,
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetMembershipsSuccess<MembershipCustom, ChannelCustom>,
  meta?: Meta
): MembershipsRemovedAction<MembershipCustom, ChannelCustom, Meta> => ({
  type: MembershipActionType.MEMBERSHIPS_REMOVED,
  payload,
  meta,
});

export const errorRemovingMemberships = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetMembershipsError<ChannelCustom>,
  meta?: Meta
): ErrorRemovingMembershipsAction<ChannelCustom, Meta> => ({
  type: MembershipActionType.ERROR_REMOVING_MEMBERSHIPS,
  payload,
  meta,
  error: true,
});

export const removeMemberships = <Meta extends ActionMeta = AnyMeta>(
  request: RemoveMembershipsRequest,
  meta: Meta
): PayloadAction<RemoveMembershipsRequest, string, ActionMeta> => ({
  type: MembershipActionType.REMOVE_MEMBERSHIPS_COMMAND,
  payload: request,
  meta,
});

export const removeMembershipsEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(MembershipActionType.REMOVE_MEMBERSHIPS_COMMAND),
    mergeMap(
      (action: PayloadAction<RemoveMembershipsRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(removingMemberships(action.payload, action.meta));

          pubnub.api?.objects.removeMemberships(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorRemovingMemberships(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = membershipsRemoved(
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
