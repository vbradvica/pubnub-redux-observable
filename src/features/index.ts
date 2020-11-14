import { combineEpics } from 'redux-observable';

import { removeMembershipsEpic } from './membership/epics/RemoveMemberships';
import { fetchMembershipsEpic } from './membership/epics/FetchMemberships';
import { setMembershipsEpic } from './membership/epics/SetMemberships';
import { fetchChannelMembersEpic } from './members/epics/FetchChannelMembers';
import { setChannelMembersEpic } from './members/epics/SetChannelMembers';
import { removeChannelMembersEpic } from './members/epics/RemoveChannelMembers';
import { sendMessageEpic } from './message/epics/SendMessage';
import { sendSignalEpic } from './signal/epics/SendSignal';
import { fetchMessageHistoryEpic } from './message/epics/FetchMessageHistory';
import { removeChannelDataEpic } from './channel/epics/RemoveChannelData';
import { fetchChannelDataEpic } from './channel/epics/FetchChannelData';
import { fetchAllChannelDataEpic } from './channel/epics/FetchAllChannelData';
import { setChannelDataEpic } from './channel/epics/SetChannelData';
import { removeUserDataEpic } from './user/epics/RemoveUserData';
import { fetchUserDataEpic } from './user/epics/FetchUserData';
import { fetchAllUserDataEpic } from './user/epics/FetchAllUserData';
import { setUserDataEpic } from './user/epics/SetUserData';
import { fetchHereNowEpic } from './presence/epics/FetchHereNow';
import { fetchPresenceStateEpic } from './presence/epics/FetchPresenceState';

export const combinedEpics = combineEpics(
  removeMembershipsEpic,
  fetchMembershipsEpic,
  setMembershipsEpic,
  fetchChannelMembersEpic,
  setChannelMembersEpic,
  removeChannelMembersEpic,
  sendMessageEpic,
  sendSignalEpic,
  fetchMessageHistoryEpic,
  removeChannelDataEpic,
  fetchChannelDataEpic,
  fetchAllChannelDataEpic,
  setChannelDataEpic,
  removeUserDataEpic,
  fetchUserDataEpic,
  fetchAllUserDataEpic,
  setUserDataEpic,
  fetchHereNowEpic,
  fetchPresenceStateEpic
);
