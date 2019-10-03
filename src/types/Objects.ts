export interface ObjectsActionPayload {
  channel: string;
  message: {
    data: object;
    event: string;
    type: string;
  };
  publisher: string | undefined;
  subscription: null;
  timetoken: string;
}

export interface ObjectsStatusPayload {
  error: boolean;
  operation: string;
  statusCode: number;
}

export interface ObjectsResponsePayload {
  status: number;
  data: object | null;
}
