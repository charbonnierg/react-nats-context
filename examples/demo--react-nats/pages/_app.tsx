import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { NatsProvider } from "@quara-dev/react-nats-context";
import { ContainerLayout } from "./_layout";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <NatsProvider
        connect_auto={false}
        servers={["ws://localhost:10443"]}
        tls={false}
      >
        <ContainerLayout>
          <Component {...pageProps} />
        </ContainerLayout>
      </NatsProvider>
    </ChakraProvider>
  );
}
export default MyApp;
