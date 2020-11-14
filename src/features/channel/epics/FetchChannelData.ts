import { Epic, ofType } from 'redux-observable';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

import {
  ActionMeta,
  ChannelDataActionType,
  channelDataRetrieved,
  errorFetchingChannelData,
  fetchingChannelData,
} from 'pubnub-redux';
import { FetchChannelDataRequest } from 'pubnub-redux/dist/features/channel/ChannelDataActions';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

export const fetchChannelData = <Meta extends ActionMeta = {}>(
  request: FetchChannelDataRequest,
  meta: Meta
): PayloadAction<FetchChannelDataRequest, string, ActionMeta> => ({
  type: ChannelDataActionType.FETCH_CHANNEL_DATA_COMMAND,
  payload: request,
  meta,
});

export const fetchChannelDataEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(ChannelDataActionType.FETCH_CHANNEL_DATA_COMMAND),
    mergeMap(
      (action: PayloadAction<FetchChannelDataRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(fetchingChannelData(action.payload, action.meta));

          pubnub.api?.objects.getChannelMetadata(
            action.payload,
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorFetchingChannelData(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = channelDataRetrieved(
                  {
                    request: action.payload,
                    response,
                    status,
                  },
                  action.meta
                );

                observer.next(finalized);
                observer.complete();
              }
            }
          );
        }).pipe(
          map((action) => action),
          catchError((error) => of(error))
        )
    )
  );
