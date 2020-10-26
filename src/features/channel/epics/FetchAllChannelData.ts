import {
  ErrorFetchingAllChannelDataAction,
  AllChannelDataRetrievedAction,
  FetchingAllChannelDataAction,
  FetchAllChannelDataError,
  FetchAllChannelDataSuccess,
  FetchAllChannelDataRequest,
} from '../ChannelDataActions';
import { ChannelDataActionType } from '../ChannelDataActionType.enum';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicTypes';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

export const fetchingAllChannelData = <Meta extends ActionMeta>(
  payload: FetchAllChannelDataRequest,
  meta?: Meta
): FetchingAllChannelDataAction<Meta> => ({
  type: ChannelDataActionType.FETCHING_ALL_CHANNEL_DATA,
  payload,
  meta,
});

export const allChannelDataRetrieved = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: FetchAllChannelDataSuccess<ChannelCustom>,
  meta?: Meta
): AllChannelDataRetrievedAction<ChannelCustom, Meta> => ({
  type: ChannelDataActionType.ALL_CHANNEL_DATA_RETRIEVED,
  payload,
  meta,
});

export const errorFetchingAllChannelData = <Meta extends ActionMeta>(
  payload: FetchAllChannelDataError,
  meta?: Meta
): ErrorFetchingAllChannelDataAction<Meta> => ({
  type: ChannelDataActionType.ERROR_FETCHING_ALL_CHANNEL_DATA,
  payload,
  meta,
  error: true,
});

export const fetchAllChannelData = <Meta extends ActionMeta = AnyMeta>(
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

          pubnub.api.objects.getAllChannelMetadata(
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
