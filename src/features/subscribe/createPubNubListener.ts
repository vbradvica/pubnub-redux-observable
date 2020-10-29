import { Subscriber } from 'rxjs';
import { createMessageListener } from '../message/MessageListener';
import { createPresenceListener } from '../presence/PresenceListener';
import { createSignalListener } from '../signal/SignalListener';
import { createErrorStatusListener } from '../errorStatus/ErrorStatusListener';
import { createNetworkStatusListener } from '../networkStatus/NetworkStatusListener';
import { createSubscriptionStatusListener } from '../subscriptionStatus/SubscriptionStatusListener';
import { createMembershipListener } from '../membership/MembershipListener';
import { createChannelDataListener } from '../channel/ChannelDataListener';
import { createUserDataListener } from '../user/UserDataListener';
import { combineListeners } from '../../foundations/CombineListeners';

export const createPubNubListener = (observer: Subscriber<any>) =>
  combineListeners(
    createMessageListener(observer),
    createPresenceListener(observer),
    createSignalListener(observer),
    createErrorStatusListener(observer),
    createNetworkStatusListener(observer),
    createSubscriptionStatusListener(observer),
    createUserDataListener(observer),
    createChannelDataListener(observer),
    createMembershipListener(observer)
  );
