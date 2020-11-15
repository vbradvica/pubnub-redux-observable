import { Subscriber } from 'rxjs';
import Pubnub from 'pubnub';

import { MembershipActionType } from 'pubnub-redux';

export interface MembershipRemovedEventAction {
  type: typeof MembershipActionType.MEMBERSHIP_REMOVED_EVENT;
  payload: RemoveMembershipEventMessage;
}
type RemoveMembershipEventMessage = Pubnub.RemoveMembershipEvent['message'];
type SetMembershipEventMessage<
  MembershipCustom extends Pubnub.ObjectCustom
> = Pubnub.SetMembershipEvent<MembershipCustom>['message'];
export interface MembershipSetEventAction<
  MembershipCustom extends Pubnub.ObjectCustom
> {
  type: typeof MembershipActionType.MEMBERSHIP_SET_EVENT;
  payload: SetMembershipEventMessage<MembershipCustom>;
}

export declare type MembershipListenerActions<
  MembershipCustom extends Pubnub.ObjectCustom
> =
  | MembershipSetEventAction<MembershipCustom>
  | MembershipRemovedEventAction
  | MembershipSetEventAction<MembershipCustom>;

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
