import {
  SettingChannelDataAction,
  ChannelDataSetAction,
  ErrorSettingChannelDataAction,
  SetChannelDataError,
  SetChannelDataSuccess,
  SetChannelDataRequest,
} from '../ChannelDataActions';
import { ChannelDataActionType } from '../ChannelDataActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const settingChannelData = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetChannelDataRequest<ChannelCustom>,
  meta?: Meta
): SettingChannelDataAction<ChannelCustom, Meta> => ({
  type: ChannelDataActionType.SETTING_CHANNEL_DATA,
  payload,
  meta,
});

export const channelDataSet = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetChannelDataSuccess<ChannelCustom>,
  meta?: Meta
): ChannelDataSetAction<ChannelCustom, Meta> => ({
  type: ChannelDataActionType.CHANNEL_DATA_SET,
  payload,
  meta,
});

export const errorSettingChannelData = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: SetChannelDataError<ChannelCustom>,
  meta?: Meta
): ErrorSettingChannelDataAction<ChannelCustom, Meta> => ({
  type: ChannelDataActionType.ERROR_SETTING_CHANNEL_DATA,
  payload,
  meta,
  error: true,
});

export const setChannelData = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta = AnyMeta
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
