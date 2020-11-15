import Pubnub from 'pubnub';
import { UserData, Channel } from 'pubnub-redux';

// helpers to get the custom type from complete objects
export type GetCustom<
  AnyMetadata extends Pubnub.v2ObjectData<Pubnub.ObjectCustom>
> = NonNullable<AnyMetadata['custom']>;

export type GetUserCustom<
  UserDataType extends UserData<Pubnub.ObjectCustom>
> = GetCustom<UserDataType>;

export type GetChannelCustom<ChannelDataType extends Channel> = GetCustom<
  ChannelDataType
>;
