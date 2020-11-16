import Pubnub from 'pubnub';
import { ChannelActionType } from './ChannelActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { PayloadAction } from 'foundations/createAction';

export type SubscribeToChannelRequest = Pubnub.SubscribeParameters;

export interface SubscribeToChannel {
  request: SubscribeToChannelRequest;
  status: Pubnub.PubnubStatus;
}

export interface SubscribeToChannelSuccess {
  request: SubscribeToChannelRequest;
  status: Pubnub.PubnubStatus;
}

export interface SubscribeToChannelError {
  request: SubscribeToChannelRequest;
  status: Pubnub.PubnubStatus;
}

export interface SubscribingToChannelAction<MetaType> {
  type: typeof ChannelActionType.SUBSCRIBING_CHANNEL;
  payload: SubscribeToChannelRequest;
  meta?: MetaType;
}

export interface ChannelSubscribedAction<MetaType> {
  type: typeof ChannelActionType.CHANNEL_SUBSCRIBED;
  payload: SubscribeToChannelRequest;
  meta?: MetaType;
}

export interface ErrorSubscribingChannelAction<MetaType> {
  type: typeof ChannelActionType.ERROR_SUBSCRIBING_CHANNEL;
  payload: SubscribeToChannelError;
  meta?: MetaType;
}

export const sendSignal = <Meta extends ActionMeta = AnyMeta>(
  request: SubscribeToChannelRequest,
  meta: Meta
): PayloadAction<SubscribeToChannelRequest, string, ActionMeta> => ({
  type: ChannelActionType.SUBSCRIBE_CHANNEL_COMMAND,
  payload: request,
  meta,
});

export type ChannelActions<MetaType> =
  | SubscribingToChannelAction<MetaType>
  | ChannelSubscribedAction<MetaType>
  | ErrorSubscribingChannelAction<MetaType>;
