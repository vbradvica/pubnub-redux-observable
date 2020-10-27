import { Subscriber } from 'rxjs';
import { ErrorStatusCategory } from './ErrorStatusCategory.enum';
import { ErrorStatusActionType } from './ErrorStatusActionType.enum';
import {
  NetworkIssuesEventAction,
  AccessDeniedEventAction,
  MalformedResponseEventAction,
  BadRequestEventAction,
  DecryptionErrorEventAction,
  TimeoutConnectionEventAction,
  RequestMessageCountExceedEventAction,
  UnknownEventAction,
  ErrorStatusResponse,
} from './ErrorStatusActions';

export const networkIssues = (
  payload: ErrorStatusResponse
): NetworkIssuesEventAction => ({
  type: ErrorStatusActionType.NETWORK_ISSUES_EVENT,
  payload,
});

export const accessDenied = (
  payload: ErrorStatusResponse
): AccessDeniedEventAction => ({
  type: ErrorStatusActionType.ACCESS_DENIED_EVENT,
  payload,
});

export const malformedResponse = (
  payload: ErrorStatusResponse
): MalformedResponseEventAction => ({
  type: ErrorStatusActionType.MALFORMED_RESPONSE_EVENT,
  payload,
});

export const badRequest = (
  payload: ErrorStatusResponse
): BadRequestEventAction => ({
  type: ErrorStatusActionType.BAD_REQUEST_EVENT,
  payload,
});

export const decryptionError = (
  payload: ErrorStatusResponse
): DecryptionErrorEventAction => ({
  type: ErrorStatusActionType.DECRYPTION_ERROR_EVENT,
  payload,
});

export const timeoutConnection = (
  payload: ErrorStatusResponse
): TimeoutConnectionEventAction => ({
  type: ErrorStatusActionType.TIMEOUT_CONNECTION_EVENT,
  payload,
});

export const requestMessageCountExceeded = (
  payload: ErrorStatusResponse
): RequestMessageCountExceedEventAction => ({
  type: ErrorStatusActionType.REQUEST_MESSAGE_COUNT_EXCEED_EVENT,
  payload,
});

export const unknown = (payload: ErrorStatusResponse): UnknownEventAction => ({
  type: ErrorStatusActionType.UNKNOWN_EVENT,
  payload,
});

export type ErrorStatusListenerActions =
  | NetworkIssuesEventAction
  | AccessDeniedEventAction
  | MalformedResponseEventAction
  | BadRequestEventAction
  | RequestMessageCountExceedEventAction
  | DecryptionErrorEventAction
  | TimeoutConnectionEventAction
  | UnknownEventAction;

export const createErrorStatusListener = (
  observer: Subscriber<ErrorStatusListenerActions>
) => ({
  status: (payload: ErrorStatusResponse) => {
    switch (payload.category) {
      case ErrorStatusCategory.PN_ACCESS_DENIED_CATEGORY:
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
