import type { NextPage } from "next";
import { Empty, loadText, useRequest } from "@quara-dev/react-nats-context";
import { Text, Code, Button } from "@chakra-ui/react";

const UseRequest: NextPage = () => {
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
            {JSON.stringify({
              message: request.error.message,
              code: request.error.code,
              description: request.error.description,
              name: request.error.name,
            })}
          </Code>
        </Text>
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
          Got a response : <Code>{loadText(request.result.data)}</Code>
        </Text>
        <Button onClick={() => request.refresh()}>Refresh</Button>
      </>
    );
  }
  // When no request has been performed yet, I.E, client is not connected
  return (
    <>
      <Text mt="10rem">Not doing anything</Text>
      <Button onClick={() => request.refresh()}>Refresh</Button>
    </>
  );
};

export default UseRequest;
