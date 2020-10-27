import { Subscriber } from 'rxjs';
import Pubnub from 'pubnub';
import {
  PresenceListenerActions,
  JoinEventAction,
  LeaveEventAction,
  TimeoutEventAction,
  StateChangeEventAction,
  PresenceEventMessage,
} from './PresenceActions';
import { PresenceActionType } from './PresenceActionType.enum';
import { PresenceCategory } from './PresenceCategory.enum';

export const userJoin = (payload: PresenceEventMessage): JoinEventAction => ({
  type: PresenceActionType.JOIN_EVENT,
  payload,
});

export const userLeave = (payload: PresenceEventMessage): LeaveEventAction => ({
  type: PresenceActionType.LEAVE_EVENT,
  payload,
});

export const userTimeout = (
  payload: PresenceEventMessage
): TimeoutEventAction => ({
  type: PresenceActionType.TIMEOUT_EVENT,
  payload,
});

export const userStateChange = (
  payload: PresenceEventMessage
): StateChangeEventAction => ({
  type: PresenceActionType.STATE_CHANGE_EVENT,
  payload,
});

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
