import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';

import { Channel, ChannelDataActionType } from 'pubnub-redux';
import { GetChannelCustom } from 'foundations/ObjectsCustom';

export type SetChannelDataEventMessage<
  ChannelCustom extends Pubnub.ObjectCustom
> = Pubnub.SetChannelMetadataEvent<ChannelCustom>['message'];
export type RemoveChannelDataEventMessage = Pubnub.RemoveChannelMetadataEvent['message'];

export type ChannelDataEventMessage<
  ChannelCustom extends Pubnub.ObjectCustom
> = SetChannelDataEventMessage<ChannelCustom> | RemoveChannelDataEventMessage;

export interface ChannelDataSetEventAction<
  ChannelCustom extends Pubnub.ObjectCustom
> {
  type: typeof ChannelDataActionType.CHANNEL_DATA_SET_EVENT;
  payload: ChannelDataEventMessage<ChannelCustom>;
}

export interface ChannelDataRemovedEventAction<
  ChannelCustom extends Pubnub.ObjectCustom
> {
  type: typeof ChannelDataActionType.CHANNEL_DATA_REMOVED_EVENT;
  payload: ChannelDataEventMessage<ChannelCustom>;
}

export const channelDataSet = <ChannelCustom extends Pubnub.ObjectCustom>(
  payload: ChannelDataEventMessage<ChannelCustom>
): ChannelDataSetEventAction<ChannelCustom> => ({
  type: ChannelDataActionType.CHANNEL_DATA_SET_EVENT,
  payload,
});

export const channelDataRemoved = <ChannelCustom extends Pubnub.ObjectCustom>(
  payload: ChannelDataEventMessage<ChannelCustom>
): ChannelDataRemovedEventAction<ChannelCustom> => ({
  type: ChannelDataActionType.CHANNEL_DATA_REMOVED_EVENT,
  payload,
});

export type ChannelDataListenerActions<
  ChannelCustom extends Pubnub.ObjectCustom
> =
  | ChannelDataSetEventAction<ChannelCustom>
  | ChannelDataRemovedEventAction<ChannelCustom>;

export const createChannelDataListener = <ChannelType extends Channel>(
  observer: Subscriber<
    ChannelDataListenerActions<GetChannelCustom<ChannelType>>
  >
) => ({
  objects: (
    payload: Pubnub.ObjectsEvent<
      Pubnub.ObjectCustom,
      GetChannelCustom<ChannelType>,
      Pubnub.ObjectCustom
    >
  ) => {
    if (payload.message.type !== 'channel') {
      return;
    }
    switch (payload.message.event) {
      case 'set':
        observer.next(
          channelDataSet<GetChannelCustom<ChannelType>>(payload.message)
        );
        break;
      case 'delete':
        observer.next(
          channelDataRemoved<GetChannelCustom<ChannelType>>(payload.message)
        );
        break;
      default:
        break;
    }
  },
});
