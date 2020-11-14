import { Subscriber } from 'rxjs';

import { NetworkStatusResponse } from 'pubnub-redux';
import {
  NetworkStatusListenerActions,
  networkUp,
  networkDown,
} from 'pubnub-redux/dist/features/networkStatus/NetworkStatusListener';
import { NetworkStatusCategory } from 'pubnub-redux/dist/features/networkStatus/NetworkStatusCategory.enum';

export const createNetworkStatusListener = (
  observer: Subscriber<NetworkStatusListenerActions>
) => ({
  status: (payload: NetworkStatusResponse) => {
    switch (payload.category) {
      case NetworkStatusCategory.PN_NETWORK_UP_CATEGORY:
        observer.next(networkUp());
        break;
      case NetworkStatusCategory.PN_NETWORK_DOWN_CATEGORY:
        observer.next(networkDown());
        break;
      case NetworkStatusCategory.PN_RECONNECTED_CATEGORY:
        observer.next(networkUp());
        break;
      case NetworkStatusCategory.PN_CONNECTED_CATEGORY:
        observer.next(networkUp());
        break;
      case NetworkStatusCategory.PN_TIMEOUT_CATEGORY:
        observer.next(networkDown());
        break;
      default:
        break;
    }
  },
});
