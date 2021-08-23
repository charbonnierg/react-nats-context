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

## Minimal subscription example

```typescript
import { useEffect } from "react";
import { Text } from "@chakra-ui/react";

import { Empty, PublishOptions } from "nats.ws";
import { TextMsg, useNats } from "@quara-dev/react-nats-context";

const MinimalSub = () => {
  const {
    subscribe,
    connected,
    connecting,
    reconnecting,
    decodeText,
    encodeText,
  } = useNats();

  const callback = (msg: TextMsg) => {
    alert(`Received new message: ${msg.data}`);
  };

  useEffect(() => {
    if (!connected) {
      return;
    }
    const sub = subscribe("demo");
    // Create an async function that will process each message. It will first parse them into a TextMsg then execute the callback
    const processor = async () => {
      for await (const msg of sub) {
        callback({
          ...msg,
          data: decodeText(msg.data),
          respond: (data?: string, opts?: PublishOptions) =>
            msg.respond(data ? encodeText(data) : Empty, opts),
        });
      }
    };
    processor();
    return () => {
      sub.unsubscribe();
    };
  }, [connected, decodeText, encodeText, subscribe]);

  if (connected) {
    return <Text>Up and running</Text>;
  } else if (connecting) {
    return (
      <Text>Wait a little bit, the app is connecting to the NATS server</Text>
    );
  } else if (reconnecting) {
    return <Text>Reconnecting to the NATS server</Text>;
  } else {
    return <Text>Disconnected from the NATS server</Text>;
  }
};

export default MinimalSub;
```

## Subscribe to dynamic subject

- Create two state variables to hold subject and subscription

```typescript
import { useNats } from "@quara-dev/react-nats-context";
import { useState, useEffect } from "react";

const { decodeText, subscribe, connected } = useNats();
const [subject, setSubject] = useState<string | null>(null);
const [subscription, setSubscription] = useState<Subscription | null>(null);
```

- Create an effect to start and stop the subscription

```typescript
useEffect(
  () => {
    // Set subscription to null value if client is not connected
    if (!connected) {
      setSubscription(null);
    }
    // Subscribe only when a subject is defined
    else if (subject) {
      const sub = subscribe(subject);
      // Set the subscription state value
      setSubscription(sub);
      // Return clean up function
      return () => sub.unsubscribe();
    }
  },
  // Run this effect every time any of the three dependency change
  [subject, connected, subscribe]
);
```

- Create an effect to process messages as they come

```typescript
useEffect(
  () => {
    // Nothing to do if we're not connected
    if (!connected || !subscription) {
      return;
    }
    // Create an async function that will process each message
    const start_task = async () => {
      for await (const msg of subscription) {
        // Message raw data is an UInt8Array
        const data = decodeText(msg.data);
        alert(`Received new message on subject ${subject}: ${data}`);
      }
    };
    // Start processing messages
    start_task();
  },
  // Run this effect on every dependency change
  [subscription, decodeText, subject, connected]
);
```

## Display connection status using a circular progress

> Check out [chakra-ui CircularProgress usage](https://chakra-ui.com/docs/feedback/circular-progress#indeterminate-progress)

```typescript
import { CircularProgress, CircularProgressProps } from "@chakra-ui/react";
import { useNats } from "@quara-dev/react-nats-context";

export const ConnectionStatus = (props: CircularProgressProps) => {
  // This component uses the NATS Context because it needs to access the NATS client
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
import { useNats } from "@quara-dev/react-nats-context";


export const MyComponent () => {
  // You can find below all properties that are available on an NATS context
  const {
    nc,
    reconnecting,
    connecting,
    connected,
    subscriptions,
    encodeText,
    encodeJson,
    decodeText,
    decodeJson,
    subscribe,
    publish,
    publishText,
    publishJson,
    request,
    requestText,
    requestJson,
    reconnect,
  } = useNats()
}
```
