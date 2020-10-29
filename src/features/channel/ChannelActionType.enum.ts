export enum ChannelActionType {
  // subscribeChannel()
  SUBSCRIBE_CHANNEL_COMMAND = 'pubnub/SUBSCRIBE_CHANNEL_COMMAND',
  SUBSCRIBING_CHANNEL = 'pubnub/SUBSCRIBING_CHANNEL',
  CHANNEL_SUBSCRIBED = 'pubnub/CHANNEL_SUBSCRIBED',
  ERROR_SUBSCRIBING_CHANNEL = 'pubnub/ERROR_SUBSCRIBING_CHANNEL',
}
