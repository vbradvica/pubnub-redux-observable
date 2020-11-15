import Pubnub from 'pubnub';
import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  ChannelDataActionType,
  channelDataSet,
  errorSettingChannelData,
  settingChannelData,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

type SetChannelDataRequest<
  ChannelCustom extends Pubnub.ObjectCustom
> = Pubnub.SetChannelMetadataParameters<ChannelCustom>;

export const setChannelData = <
  ChannelCustom extends Pubnub.ObjectCustom,
  Meta extends ActionMeta = {}
>(
  request: SetChannelDataRequest<ChannelCustom>,
  meta: Meta
): PayloadAction<SetChannelDataRequest<ChannelCustom>, string, ActionMeta> => ({
  type: ChannelDataActionType.SET_CHANNEL_DATA_COMMAND,
  payload: request,
  meta,
});

export const setChannelDataEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(ChannelDataActionType.SET_CHANNEL_DATA_COMMAND),
    mergeMap(
      (action: PayloadAction<SetChannelDataRequest<any>, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(settingChannelData(action.payload, action.meta));

          pubnub.api?.objects.setChannelMetadata(
            action.payload,
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorSettingChannelData(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                observer.next(
                  channelDataSet(
                    {
                      request: action.payload,
                      response,
                      status,
                    },
                    action.meta
                  )
                );
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
