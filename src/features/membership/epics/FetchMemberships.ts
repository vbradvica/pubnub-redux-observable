import {
  FetchingMembershipsAction,
  MembershipsRetrievedAction,
  FetchMembershipsSuccess,
  ErrorFetchingMembershipsAction,
  FetchMembershipsError,
  FetchMembershipsRequest,
} from '../MembershipActions';
import { MembershipActionType } from '../MembershipActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const fetchingMemberships = <Meta extends ActionMeta>(
  payload: FetchMembershipsRequest,
  meta?: Meta
): FetchingMembershipsAction<Meta> => ({
  type: MembershipActionType.FETCHING_MEMBERSHIPS,
  payload,
  meta,
});

export const membershipsRetrieved = <
  MembershipCustom extends ObjectsCustom,
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: FetchMembershipsSuccess<MembershipCustom, ChannelCustom>,
  meta?: Meta
): MembershipsRetrievedAction<MembershipCustom, ChannelCustom, Meta> => ({
  type: MembershipActionType.MEMBERSHIPS_RETRIEVED,
  payload,
  meta,
});

export const errorFetchingMemberships = <Meta extends ActionMeta>(
  payload: FetchMembershipsError,
  meta?: Meta
): ErrorFetchingMembershipsAction<Meta> => ({
  type: MembershipActionType.ERROR_FETCHING_MEMBERSHIPS,
  payload,
  meta,
  error: true,
});

export const fetchMemberships = <Meta extends ActionMeta = AnyMeta>(
  request: FetchMembershipsRequest,
  meta: Meta
): PayloadAction<FetchMembershipsRequest, string, ActionMeta> => ({
  type: MembershipActionType.FETCH_MEMBERSHIPS_COMMAND,
  payload: request,
  meta,
});

export const fetchMembershipsEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(MembershipActionType.FETCH_MEMBERSHIPS_COMMAND),
    mergeMap(
      (action: PayloadAction<FetchMembershipsRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(fetchingMemberships(action.payload, action.meta));

          pubnub.api?.objects.getMemberships(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorFetchingMemberships(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = membershipsRetrieved(
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
