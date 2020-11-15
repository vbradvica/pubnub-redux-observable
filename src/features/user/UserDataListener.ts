import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';

declare enum UserDataActionType {
  FETCH_ALL_USER_DATA_COMMAND = 'pubnub/FETCH_ALL_USER_DATA_COMMAND',
  FETCHING_ALL_USER_DATA = 'pubnub/FETCHING_ALL_USER_DATA',
  ALL_USER_DATA_RETRIEVED = 'pubnub/ALL_USER_DATA_RETRIEVED',
  ERROR_FETCHING_ALL_USER_DATA = 'pubnub/ERROR_FETCHING_ALL_USER_DATA',
  FETCH_USER_DATA_COMMAND = 'pubnub/FETCH_USER_DATA_COMMAND',
  FETCHING_USER_DATA = 'pubnub/FETCHING_USER_DATA',
  USER_DATA_RETRIEVED = 'pubnub/USER_DATA_RETRIEVED',
  ERROR_FETCHING_USER_DATA = 'pubnub/ERROR_FETCHING_USER_DATA',
  SET_USER_DATA_COMMAND = 'pubnub/SET_USER_DATA_COMMAND',
  SETTING_USER_DATA = 'pubnub/SETTING_USER_DATA',
  USER_DATA_SET = 'pubnub/USER_DATA_SET',
  ERROR_SETTING_USER_DATA = 'pubnub/ERROR_SETTING_USER_DATA',
  REMOVE_USER_DATA_COMMAND = 'pubnub/REMOVE_USER_DATA_COMMAND',
  REMOVING_USER_DATA = 'pubnub/REMOVING_USER_DATA',
  USER_DATA_REMOVED = 'pubnub/USER_DATA_REMOVED',
  ERROR_REMOVING_USER_DATA = 'pubnub/ERROR_REMOVING_USER_DATA',
  USER_DATA_SET_EVENT = 'pubnub/USER_DATA_SET_EVENT',
  USER_DATA_REMOVED_EVENT = 'pubnub/USER_DATA_REMOVED_EVENT',
}

export declare type UsersListenerPayload<
  UserCustom extends Pubnub.ObjectCustom
> = {
  message: UserDataEventMessage<UserCustom>;
};

export declare type SetUserDataEventMessage<
  UserCustom extends Pubnub.ObjectCustom
> = Pubnub.SetUUIDMetadataEvent<UserCustom>['message'];
export declare type RemoveUserDataEventMessage = Pubnub.RemoveUUIDMetadataEvent['message'];
export declare type UserDataEventMessage<
  UserCustom extends Pubnub.ObjectCustom
> = SetUserDataEventMessage<UserCustom> | RemoveUserDataEventMessage;

export interface UserDataSetEventAction<
  UserCustom extends Pubnub.ObjectCustom
> {
  type: typeof UserDataActionType.USER_DATA_SET_EVENT;
  payload: UserDataEventMessage<UserCustom>;
}
export interface UserDataRemovedEventAction<
  UserCustom extends Pubnub.ObjectCustom
> {
  type: typeof UserDataActionType.USER_DATA_REMOVED_EVENT;
  payload: UserDataEventMessage<UserCustom>;
}

export declare const UserDataSet: <UserCustom extends Pubnub.ObjectCustom>(
  payload: UserDataEventMessage<UserCustom>
) => UserDataSetEventAction<UserCustom>;
export declare const UserDataRemoved: <UserCustom extends Pubnub.ObjectCustom>(
  payload: UserDataEventMessage<UserCustom>
) => UserDataRemovedEventAction<UserCustom>;

export declare type UserDataListenerActions<
  UserCustom extends Pubnub.ObjectCustom
> = UserDataSetEventAction<UserCustom> | UserDataRemovedEventAction<UserCustom>;

export const createUserDataListener = <
  UserCustom extends Pubnub.ObjectCustom = Pubnub.ObjectCustom
>(
  observer: Subscriber<UserDataListenerActions<UserCustom>>
): Pubnub.ListenerParameters => ({
  objects: (payload) => {
    if (payload.message.type !== 'uuid') {
      return;
    }
    switch (payload.message.event) {
      case 'set':
        observer.next(
          UserDataSet<UserCustom>(
            ((payload as unknown) as UsersListenerPayload<UserCustom>).message
          )
        );
        break;
      case 'delete':
        observer.next(UserDataRemoved<UserCustom>(payload.message));
        break;
      default:
        break;
    }
  },
});
