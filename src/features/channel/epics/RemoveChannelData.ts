import Pubnub from 'pubnub';
import { Epic, ofType } from 'redux-observable';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ActionMeta,
  ChannelDataActionType,
  channelDataRemoved,
  errorRemovingChannelData,
  removingChannelData,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export declare type RemoveChannelRequest = Pubnub.RemoveChannelMetadataParameters;

export const removeChannelData = <Meta extends ActionMeta = {}>(
  request: RemoveChannelRequest,
  meta?: Meta
) => ({
  type: ChannelDataActionType.REMOVE_CHANNEL_DATA_COMMAND,
  payload: request,
  meta,
});

export const removeChannelDataEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(ChannelDataActionType.REMOVE_CHANNEL_DATA_COMMAND),
    mergeMap(
      (action: PayloadAction<RemoveChannelRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(removingChannelData(action.payload, action.meta));

          pubnub.api?.objects.removeChannelMetadata(
            { channel: action.payload.channel },
            (status) => {
              if (status.error) {
                observer.error(
                  errorRemovingChannelData(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                observer.next(
                  channelDataRemoved(
                    {
                      request: action.payload,
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
