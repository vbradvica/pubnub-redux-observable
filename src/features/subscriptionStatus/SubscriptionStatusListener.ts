import { Subscriber } from 'rxjs';
import {
  ReconnectedAction,
  ConnectedAction,
  SubscriptionStatusResponse,
} from './SubscribeStatusActions';
import { SubscriptionStatusActionType } from './SubscriptionStatusActionType.enum';
import { SubscriptionStatusCategory } from './SubscriptionStatusCategory.enum';

export const reconnected = (
  payload: SubscriptionStatusResponse
): ReconnectedAction => ({
  type: SubscriptionStatusActionType.RECONNECTED_EVENT,
  payload,
});

export const connected = (
  payload: SubscriptionStatusResponse
): ConnectedAction => ({
  type: SubscriptionStatusActionType.CONNECTED_EVENT,
  payload,
});

export type SubscriptionStatusListenerActions =
  | ReconnectedAction
  | ConnectedAction;

export const createSubscriptionStatusListener = (
  observer: Subscriber<SubscriptionStatusListenerActions>
) => ({
  status: (payload: SubscriptionStatusResponse) => {
    switch (payload.category) {
      case SubscriptionStatusCategory.PN_CONNECTED_CATEGORY:
        observer.next(connected(payload));
        break;
      case SubscriptionStatusCategory.PN_RECONNECTED_CATEGORY:
        observer.next(reconnected(payload));
        break;
      default:
        break;
    }
  },
});
