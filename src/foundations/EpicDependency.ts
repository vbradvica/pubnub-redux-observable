import Pubnub from 'pubnub';

/**
 * Describe redux observable dependencies
 */
export interface PubnubEpicDependencies {
  pubnub: {
    api?: Pubnub;
  };
}

export const createEpicDependency = (): PubnubEpicDependencies => ({
  pubnub: {
    api: undefined,
  },
});
