import { Subscriber } from 'rxjs';
import Pubnub from 'pubnub';

import { Presence, PresenceActionType, PresenceCategory } from 'pubnub-redux';

export interface PresenceEventMessage<
  ReceivedPresence extends Presence = Presence
> {
  action: string;
  channel: string;
  occupancy: number;
  state?: ReceivedPresence['state'];
  subscription?: string;
  timestamp: number;
  timetoken: string;
  uuid: string;
}

export interface JoinEventAction {
  type: typeof PresenceActionType.JOIN_EVENT;
  payload: PresenceEventMessage;
}

export interface LeaveEventAction {
  type: typeof PresenceActionType.LEAVE_EVENT;
  payload: PresenceEventMessage;
}

export interface TimeoutEventAction {
  type: typeof PresenceActionType.TIMEOUT_EVENT;
  payload: PresenceEventMessage;
}

export interface StateChangeEventAction {
  type: typeof PresenceActionType.STATE_CHANGE_EVENT;
  payload: PresenceEventMessage;
}

export type PresenceListenerActions =
  | JoinEventAction
  | LeaveEventAction
  | TimeoutEventAction
  | StateChangeEventAction;

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
