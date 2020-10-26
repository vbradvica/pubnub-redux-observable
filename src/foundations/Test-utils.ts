import Pubnub from 'pubnub';
import { createEpicMiddleware, Epic } from 'redux-observable';
import configureMockStore from 'redux-mock-store';
import { Action } from 'redux';

function createMockStore(pubnub: Pubnub, initialState: any, rootEpic?: Epic) {
  const dependencies: Record<string, unknown> = { pubnub: { api: pubnub } };

  // Set state type explicitly to avoid redux-observable TS bug
  const epicMiddleware = createEpicMiddleware<
    Action<unknown>,
    Action<unknown>,
    any
  >({ dependencies });

  const middleware = [epicMiddleware];

  const mockStore = configureMockStore(middleware)(initialState);

  if (rootEpic) {
    epicMiddleware.run(rootEpic);
  }

  return mockStore;
}

export { createMockStore };
