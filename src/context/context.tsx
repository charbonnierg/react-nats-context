// React context providing an NATS Connection to a React application.
//
// The context accept the following properties:
//  - All NATS connection options. See [nats.ws documentation](https://github.com/nats-io/nats.ws#connection-options)
//  - onStatus: Default callback to execute on NATS Connection status update
//  - onConnect: Callback executed on successfull connection to NATS
//  - onDisconnect: Callback executed on disconnection from NATS
//  - onReconnect: Callback executed on successfull reconnection to NATS
//  - onReconnecting: Callback executed on reconnection attempt to NATS
//  - onUpdate: Callback executed when cluster information update is received from NATS

// The context provides the following values:
//  - nc: An instance of NatsConnection.
//  - closed: A boolean state variable indicating whether desired client state is to be closed.
//  - connecting: A boolean state variable indicating whether client is currently connecting to NATS.
//  - connected: A boolean state variable indicating whether client is currently connected to NATS.
//  - subscribe: A function to subscribe to a new subject
//  - publish: A function to publish a bytes array message
//  - publishText: A function to publish a text message
//  - publishJson: A function to publish a JSON message
//  - request: An async function to publish a bytes array and wait for response. Response data is a byte array.
//  - requestText: An async function to publish a text message and wait for response. Response data is parsed into a string.
//  - requestJson: An async function to publish a JSON message wait for response. Response data is parsed into an object.
//  - reconnect: A function to reconnect to NATS

/**
 * Import React dependencies
 */
import { createContext, useEffect, useState } from "react";
/**
 * Import NATS dependencies
 */
import {
  connect,
  ConnectionOptions,
  Empty,
  Events,
  Msg,
  NatsConnection,
  PublishOptions,
  RequestOptions,
  Subscription,
  SubscriptionOptions,
} from "nats.ws";
/**
 * Import local dependencies
 */
import { loadText, dumpText, loadJSON, dumpJSON } from "../io";
import { NatsConnectionMock } from "../mock";
import { NatsContextError } from "../errors";
/**
 * Properties that are expected when using onStatus function
 */
export interface NatsNotificationProps {
  title: string;
  description: string;
  status: "success" | "info" | "warning" | "error";
  id?:
    | "connecting"
    | "reconnecting"
    | "reconnect"
    | "connect-success"
    | "connect-failure";
}

// Additional message types
export type TextMsg = Omit<Omit<Msg, "respond">, "data"> & {
  data: string;
  respond: (data?: string, opts?: PublishOptions) => boolean;
};
export type JsonMsg = Omit<Omit<Msg, "respond">, "data"> & {
  data: unknown;
  respond: (data?: unknown, opts?: PublishOptions) => boolean;
};

/**
 * Properties that are expected when creating a new NatsContext
 */
export interface NatsContextProps extends ConnectionOptions {
  children: any;
  onStatus?: (props: NatsNotificationProps) => void;
  onConnect?: (props: NatsNotificationProps) => void;
  onConnectFailure?: (props: NatsNotificationProps) => void;
  onDisconnect?: (props: NatsNotificationProps) => void;
  onReconnect?: (props: NatsNotificationProps) => void;
  onReconnecting?: (props: NatsNotificationProps) => void;
  connect_auto?: boolean;
}

/**
 * Attributes that can be found on a NatsContext instance
 */
export interface NatsContextAttrs {
  nc: NatsConnection;
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  closed: boolean;
  connect: () => Promise<void>;
  close: () => Promise<void>;
  update: (options?: ConnectionOptions) => void;
  subscribe: (subject: string, opts?: SubscriptionOptions) => Subscription;
  reconnect: () => Promise<void>;
  publish: (
    subject: string,
    payload?: Uint8Array,
    opts?: PublishOptions
  ) => void;
  publishText: (
    subject: string,
    payload?: string,
    opts?: PublishOptions
  ) => void;
  publishJson: (
    subject: string,
    payload?: unknown,
    opts?: PublishOptions
  ) => void;
  request: (
    subject: string,
    payload?: Uint8Array,
    opts?: RequestOptions
  ) => Promise<Msg>;
  requestText: (
    subject: string,
    payload?: string,
    opts?: RequestOptions
  ) => Promise<TextMsg>;
  requestJson: (
    subject: string,
    payload?: unknown,
    opts?: RequestOptions
  ) => Promise<JsonMsg>;
}

/**
 * Default NatsContext instance
 */
const defaultContext: NatsContextAttrs = {
  nc: new NatsConnectionMock(),
  connected: false,
  connecting: false,
  reconnecting: false,
  closed: true,
  connect: async () => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
  close: async () => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
  update: (_options?: ConnectionOptions) => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
  reconnect: async () => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
  subscribe: (_subject: string, _opts: SubscriptionOptions) => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
  publish: (
    _subject: string,
    _payload?: Uint8Array,
    _opts?: PublishOptions
  ) => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
  publishText: (
    _subject: string,
    _payload?: string,
    _opts?: PublishOptions
  ) => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
  publishJson: (
    _subject: string,
    _payload?: unknown,
    _opts?: PublishOptions
  ) => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
  request: async (
    _subject: string,
    _payload?: Uint8Array,
    _opts?: RequestOptions
  ) => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
  requestText: async (
    _subject: string,
    _payload?: string,
    _opts?: RequestOptions
  ) => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
  requestJson: async (
    _subject: string,
    _payload?: unknown,
    _opts?: RequestOptions
  ) => {
    throw new NatsContextError("NATS context has not been initialized yet");
  },
};

/**
 * Create NatsContext using default value
 */
export const NatsContext = createContext(defaultContext);

/**
 * NatsProvider is responsible for wrapping components tree within an NatsContext.
 *
 * It accepts some properties of type NatsContextProps.
 */
export const NatsProvider = (props: NatsContextProps) => {
  // Generate the default NATS connection (which is a mock, so only useful for testing)
  const defaultClient: NatsConnection = new NatsConnectionMock();
  // Fetch variables from component properties
  const {
    children,
    onStatus,
    onConnect,
    onConnectFailure,
    onDisconnect,
    onReconnect,
    onReconnecting,
    connect_auto,
    ..._options
  } = props;
  // Use a state variable to keep track whether the client is a mock implementation
  const [isMock, setIsMock] = useState(true);
  // Use a state variable to store the NATS client
  const [nc, setClient] = useState(defaultClient);
  // Use a state variable to keep track whether the client is closed
  const [closed, setClosed] = useState(true);
  // Use a state variable to keep track whether client is connected
  const [connecting, setConnecting] = useState(false);
  // Use a state variable to keep track whether client is reconnecting
  const [reconnecting, setReconnecting] = useState(false);
  // Use a state variable to keep track wheter client is connected
  const [connected, setConnected] = useState(false);
  // Use a state variable to keep track of client options
  const [connectionOptions, setConnectionOptions] = useState<
    ConnectionOptions | undefined
  >(_options);

  const _notify = (
    props: NatsNotificationProps,
    notifier?: (props: NatsNotificationProps) => void
  ) => {
    // Fetch the notifier function
    const _notifier = notifier ? notifier : onStatus;
    // Call the notifier function is it is defined
    if (_notifier !== undefined) {
      _notifier(props);
    }
  };
  // When NATS connects, disconnect or reconnect, we can send notifications to the user
  // This component does not constrain the developer to use a specific notification system
  // Instead, we defined the interface of a notification function and let user specify the notification function
  const notifier = {
    connecting() {
      _notify(
        {
          title: "Connection attempt",
          description: "Attempting to connect to NATS server",
          status: "info",
          id: "connecting",
        },
        onConnect
      );
    },
    reconnecting() {
      _notify(
        {
          title: "Reconnection attempt",
          description: "Attempting to reconnect to NATS server",
          status: "warning",
          id: "reconnecting",
        },
        onReconnecting
      );
    },
    reconnect() {
      _notify(
        {
          title: "Successfully reconnected",
          description: "Successfully reconnected to NATS server 🎉",
          status: "info",
          id: "reconnect",
        },
        onReconnect
      );
    },
    connect() {
      _notify(
        {
          title: "Successfully connected",
          description: "Connected to NATS cluster 🎉",
          status: "info",
          id: "connect-success",
        },
        onConnect
      );
    },
    failed() {
      _notify(
        {
          title: "Connection Failure",
          description: "Failed to connect to NATS cluster 😨",
          status: "error",
          id: "connect-failure",
        },
        onConnectFailure
      );
    },
    disconnect() {
      _notify(
        {
          title: "Disconnection",
          description: "Lost connection to NATS cluster 😨",
          status: "error",
          id: "connect-failure",
        },
        onDisconnect
      );
    },
  };

  /**
   * Simple function to publishText a message
   *
   * @param subject - The subject on which message should be published
   * @param payload  - The content of the message
   */
  const publish = (subject: string, payload?: Uint8Array): void => {
    nc.publish(subject, payload || Empty);
  };

  /**
   * Simple function to publishText a message
   *
   * @param subject - The subject on which message should be published
   * @param payload  - The content of the message
   */
  const publishText = (
    subject: string,
    payload?: string,
    opts?: PublishOptions
  ): void => {
    nc.publish(subject, dumpText(payload), opts);
  };

  /**
   * Simple function to publishText a message
   *
   * @param subject - The subject on which message should be published
   * @param payload  - The content of the message
   */
  const publishJson = (
    subject: string,
    payload?: unknown,
    opts?: PublishOptions
  ): void => {
    nc.publish(subject, dumpJSON(payload), opts);
  };

  /**
   * Publish a message and expect a response
   *
   * @param subject - The subject on which message should be published
   * @param payload  - The content of the message
   * @param opts - The request options (timeout, headers, ...)
   */
  const request = async (
    subject: string,
    payload?: Uint8Array,
    opts?: RequestOptions
  ): Promise<Msg> => {
    return await nc.request(subject, payload || Empty, opts);
  };

  /**
   * Publish a message and expect a response
   *
   * @param subject - The subject on which message should be published
   * @param payload  - The content of the message
   * @param opts - The request options (timeout, headers, ...)
   */
  const requestText = async (
    subject: string,
    payload?: string,
    opts?: RequestOptions
  ): Promise<TextMsg> => {
    const reply_msg = await nc.request(subject, dumpText(payload), opts);
    return {
      ...reply_msg,
      data: loadText(reply_msg.data),
      respond: (data?: string, opts?: PublishOptions) => {
        return reply_msg.respond(dumpText(data), opts);
      },
    };
  };

  /**
   * Publish a message and expect a response
   *
   * @param subject - The subject on which message should be published
   * @param payload  - The content of the message
   * @param opts - The request options (timeout, headers, ...)
   */
  const requestJson = async (
    subject: string,
    payload?: unknown,
    opts?: RequestOptions
  ): Promise<JsonMsg> => {
    const reply_msg = await nc.request(subject, dumpJSON(payload), opts);
    return {
      ...reply_msg,
      data: loadJSON(reply_msg.data),
      respond: (data?: unknown, opts?: PublishOptions) => {
        return reply_msg.respond(dumpJSON(data), opts);
      },
    };
  };

  /**
   * A simple function to subscribe to a subject
   *
   * @param subject - The subject to subscribe on
   * @param opts - NATS subscription options
   */
  const subscribe = (
    subject: string,
    opts?: SubscriptionOptions
  ): Subscription => {
    const sub = nc.subscribe(subject, opts);
    const unsub = sub.unsubscribe ? sub.unsubscribe : (..._: any) => {};
    sub.unsubscribe = (max?: number) => {
      try {
        unsub.call(sub, max);
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw e;
        }
      }
    };
    return sub;
  };

  const open = async () => {
    // Initialize a new Nats Connection
    let _nc: NatsConnection;
    // First onStatus connection attempt
    if (isMock) {
      // If the client is a mock implementation, then we never tried to connect
      notifier.connecting();
    } else {
      // Else we were connected at some point, but we lost the connection
      notifier.reconnecting();
      // So we close the current client (we will create a new one later anyway)
      try {
        await nc.close();
      } catch (err) {}
    }
    // Set "connected" and "connecting" state variables ()
    setConnected(false);
    setConnecting(true);
    // Attempt to connect
    try {
      _nc = await connect(connectionOptions);
    } catch (err) {
      // We failed to connect
      console.log("Failed to connect to NATS cluster 😨");
      // Notify failure
      notifier.failed();
      // Update "connecting" state variable
      setConnecting(false);
      return;
    }
    // We're successfully connected !
    setClient(_nc);
    // Set state variables
    setClosed(false);
    setIsMock(false);
    setConnected(true);
    setConnecting(false);
    notifier.connect();
    console.log("Connected to NATS cluster 🎉");
  };

  const close = async () => {
    if (closed) {
      return;
    }
    if (!isMock) {
      nc.close();
      setClient(defaultClient);
    }
    setClosed(true);
    setConnected(false);
  };

  /**
   * Effect to monitor the connection
   */
  useEffect(() => {
    const monitor = async () => {
      // Nothing to do if client is closed
      if (closed) {
        return;
      }
      // Monitor connection status
      for await (const s of nc.status()) {
        // We iterate over status and check the status type
        switch (s.type) {
          // Handle disconnections
          case Events.Disconnect: {
            console.error(`Lost connection to NATS`);
            setConnected(false);
            notifier.disconnect();
            break;
          }
          // Handle successfull reconnections
          case Events.Reconnect: {
            console.info(`Successfully reconnected to NATS on ${s.data}`);
            setReconnecting(false);
            setConnected(true);
            notifier.reconnect();
            break;
          }
          // Handle reconnection attemps
          case "reconnecting": {
            console.warn(`Attempting to reconnect to NATS on ${s.data}`);
            setReconnecting(true);
            notifier.reconnecting();
            break;
          }
          // Handle other status
          default: {
            // TODO: Handle all events
            console.debug(`Received cluster configuration update`);
            break;
          }
        }
      }
      // We should never exit the function
      console.warn("NATS status monitor exited");
    };
    // Kick off the promise
    monitor();
    // Run this effect each time nc or close changed
  }, [nc, closed]);

  /**
   * Effect to auto start connection
   */
  useEffect(() => {
    if (connect_auto || connect_auto === undefined) {
      open();
      return () => {
        close();
      };
    } else {
      return () => {};
    }
  }, []);

  // Return the context provider
  return (
    <NatsContext.Provider
      value={{
        nc,
        closed,
        reconnecting,
        connecting,
        connected,
        subscribe,
        publish,
        publishText,
        publishJson,
        request,
        requestText,
        requestJson,
        reconnect: open,
        connect: open,
        close,
        update: async (options?: ConnectionOptions) => {
          setConnectionOptions({ ...connectionOptions, ...options });
          await open();
        },
      }}
    >
      {children}
    </NatsContext.Provider>
  );
};

// Export most used stuff from nats.ws
export {
  ConnectionOptions,
  NatsConnection,
  Msg,
  PublishOptions,
  RequestOptions,
  Subscription,
  SubscriptionOptions,
  Empty,
};
