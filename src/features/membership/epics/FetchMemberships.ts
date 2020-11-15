import Pubnub from 'pubnub';
import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  errorFetchingMemberships,
  fetchingMemberships,
  MembershipActionType,
  membershipsRetrieved,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export interface FetchMembershipsRequest
  extends Pubnub.GetMembershipsParametersv2 {
  uuid: string;
}

export const fetchMemberships = <Meta extends ActionMeta = {}>(
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
