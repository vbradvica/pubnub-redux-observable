import Pubnub from 'pubnub';
import { Subscriber } from 'rxjs';
import {} from 'pubnub-redux';
import {
  UserDataListenerActions,
  UsersListenerPayload,
} from 'pubnub-redux/dist/features/user/UserDataActions';
import {
  UserDataRemoved,
  UserDataSet,
} from 'pubnub-redux/dist/features/user/UserDataListener';

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
