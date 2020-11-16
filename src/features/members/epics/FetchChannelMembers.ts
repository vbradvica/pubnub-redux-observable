import {
  ChannelMembersRetrievedAction,
  ErrorFetchingChannelMembersAction,
  FetchingChannelMembersAction,
  FetchChannelMembersError,
  FetchChannelMembersSuccess,
  FetchChannelMembersRequest,
} from '../ChannelMembersActions';
import { ChannelMembersActionType } from '../ChannelMembersActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const fetchingChannelMembers = <Meta extends ActionMeta>(
  payload: FetchChannelMembersRequest,
  meta?: Meta
): FetchingChannelMembersAction<Meta> => ({
  type: ChannelMembersActionType.FETCHING_CHANNEL_MEMBERS,
  payload,
  meta,
});

export const channelMembersRetrieved = <
  MembershipCustom extends ObjectsCustom,
  UserCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: FetchChannelMembersSuccess<MembershipCustom, UserCustom>,
  meta?: Meta
): ChannelMembersRetrievedAction<MembershipCustom, UserCustom, Meta> => ({
  type: ChannelMembersActionType.CHANNEL_MEMBERS_RETRIEVED,
  payload,
  meta,
});

export const errorFetchingChannelMembers = <Meta extends ActionMeta>(
  payload: FetchChannelMembersError,
  meta?: Meta
): ErrorFetchingChannelMembersAction<Meta> => ({
  type: ChannelMembersActionType.ERROR_FETCHING_CHANNEL_MEMBERS,
  payload,
  meta,
  error: true,
});

export const fetchChannelMembers = <Meta extends ActionMeta = AnyMeta>(
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
