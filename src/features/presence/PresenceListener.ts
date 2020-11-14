import { Subscriber } from 'rxjs';
import Pubnub from 'pubnub';

import { PresenceCategory } from 'pubnub-redux';
import { PresenceListenerActions } from 'pubnub-redux/dist/features/presence/PresenceActions';
import {
  userJoin,
  userLeave,
  userStateChange,
  userTimeout,
} from 'pubnub-redux/dist/features/presence/PresenceListener';

export const createPresenceListener = (
  observer: Subscriber<PresenceListenerActions>
): Pubnub.ListenerParameters => ({
  presence: (payload) => {
    switch (payload.action) {
      case PresenceCategory.JOIN:
        observer.next(userJoin(payload));
        break;
      case PresenceCategory.LEAVE:
        observer.next(userLeave(payload));
        break;
      case PresenceCategory.TIMEOUT:
        observer.next(userTimeout(payload));
        break;
      case PresenceCategory.STATE_CHANGE:
        observer.next(userStateChange(payload));
        break;
      default:
        break;
    }
  },
});
