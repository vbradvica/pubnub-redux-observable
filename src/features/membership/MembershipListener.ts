import { Subscriber } from 'rxjs';
import Pubnub from 'pubnub';

import { MembershipActionType } from 'pubnub-redux';
import {
  MembershipListenerActions,
  MembershipRemovedEventAction,
  MembershipSetEventAction,
  RemoveMembershipEventMessage,
  SetMembershipEventMessage,
} from 'pubnub-redux/dist/features/membership/MembershipActions';

const membershipSetEventRecieved = <
  MembershipCustom extends Pubnub.ObjectCustom
>(
  payload: SetMembershipEventMessage<MembershipCustom>
): MembershipSetEventAction<MembershipCustom> => ({
  type: MembershipActionType.MEMBERSHIP_SET_EVENT,
  payload,
});

const membershipRemovedEventRecieved = (
  payload: RemoveMembershipEventMessage
): MembershipRemovedEventAction => ({
  type: MembershipActionType.MEMBERSHIP_REMOVED_EVENT,
  payload,
});

export const createMembershipListener = <
  MembershipCustom extends Pubnub.ObjectCustom
>(
  observer: Subscriber<MembershipListenerActions<MembershipCustom>>
): Pubnub.ListenerParameters => ({
  objects: (payload) => {
    if (payload.message.type === 'membership') {
      switch (payload.message.event) {
        case 'set':
          observer.next(
            membershipSetEventRecieved<MembershipCustom>(
              (payload as Pubnub.SetMembershipEvent<MembershipCustom>).message
            )
          );
          break;
        case 'delete':
          observer.next(membershipRemovedEventRecieved(payload.message));
          break;
        default:
          break;
      }
    }
  },
});
