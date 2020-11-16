import { Subscriber } from 'rxjs';
import {
  SubscriptionStatusActionType,
  SubscriptionStatusResponse,
} from 'pubnub-redux';
import { SubscriptionStatusCategory } from './SubscriptionStatusCategory.enum';

export interface ReconnectedAction {
  type: typeof SubscriptionStatusActionType.RECONNECTED_EVENT;
  payload: SubscriptionStatusResponse;
}
export interface ConnectedAction {
  type: typeof SubscriptionStatusActionType.CONNECTED_EVENT;
  payload: SubscriptionStatusResponse;
}

export declare const reconnected: (
  payload: SubscriptionStatusResponse
) => ReconnectedAction;
export declare const connected: (
  payload: SubscriptionStatusResponse
) => ConnectedAction;
export declare type SubscriptionStatusListenerActions =
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
