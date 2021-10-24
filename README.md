# `react-nats-context`

> NATS client as a React Context

## Install

`react-nats-context` depends on [`react`](https://reactjs.org/) and [`react-dom`](https://reactjs.org/docs/react-dom.html). Those dependencies should be installed as well if that's not already the case:

```bash
npm i @quara-dev/react-nats-context react-dom react
```

## Usage

- The `NatsProvider` context can be used to inject an `NATS Connection` into a React application. Below is an example with `nextjs`:

```jsx
import { NatsProvider } from "@quara-dev/react-nats-context";

export default MyPage = (pageProps) => {
  return (
    <NatsProvider
      maxReconnectAttempts={1000}
      servers={["ws://localhost:10443"]}
      tls={false}
    >
      <Component {...pageProps} />
    </NatsProvider>
  );
};
```

- The `useNats` hook can then be used to fetch the `NATS Connection` from any React component within the component tree.

```jsx
import { useNats } from "@quara-dev/react-nats-context";


export const PublishButton () => {
  const { connected, publishText } = useNats()
  return (
    <button
      isDisabled={!connected}
      onClick={() => publishText("subject", "hello world")}
    >
      Publish
    </button>
  )
}
```

- The `useRequest` hook can be used to perform a request asynchronously while component is being displayed:

```typescript
import type { NextPage } from "next";
import { Empty, loadText, useRequest } from "@quara-dev/react-nats-context";
import { Text, Code, Button } from "@chakra-ui/react";

const UseRequestExample = () => {
  /**
   * Request will be fired automatically because "auto" is set to true.
   * It is then possible to return some UI elements according to request state.
   */
  const request = useRequest("demo", Empty, { auto: true });


  // When request failed
  if (request.error) {
    return (
      <>
        <Text mt="10rem">
          Aie ! An error occured:{" "}
          <Code>
            // Additional information might be available on request.error attribute
            {JSON.stringify({
              message: request.error.message,
              code: request.error.code,
              description: request.error.description,
              name: request.error.name,
            })}
          </Code>
        </Text>
        // Refresh request on click
        <Button onClick={() => request.refresh()}>Refresh</Button>
      </>
    );
  }
  // When request is still on-going
  if (request.loading) {
    return <Text mt="10rem">Waiting for reply...</Text>;
  }
  // When request was successfull
  if (request.result) {
    return (
      <>
        <Text mt="10rem">
          // Parse response data as string
          Got a response : <Code>{loadText(request.result.data)}</Code>
        </Text>
        // Refresh the request on click
        <Button onClick={() => request.refresh()}>Refresh</Button>
      </>
    );
  }
  // When no request has been performed yet, I.E, client is not connected
  return (
    <>
      <Text mt="10rem">Not doing anything</Text>
      // Refresh the request on click
      <Button onClick={() => request.refresh()}>Refresh</Button>
    </>
  );
};

export default UseRequestExample;
```

## Minimal subscription example

Below is an example of a Next.js application page using a subscription:

```typescript
import type { NextPage } from "next";
import {
  dumpText,
  loadText,
  useSubscription,
  Msg,
  NatsError,
} from "@quara-dev/react-nats-context";
import { Text } from "@chakra-ui/react";

const MinimalExample: NextPage = () => {
  /**
   * A callback that will be used to process messages
   */
  const callback = (error: NatsError | null, msg: Msg) => {
    if (error) {
      console.error(error);
      return;
    }
    alert(`Received new message: ${loadText(msg.data)}`);
    msg.respond(dumpText("Ack"));
  };
  /**
   * Use the useSubscription hook to start a subscription in the background
   * (only when client is connected)
   */
  const { connected, connecting, reconnecting, closed } = useSubscription(
    "demo",
    { callback }
  );

  /**
   * Display a component that gets updated on connection status update
   */
  if (connected) {
    return <Text>Up and running</Text>;
  } else if (connecting) {
    return (
      <Text>Wait a little bit, the app is connecting to the NATS server</Text>
    );
  } else if (reconnecting) {
    return <Text>Reconnecting to the NATS server</Text>;
  } else if (closed) {
    return <Text>No connection to NATS server</Text>;
  } else {
    return <Text>Aie ! Disconnected from the NATS server</Text>;
  }
};

export default MinimalExample;
```

## Display connection status using a circular progress

> Check out [chakra-ui CircularProgress usage](https://chakra-ui.com/docs/feedback/circular-progress#indeterminate-progress)

```typescript
import { CircularProgress, CircularProgressProps } from "@chakra-ui/react";
import { useNats } from "@quara-dev/react-nats-context";

export const ConnectionStatus = (props: CircularProgressProps) => {
  // Each variable is a boolean state that gets updated on the fly
  const { reconnecting, connecting, connected, connect } = useNats();

  // The NATS client is not initialized yet, we're connecting for the first time
  if (connecting) {
    return <CircularProgress isIndeterminate color="blue.300" {...props} />;
  }

  // The NATS client is reconnecting to NATS server
  if (reconnecting) {
    return <CircularProgress isIndeterminate color="orange.300" {...props} />;
  }

  // The NATS client is already connected
  if (connected) {
    return <CircularProgress value={100} color="green.300" {...props} />;
  }
  return (
    <CircularProgress
      value={100}
      color="red.500"
      {...props}
      onClick={connect}
    />
  );
};
```

## Features

```jsx
/**
 * Those imports can be used for typing only
 */
import type {
  NatsContextAttrs,
  NatsContextProps,
  NatsConnection,
  NatsError,
  ConnectionOptions,
  PublishOptions,
  RequestOptions,
  SubscriptionOptions,
  Subscription,
  Msg,
  TextMsg,
  JsonMsg,
} from "@quara-dev/react-nats-context";

/**
 * Those imports can be used as values
 */
import {
  Empty,
  NatsContext,
  NatsProvider,
  dumpText,
  dumpJSON,
  loadText,
  loadJSON,
  useNats,
  useSubscription
} from "@quara-dev/react-nats-context";

/**
 * You can find below all attributes that are available on an NATS context
 */
export const MyComponent () => {
  const {
    nc,
    connect,
    close,
    reconnect,
    update,
    connected,
    connecting,
    reconnecting,
    closed,
    subscribe,
    publish,
    publishText,
    publishJson,
    request,
    requestText,
    requestJson,
  } = useNats()

  /**
   * There is also a hook to subscribe to a subject
   */
  const {
    sub,
    connected,
    connecting,
    reconnecting,
    closed,
    update,
  } = useSubscription("foo")
}
```
