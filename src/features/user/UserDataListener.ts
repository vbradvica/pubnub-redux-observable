import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';
import {
  UserDataSetEventAction,
  UserDataRemovedEventAction,
  UserDataListenerActions,
  UserDataEventMessage,
  UsersListenerPayload,
} from './UserDataActions';
import { UserDataActionType } from './UserDataActionType.enum';
import { ObjectsCustom } from 'foundations/ObjectsCustom';

export const UserDataSet = <UserCustom extends ObjectsCustom>(
  payload: UserDataEventMessage<UserCustom>
): UserDataSetEventAction<UserCustom> => ({
  type: UserDataActionType.USER_DATA_SET_EVENT,
  payload,
});

export const UserDataRemoved = <UserCustom extends ObjectsCustom>(
  payload: UserDataEventMessage<UserCustom>
): UserDataRemovedEventAction<UserCustom> => ({
  type: UserDataActionType.USER_DATA_REMOVED_EVENT,
  payload,
});

export const createUserDataListener = <
  UserCustom extends ObjectsCustom = ObjectsCustom
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
