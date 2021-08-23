import type { NextPage } from "next";
import { TextMsg, useNats } from "@quara-dev/react-nats-context";
import { useEffect } from "react";
import { Text } from "@chakra-ui/react";
import { Empty, PublishOptions } from "nats.ws";

const MinimalSub: NextPage = () => {
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
