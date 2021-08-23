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
