import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { ActionMeta } from 'pubnub-redux';
import { Epic, ofType } from 'redux-observable';

import { PayloadAction } from 'foundations/createAction';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';

import {
  SubscribeToChannelRequest,
  SubscribingToChannelAction,
  ChannelSubscribedAction,
  ErrorSubscribingChannelAction,
  SubscribeToChannelError,
} from '../ChannelActions';
import { ChannelActionType } from '../ChannelActionType.enum';

export const subscribingChannel = <Meta extends ActionMeta = {}>(
  payload: SubscribeToChannelRequest,
  meta?: Meta
): SubscribingToChannelAction<Meta> => ({
  type: ChannelActionType.SUBSCRIBING_CHANNEL,
  payload,
  meta,
});

export const channelSubscribed = <Meta extends ActionMeta = {}>(
  payload: SubscribeToChannelRequest,
  meta?: Meta
): ChannelSubscribedAction<Meta> => ({
  type: ChannelActionType.CHANNEL_SUBSCRIBED,
  payload,
  meta,
});

export const errorSubscribingChannel = <Meta extends ActionMeta = {}>(
  payload: SubscribeToChannelError,
  meta?: Meta
): ErrorSubscribingChannelAction<Meta> => ({
  type: ChannelActionType.ERROR_SUBSCRIBING_CHANNEL,
  payload,
  meta,
});

export const subscribeToChannel = <Meta extends ActionMeta = {}>(
  request: SubscribeToChannelRequest,
  meta: Meta
): PayloadAction<SubscribeToChannelRequest, string, ActionMeta> => ({
  type: ChannelActionType.SUBSCRIBE_CHANNEL_COMMAND,
  payload: request,
  meta,
});

export const subscribeToChannelEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(ChannelActionType.SUBSCRIBE_CHANNEL_COMMAND),
    mergeMap(
      (action: PayloadAction<SubscribeToChannelRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(subscribingChannel(action.payload, action.meta));

          try {
            pubnub.api?.subscribe({
              ...action.payload,
            });
            observer.next(channelSubscribed(action.payload, action.meta));
            observer.complete();
          } catch (e) {
            observer.error(e);
          }
        }).pipe(
          map((action) => action),
          catchError((error) => of(error))
        )
    )
  );
