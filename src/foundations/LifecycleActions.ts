import { Epic, ofType } from 'redux-observable';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import Pubnub, { PubnubConfig } from 'pubnub';
import { PubnubEpicDependencies } from 'foundations/EpicTypes';
import { PayloadAction } from './createAction';
import { LifecycleActionType } from './LifecycleActionType.enum';
import { createPubNubListener } from '../features/subscribe/createPubNubListener';

export const setupPubnub = (
  payload: PubnubConfig
): PayloadAction<PubnubConfig> => ({
  type: LifecycleActionType.INITIALIZE,
  payload,
});

export const pubnubLifecycleEpic: Epic = (
  action$,
  _,
  { pubnub }: PubnubEpicDependencies
) =>
  action$.pipe(
    ofType(LifecycleActionType.INITIALIZE),
    map((action: PayloadAction<PubnubConfig>) => action),
    mergeMap((action) => {
      if (pubnub === undefined) {
        pubnub = {
          api: new Pubnub(action.payload),
        };

        return new Observable((observer) => {
          pubnub.api.addListener(createPubNubListener(observer));
        }).pipe(
          map((action) => action),
          catchError((error) => of(error))
        );
      } else {
        return EMPTY;
      }
    })
  );
