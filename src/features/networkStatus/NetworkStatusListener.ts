import { Subscriber } from 'rxjs';
import {
  NetworkUpEventAction,
  NetworkDownEventAction,
  NetworkStatusResponse,
} from './NetworkStatusActions';
import { NetworkStatusActionType } from './NetworkStatusActionType.enum';
import { NetworkStatusCategory } from './NetworkStatusCategory.enum';

export const networkUp = (): NetworkUpEventAction => ({
  type: NetworkStatusActionType.NETWORK_UP_EVENT,
});

export const networkDown = (): NetworkDownEventAction => ({
  type: NetworkStatusActionType.NETWORK_DOWN_EVENT,
});

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
