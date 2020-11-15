import Pubnub from 'pubnub';
import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  errorSettingMemberships,
  MembershipActionType,
  membershipsSet,
  settingMemberships,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export interface SetMembershipsRequest<
  ChannelCustom extends Pubnub.ObjectCustom
> extends Pubnub.SetMembershipsParameters<ChannelCustom> {
  uuid: string;
}

export const setMemberships = <
  ChannelCustom extends Pubnub.ObjectCustom,
  Meta extends ActionMeta = {}
>(
  request: SetMembershipsRequest<ChannelCustom>,
  meta: Meta
): PayloadAction<SetMembershipsRequest<ChannelCustom>, string, ActionMeta> => ({
  type: MembershipActionType.SET_MEMBERSHIPS_COMMAND,
  payload: request,
  meta,
});

export const setMembershipsEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(MembershipActionType.SET_MEMBERSHIPS_COMMAND),
    mergeMap(
      (action: PayloadAction<SetMembershipsRequest<any>, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(settingMemberships(action.payload, action.meta));

          pubnub.api?.objects.setMemberships(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorSettingMemberships(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = membershipsSet(
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
