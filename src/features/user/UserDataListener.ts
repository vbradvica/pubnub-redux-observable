import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';
import { UserDataActionType } from './UserActionDataType.enum';

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
