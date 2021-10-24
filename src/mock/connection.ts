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
import { NatsContextError } from "../errors";
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
  ): void => {
    throw new NatsContextError("Failed to publish", {
      name: "ClientNotInitiliazedError",
      description: "No instance of NATS client has been created yet",
      code: "NOT_INITIALIZED",
    });
  };
  subscribe = (_subject: string, _opts?: SubscriptionOptions): Subscription => {
    throw new NatsContextError("Failed to subscribe", {
      name: "ClientNotInitiliazedError",
      description: "No instance of NATS client has been created yet",
      code: "NOT_INITIALIZED",
    });
  };
  request = async (
    _subject: string,
    _data?: Uint8Array,
    _opts?: RequestOptions
  ): Promise<Msg> => {
    throw new NatsContextError("Failed to request", {
      name: "ClientNotInitiliazedError",
      description: "No instance of NATS client has been created yet",
      code: "NOT_INITIALIZED",
    });
  };
  flush = async (): Promise<void> => {
    throw new NatsContextError("Failed to flush", {
      name: "ClientNotInitiliazedError",
      description: "No instance of NATS client has been created yet",
      code: "NOT_INITIALIZED",
    });
  };
  drain = async (): Promise<void> => {
    throw new NatsContextError("Failed to drain", {
      name: "ClientNotInitiliazedError",
      description: "No instance of NATS client has been created yet",
      code: "NOT_INITIALIZED",
    });
  };
  isClosed = (): boolean => true;
  isDraining = (): boolean => false;
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
    throw new NatsContextError("Failed to gather stats", {
      name: "ClientNotInitiliazedError",
      description: "No instance of NATS client has been created yet",
      code: "NOT_INITIALIZED",
    });
  };

  jetstreamManager = async (
    _opts?: JetStreamOptions
  ): Promise<JetStreamManager> => {
    throw new NatsContextError("Failed to get JetStream Manager", {
      name: "ClientNotInitiliazedError",
      description: "No instance of NATS client has been created yet",
      code: "NOT_INITIALIZED",
    });
  };
  jetstream = (_opts?: JetStreamOptions): JetStreamClient => {
    throw new NatsContextError("Failed to get JetStream Client", {
      name: "ClientNotInitiliazedError",
      description: "No instance of NATS client has been created yet",
      code: "NOT_INITIALIZED",
    });
  };
}
