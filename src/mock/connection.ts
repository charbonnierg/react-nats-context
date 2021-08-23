// Provide a mock for the NatsConnection interface
// This mock does not do anything except providing expected signatures

import {
  JetStreamClient,
  JetStreamManager,
  JetStreamOptions,
  Msg,
  NatsConnection,
  PublishOptions,
  RequestOptions,
  ServerInfo,
  Stats,
  Status,
  Subscription,
  SubscriptionOptions,
} from "nats.ws";

// @ts-ignore
export const MOCK_INFO: ServerInfo = {};

export class NatsConnectionMock implements NatsConnection {
  constructor(public info: ServerInfo = MOCK_INFO) {
    this.info = info;
  }

  closed = async (): Promise<void | Error> => {};
  close = async (): Promise<void> => {};
  publish = (
    _subject: string,
    _data?: Uint8Array,
    _options?: PublishOptions
  ): void => {};
  subscribe = (_subject: string, _opts?: SubscriptionOptions): Subscription => {
    // @ts-ignore
    return {};
  };
  request = async (
    _subject: string,
    _data?: Uint8Array,
    _opts?: RequestOptions
  ): Promise<Msg> => {
    // @ts-ignore
    return {};
  };
  flush = async (): Promise<void> => {};
  drain = async (): Promise<void> => {};
  isClosed = (): boolean => {
    // @ts-ignore
    return undefined;
  };
  isDraining = (): boolean => {
    // @ts-ignore
    return undefined;
  };
  getServer = (): string => "mock";
  //   This is quite ugly but it works
  status = (): AsyncIterable<Status> => {
    return {
      [Symbol.asyncIterator]() {
        return {
          next: async () => {
            return {
              done: true,
              value: undefined,
            };
          },
        };
      },
    };
  };
  stats = (): Stats => {
    // @ts-ignore
    return {};
  };

  jetstreamManager = async (
    _opts?: JetStreamOptions
  ): Promise<JetStreamManager> => {
    // @ts-ignore
    return {};
  };
  jetstream = (_opts?: JetStreamOptions): JetStreamClient => {
    // @ts-ignore
    return {};
  };
}
