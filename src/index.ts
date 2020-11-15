// Commands
import {
  removeMemberships,
  removeMembershipsEpic,
} from './features/membership/epics/RemoveMemberships';
import {
  fetchMemberships,
  fetchMembershipsEpic,
} from './features/membership/epics/FetchMemberships';
import {
  setMemberships,
  setMembershipsEpic,
} from './features/membership/epics/SetMemberships';
import {
  fetchChannelMembers,
  fetchChannelMembersEpic,
} from './features/members/epics/FetchChannelMembers';
import {
  setChannelMembers,
  setChannelMembersEpic,
} from './features/members/epics/SetChannelMembers';
import {
  removeChannelMembers,
  removeChannelMembersEpic,
} from './features/members/epics/RemoveChannelMembers';
import {
  sendMessage,
  sendMessageEpic,
} from './features/message/epics/SendMessage';
import { sendSignal, sendSignalEpic } from './features/signal/epics/SendSignal';
import {
  fetchMessageHistory,
  fetchMessageHistoryEpic,
} from './features/message/epics/FetchMessageHistory';
import {
  removeChannelData,
  removeChannelDataEpic,
} from './features/channel/epics/RemoveChannelData';
import {
  fetchChannelData,
  fetchChannelDataEpic,
} from './features/channel/epics/FetchChannelData';
import {
  fetchAllChannelData,
  fetchAllChannelDataEpic,
} from './features/channel/epics/FetchAllChannelData';
import {
  setChannelData,
  setChannelDataEpic,
} from './features/channel/epics/SetChannelData';
import {} from './features/channel/ChannelActions';
import {
  subscribeToChannel,
  subscribingChannel,
  channelSubscribed,
  errorSubscribingChannel,
  subscribeToChannelEpic,
} from './features/channel/epics/SubscribeToChannel';
import { ChannelActionType } from './features/channel/ChannelActionType.enum';
import {
  removeUserData,
  removeUserDataEpic,
} from './features/user/epics/RemoveUserData';
import {
  fetchUserData,
  fetchUserDataEpic,
} from './features/user/epics/FetchUserData';
import {
  fetchAllUserData,
  fetchAllUserDataEpic,
} from './features/user/epics/FetchAllUserData';
import {
  setUserData,
  setUserDataEpic,
} from './features/user/epics/SetUserData';
import {
  fetchHereNow,
  fetchHereNowEpic,
} from './features/presence/epics/FetchHereNow';
import {
  fetchPresenceState,
  fetchPresenceStateEpic,
} from './features/presence/epics/FetchPresenceState';
import { combinedEpics } from './features';
// Listeners
import { createUserDataListener } from './features/user/UserDataListener';
import { createChannelDataListener } from './features/channel/ChannelDataListener';
import { createMembershipListener } from './features/membership/MembershipListener';
import { createPubNubListener } from './features/subscribe/createPubNubListener';
import { createMessageListener } from './features/message/MessageListener';
import { createPresenceListener } from './features/presence/PresenceListener';
import { createSignalListener } from './features/signal/SignalListener';
import { combineListeners } from './foundations/CombineListeners';
import { createErrorStatusListener } from './features/errorStatus/ErrorStatusListener';
import { createNetworkStatusListener } from './features/networkStatus/NetworkStatusListener';
import { createSubscriptionStatusListener } from './features/subscriptionStatus/SubscriptionStatusListener';
// LifeCycle
import { LifecycleActionType } from './foundations/LifecycleActionType.enum';
import {
  pubnubLifecycleEpic,
  setupPubnub,
} from './foundations/LifecycleActions';
import {
  createEpicDependency,
  PubnubEpicDependencies,
} from './foundations/EpicDependency';

import { MessageActionType } from 'pubnub-redux';
export interface MessageReceivedAction<MessageType> {
  type: typeof MessageActionType.MESSAGE_RECEIVED;
  payload: MessageType;
}

export {
  // Commands
  removingMemberships,
  membershipsRemoved,
  errorRemovingMemberships,
  fetchingMemberships,
  membershipsRetrieved,
  errorFetchingMemberships,
  settingMemberships,
  membershipsSet,
  errorSettingMemberships,
  fetchingChannelMembers,
  channelMembersRetrieved,
  errorFetchingChannelMembers,
  settingChannelMembers,
  channelMembersSet,
  errorSettingChannelMembers,
  removingChannelMembers,
  channelMembersRemoved,
  errorRemovingChannelMembers,
  sendingMessage,
  messageSent,
  errorSendingMessage,
  sendingSignal,
  signalSent,
  errorSendingSignal,
  fetchingMessageHistory,
  messageHistoryRetrieved,
  errorFetchingMessageHistory,
  fetchingHereNow,
  hereNowRetrieved,
  errorFetchingHereNow,
  fetchingPresenceState,
  presenceStateRetrieved,
  errorFetchingPresenceState,
  // Action Creators
  removingChannelData,
  channelDataRemoved,
  errorRemovingChannelData,
  fetchingChannelData,
  channelDataRetrieved,
  errorFetchingChannelData,
  fetchingAllChannelData,
  allChannelDataRetrieved,
  errorFetchingAllChannelData,
  settingChannelData,
  channelDataSet,
  errorSettingChannelData,
  removingUserData,
  UserDataRemoved,
  errorRemovingUserData,
  fetchingUserData,
  UserDataRetrieved,
  errorFetchingUserData,
  fetchingAllUserData,
  allUserDataRetrieved,
  errorFetchingAllUserData,
  settingUserData,
  UserDataSet,
  errorSettingUserData,
  createMessageReducer,
  createSignalReducer,
  createPresenceReducer,
  createNetworkStatusReducer,
  createUserDataReducer,
  createUsersListReducer,
  createChannelDataReducer,
  createChannelsListReducer,
  createMembershipReducer,
  createChannelMembersReducer,
  createChannelMembersCountReducer,
  networkIssues,
  accessDenied,
  malformedResponse,
  badRequest,
  decryptionError,
  timeoutConnection,
  requestMessageCountExceeded,
  unknown,
  networkUp,
  networkDown,
  connected,
  reconnected,
  ActionMeta,
  Channel,
  UserData,
  Message,
  MessageRequestOptions,
  Signal,
  SignalRequestOptions,
  Presence,
  PresenceStateRequest,
  HereNowRequest,
  ErrorStatusResponse,
  NetworkStatusResponse,
  SubscriptionStatusResponse,
  // Action Types
  SignalActionType,
  MessageActionType,
  PresenceActionType,
  UserDataActionType,
  ChannelDataActionType,
  MembershipActionType,
  ChannelMembersActionType,
  SubscriptionStatusActionType,
  NetworkStatusActionType,
  ErrorStatusActionType,
  // Enums
  PresenceCategory,
} from 'pubnub-redux';

export {
  // Lifecycle
  LifecycleActionType,
  pubnubLifecycleEpic,
  setupPubnub,
  // Actions
  subscribingChannel,
  channelSubscribed,
  errorSubscribingChannel,
  // Commands
  subscribeToChannel,
  removeMemberships,
  fetchMemberships,
  setMemberships,
  fetchChannelMembers,
  setChannelMembers,
  removeChannelMembers,
  sendMessage,
  sendSignal,
  fetchMessageHistory,
  fetchHereNow,
  fetchPresenceState,
  // Epics
  subscribeToChannelEpic,
  combinedEpics,
  removeMembershipsEpic,
  fetchMembershipsEpic,
  setMembershipsEpic,
  fetchChannelMembersEpic,
  setChannelMembersEpic,
  removeChannelMembersEpic,
  sendMessageEpic,
  sendSignalEpic,
  fetchMessageHistoryEpic,
  fetchHereNowEpic,
  fetchPresenceStateEpic,
  removeChannelDataEpic,
  fetchAllChannelDataEpic,
  fetchAllUserDataEpic,
  fetchChannelDataEpic,
  fetchUserDataEpic,
  removeUserDataEpic,
  setChannelDataEpic,
  setUserDataEpic,
  // Listeners
  createPubNubListener,
  createMembershipListener,
  createMessageListener,
  createPresenceListener,
  createSignalListener,
  createChannelDataListener,
  createNetworkStatusListener,
  createSubscriptionStatusListener,
  createErrorStatusListener,
  createUserDataListener,
  combineListeners,
  // Action Creators
  removeChannelData,
  fetchChannelData,
  fetchAllChannelData,
  setChannelData,
  removeUserData,
  fetchUserData,
  fetchAllUserData,
  setUserData,
  // Action Types
  ChannelActionType,
  // Epics
  createEpicDependency,
  PubnubEpicDependencies,
};
