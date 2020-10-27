import { ChannelDataActionType } from '../ChannelDataActionType.enum';
import {
  ErrorFetchingChannelDataAction,
  ChannelDataRetrievedAction,
  FetchingChannelDataAction,
  FetchChannelDataError,
  FetchChannelDataSuccess,
  FetchChannelDataRequest,
} from '../ChannelDataActions';
import { ActionMeta, AnyMeta } from 'foundations/ActionMeta';
import { ObjectsCustom } from 'foundations/ObjectsCustom';
import { PayloadAction } from 'foundations/createAction';
import { Epic, ofType } from 'redux-observable';
import { PubnubEpicDependencies } from 'foundations/EpicDependency';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

export const fetchingChannelData = <Meta extends ActionMeta>(
  payload: FetchChannelDataRequest,
  meta?: Meta
): FetchingChannelDataAction<Meta> => ({
  type: ChannelDataActionType.FETCHING_CHANNEL_DATA,
  payload,
  meta,
});

export const channelDataRetrieved = <
  ChannelCustom extends ObjectsCustom,
  Meta extends ActionMeta
>(
  payload: FetchChannelDataSuccess<ChannelCustom>,
  meta?: Meta
): ChannelDataRetrievedAction<ChannelCustom, Meta> => ({
  type: ChannelDataActionType.CHANNEL_DATA_RETRIEVED,
  payload,
  meta,
});

export const errorFetchingChannelData = <Meta extends ActionMeta>(
  payload: FetchChannelDataError,
  meta?: Meta
): ErrorFetchingChannelDataAction<Meta> => ({
  type: ChannelDataActionType.ERROR_FETCHING_CHANNEL_DATA,
  payload,
  meta,
  error: true,
});

export const fetchChannelData = <Meta extends ActionMeta = AnyMeta>(
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
