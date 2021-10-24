import type { NextPage } from "next";
import { useNats, loadText, getHeaders } from "@quara-dev/react-nats-context";
import { useState, useEffect } from "react";
import { ErrorCode, headers, Subscription } from "nats.ws";
import { Button, Link, Text, Code, SimpleGrid, Stack } from "@chakra-ui/react";

const Home: NextPage = () => {
  const { connect, close, connected, publishText, requestText, subscribe } =
    useNats();
  const [subject, setSubject] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Start/Stop subscription on subject change
  useEffect(() => {
    if (!connected) {
      setSubscription(null);
    } else if (subject) {
      const sub = subscribe(subject);
      setSubscription(sub);
      return () => sub.unsubscribe();
    }
  }, [subject, connected, subscribe]);

  // Process messages as they come
  useEffect(() => {
    if (!connected || !subscription) {
      return;
    }
    const start_task = async () => {
      for await (const msg of subscription) {
        const data = loadText(msg.data);
        const msgHeaders = {
          ...msg.headers,
          headers: getHeaders(msg),
        }
        alert(
          `Received new message on subject ${subject} (${JSON.stringify(msgHeaders)}): ${data}`
        );
      }
    };
    start_task();
  }, [subscription, subject, connected]);

  // Some styling
  const stackProps = {
    justifyContent: "center",
    alignItems: "center",
    mt: "2rem",
    mx: "auto",
    boxShadow: "xl",
    rounded: "lg",
    px: "1rem",
    py: "2rem",
    minW: { sm: "400px", xl: "340px" },
  };

  return (
    <>
      <Text as="h1" fontSize={{ sm: "3xl", md: "4xl", lg: "6xl" }}>
        <Link
          href="https://www.npmjs.com/package/@quara-dev/react-nats-context"
          isExternal
        >
          react-nats
        </Link>{" "}
        demo
      </Text>

      <Text fontWeight="light" fontSize={{ sm: "lg", md: "xl", lg: "2xl" }}>
        Get started by editing <Code>pages/index.tsx</Code>
      </Text>

      <SimpleGrid
        marginTop={{ sm: "2rem", xl: "4rem" }}
        columns={{ sm: 1, xl: 2 }}
      >
        <Stack {...stackProps}>
          <Text fontSize={{ sm: "lg", md: "xl", lg: "2xl" }}>
            Connect &rarr;
          </Text>
          <Button disabled={connected} onClick={() => connect()}>
            Start connection
          </Button>
        </Stack>

        <Stack {...stackProps}>
          <Text fontSize={{ sm: "lg", md: "xl", lg: "2xl" }}>Close</Text>
          <Button disabled={!connected} onClick={() => close()}>
            Close connection
          </Button>
        </Stack>

        <Stack {...stackProps}>
          <Text fontSize={{ sm: "lg", md: "xl", lg: "2xl" }}>
            Publish &rarr;
          </Text>
          <Button
            disabled={!connected}
            onClick={() => {
              const msgHeaders = headers();
              msgHeaders.set("from", "react-nats-context");
              publishText("foo", "hello", { headers: msgHeaders });
            }}
          >
            Send &apos;hello&apos; on subject &apos;foo&apos;
          </Button>
        </Stack>

        <Stack {...stackProps}>
          <Text fontSize={{ sm: "lg", md: "xl", lg: "2xl" }}>
            Subscribe &rarr;
          </Text>

          {subscription ? (
            <Button
              disabled={!connected}
              onClick={() => {
                console.log("Stopping subscription");
                setSubscription(null);
                console.log("Setting null subject");
                setSubject(null);
              }}
            >
              Stop subscription
            </Button>
          ) : (
            <Button disabled={!connected} onClick={() => setSubject("foo")}>
              Start subscription
            </Button>
          )}
        </Stack>

        <Stack {...stackProps}>
          <Text fontSize={{ sm: "lg", md: "xl", lg: "2xl" }}>
            Request &rarr;
          </Text>
          <Button
            disabled={!connected}
            onClick={async () => {
              try {
                const response = await requestText("bar");
                alert(`Received response: ${response.data}`);
              } catch (err: any) {
                const code: ErrorCode | undefined = err.code;
                switch (code) {
                  case ErrorCode.NoResponders:
                    alert("No responder on subject bar");
                    break;
                  case ErrorCode.Timeout:
                    alert("Someone is listening but did not respond");
                    break;
                  default:
                    alert(`Request failed due to error: ${err}`);
                }
              }
            }}
          >
            Request a reply on subject &apos;bar&apos;
          </Button>
        </Stack>

        <Stack {...stackProps}>
          <Text fontSize={{ sm: "lg", md: "xl", lg: "2xl" }}>
            Publish request &rarr;
          </Text>
          <Button
            disabled={!connected}
            onClick={() => {
              publishText("bar", "", { reply: "foo" });
            }}
          >
            Publish subject &apos;bar&apos; and wait reply on &apos;foo&apos;
          </Button>
        </Stack>
      </SimpleGrid>
    </>
  );
};

export default Home;
