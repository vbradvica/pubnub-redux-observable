import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  ChannelMembersActionType,
  channelMembersRetrieved,
  errorFetchingChannelMembers,
  fetchingChannelMembers,
} from 'pubnub-redux';
import { FetchChannelMembersRequest } from 'pubnub-redux/dist/features/members/ChannelMembersActions';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export const fetchChannelMembers = <Meta extends ActionMeta = {}>(
  request: FetchChannelMembersRequest,
  meta: Meta
): PayloadAction<FetchChannelMembersRequest, string, ActionMeta> => ({
  type: ChannelMembersActionType.FETCH_CHANNEL_MEMBERS_COMMAND,
  payload: request,
  meta,
});

export const fetchChannelMembersEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(ChannelMembersActionType.FETCH_CHANNEL_MEMBERS_COMMAND),
    mergeMap(
      (action: PayloadAction<FetchChannelMembersRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(fetchingChannelMembers(action.payload, action.meta));

          pubnub.api?.objects.getChannelMembers(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorFetchingChannelMembers(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = channelMembersRetrieved(
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
