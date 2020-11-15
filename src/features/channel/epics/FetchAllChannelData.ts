import Pubnub from 'pubnub';
import { Epic, ofType } from 'redux-observable';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

import {
  ActionMeta,
  allChannelDataRetrieved,
  ChannelDataActionType,
  errorFetchingAllChannelData,
  fetchingAllChannelData,
} from 'pubnub-redux';

import { PayloadAction } from '../../../foundations/createAction';
import { PubnubEpicDependencies } from '../../../foundations/EpicDependency';

type FetchAllChannelDataRequest = Pubnub.GetAllMetadataParameters;

export const fetchAllChannelData = <Meta extends ActionMeta = {}>(
  request: FetchAllChannelDataRequest = {},
  meta: Meta
): PayloadAction<FetchAllChannelDataRequest, string, ActionMeta> => ({
  type: ChannelDataActionType.FETCH_ALL_CHANNEL_DATA_COMMAND,
  payload: request,
  meta,
});

export const fetchAllChannelDataEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(ChannelDataActionType.FETCH_ALL_CHANNEL_DATA_COMMAND),
    mergeMap(
      (action: PayloadAction<FetchAllChannelDataRequest, string, ActionMeta>) =>
        new Observable((observer) => {
          observer.next(fetchingAllChannelData(action.payload, action.meta));

          pubnub.api?.objects.getAllChannelMetadata(
            {
              ...action.payload,
            },
            (status, response) => {
              if (status.error) {
                observer.error(
                  errorFetchingAllChannelData(
                    {
                      request: action.payload,
                      status,
                    },
                    action.meta
                  )
                );
              } else {
                const finalized = allChannelDataRetrieved(
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
