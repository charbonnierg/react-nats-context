import { ReactNode } from "react";
import { useRouter } from "next/router";

import { Box, Container, Flex, Stack, Text } from "@chakra-ui/react";
import { ConnectionStatus } from "../components/status";

export const ContainerLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  return (
    <>
      <Flex
        position="absolute"
        top="0px"
        right="0px"
        alignItems="center"
        py="1rem"
        pr="1rem"
      >
        <Text mr="2rem" ml="0" onClick={() => router.push("/")}>
          Home
        </Text>
        <Text mr="2rem" ml="0" onClick={() => router.push("/use-subscription")}>
          Subscriptions
        </Text>
        <Text mr="2rem" ml="0" onClick={() => router.push("/use-request")}>
          Requests
        </Text>
        <Box>
          <ConnectionStatus
            marginLeft="auto"
            marginRight="1rem"
          ></ConnectionStatus>
        </Box>
      </Flex>
      <Stack h="100vh" w="full">
        <Container
          mt={{ sm: "4rem", md: "2rem", lg: "0rem" }}
          mx="auto"
          h="full"
          maxWidth={["90%", "85%", "80%", "70%"]}
        >
          {children}
        </Container>
      </Stack>
    </>
  );
};

export default ContainerLayout;
