import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  ChannelMembersActionType,
  channelMembersRemoved,
  errorRemovingChannelMembers,
  removingChannelMembers,
} from 'pubnub-redux';
import { RemoveChannelMembersRequest } from 'pubnub-redux/dist/features/members/ChannelMembersActions';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export const removeChannelMembers = <Meta extends ActionMeta = {}>(
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
