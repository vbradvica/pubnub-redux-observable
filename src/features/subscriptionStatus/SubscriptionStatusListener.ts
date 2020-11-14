import { Subscriber } from 'rxjs';
import { SubscriptionStatusResponse } from 'pubnub-redux';
import {
  connected,
  reconnected,
  SubscriptionStatusListenerActions,
} from 'pubnub-redux/dist/features/subscriptionStatus/SubscriptionStatusListener';
import { SubscriptionStatusCategory } from 'pubnub-redux/dist/features/subscriptionStatus/SubscriptionStatusCategory.enum';

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
