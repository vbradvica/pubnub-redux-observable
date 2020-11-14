import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';

import {
  Channel,
  ChannelDataListenerActions,
} from 'pubnub-redux/dist/features/channel/ChannelDataActions';
import { GetChannelCustom } from 'pubnub-redux/dist/foundations/ObjectsCustom';
import {
  channelDataRemoved,
  channelDataSet,
} from 'pubnub-redux/dist/features/channel/ChannelDataListener';

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
