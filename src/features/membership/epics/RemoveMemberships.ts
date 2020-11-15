import Pubnub from 'pubnub';
import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  errorRemovingMemberships,
  MembershipActionType,
  membershipsRemoved,
  removingMemberships,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export interface RemoveMembershipsRequest
  extends Pubnub.RemoveMembershipsParameters {
  uuid: string;
}

export const removeMemberships = <Meta extends ActionMeta = {}>(
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
