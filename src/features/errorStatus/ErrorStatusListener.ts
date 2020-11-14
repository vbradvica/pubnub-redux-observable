import { Subscriber } from 'rxjs';
import { ErrorStatusResponse } from 'pubnub-redux';
import {
  accessDenied,
  badRequest,
  decryptionError,
  ErrorStatusListenerActions,
  malformedResponse,
  requestMessageCountExceeded,
  unknown,
} from 'pubnub-redux/dist/features/errorStatus/ErrorStatusListener';
import { ErrorStatusCategory } from 'pubnub-redux/dist/features/errorStatus/ErrorStatusCategory.enum';

export const createErrorStatusListener = (
  observer: Subscriber<ErrorStatusListenerActions>
) => ({
  status: (payload: ErrorStatusResponse) => {
    switch (payload.category) {
      case ErrorStatusCategory.PN_ACCES_DENIED_CATEGORY:
        observer.next(accessDenied(payload));
        break;
      case ErrorStatusCategory.PN_MALFORMED_RESPONSE_CATEGORY:
        observer.next(malformedResponse(payload));
        break;
      case ErrorStatusCategory.PN_BAD_REQUEST_CATEGORY:
        observer.next(badRequest(payload));
        break;
      case ErrorStatusCategory.PN_DECRYPTION_ERROR_CATEGORY:
        observer.next(decryptionError(payload));
        break;
      case ErrorStatusCategory.PN_REQUEST_MESSAGE_COUNT_EXCEEDED_CATEGORY:
        observer.next(requestMessageCountExceeded(payload));
        break;
      case ErrorStatusCategory.PN_UNKNOWN_CATEGORY:
        observer.next(unknown(payload));
        break;
      default:
        break;
    }
  },
});
