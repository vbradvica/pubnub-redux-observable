import {
  ChannelDataRemovedAction,
  RemovingChannelDataAction,
  ErrorRemovingChannelDataAction,
  RemoveChannelRequest,
  RemoveChannelError,
  RemoveChannelSuccess,
} from '../ChannelDataActions';
import { ChannelDataActionType } from '../ChannelDataActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicTypes';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { PayloadAction } from 'foundations/createAction';
import { Observable, of } from 'rxjs';

export const removingChannelData = <Meta extends ActionMeta>(
  payload: RemoveChannelRequest,
  meta?: Meta
): RemovingChannelDataAction<Meta> => ({
  type: ChannelDataActionType.REMOVING_CHANNEL_DATA,
  payload,
  meta,
});

export const channelDataRemoved = <Meta extends ActionMeta>(
  payload: RemoveChannelSuccess,
  meta?: Meta
): ChannelDataRemovedAction<Meta> => ({
  type: ChannelDataActionType.CHANNEL_DATA_REMOVED,
  payload,
  meta,
});

export const errorRemovingChannelData = <Meta extends ActionMeta>(
  payload: RemoveChannelError,
  meta?: Meta
): ErrorRemovingChannelDataAction<Meta> => ({
  type: ChannelDataActionType.ERROR_REMOVING_CHANNEL_DATA,
  payload,
  meta,
  error: true,
});

export const removeChannelData = <Meta extends ActionMeta = AnyMeta>(
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

          pubnub.api.objects.removeChannelMetadata(
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
