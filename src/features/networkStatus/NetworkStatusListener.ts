import { Subscriber } from 'rxjs';

import {
  networkDown,
  NetworkStatusActionType,
  NetworkStatusResponse,
  networkUp,
} from 'pubnub-redux';
import { NetworkStatusCategory } from './NetworkStatusCategory.enum';

export interface NetworkUpEventAction {
  type: typeof NetworkStatusActionType.NETWORK_UP_EVENT;
}
export interface NetworkDownEventAction {
  type: typeof NetworkStatusActionType.NETWORK_DOWN_EVENT;
}

export type NetworkStatusListenerActions =
  | NetworkUpEventAction
  | NetworkDownEventAction;

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
