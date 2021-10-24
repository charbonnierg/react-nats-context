import type { NextPage } from "next";
import {
  useSubscription,
  Msg,
  NatsError,
  loadText,
  dumpText,
} from "@quara-dev/react-nats-context";
import { Text } from "@chakra-ui/react";

const UseSubscription: NextPage = () => {
  const callback = (error: NatsError | null, msg: Msg) => {
    if (error) {
      console.error(error);
      return;
    }
    alert(`Received new message: ${loadText(msg.data)}`);
    msg.respond(dumpText("Ack"));
  };

  const { connected, connecting, reconnecting, closed } = useSubscription(
    "demo",
    { callback }
  );

  if (connected) {
    return <Text mt="10rem">Up and running</Text>;
  } else if (connecting) {
    return (
      <Text mt="10rem">
        Wait a little bit, the app is connecting to the NATS server
      </Text>
    );
  } else if (reconnecting) {
    return <Text mt="10rem">Reconnecting to the NATS server</Text>;
  } else if (closed) {
    return <Text mt="10rem">No connection to NATS server</Text>;
  } else {
    return <Text>Aie ! Disconnected from the NATS server</Text>;
  }
};

export default UseSubscription;
