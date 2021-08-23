import { renderHook, act } from "@testing-library/react-hooks/dom";
import { Msg } from "nats.ws";
import { NatsProvider, useNats } from "../context";
import { waitFor } from "../utils";

test("Should publish/subscribe messages", async () => {
  // Let's create a wrapper
  const wrapper = ({ children }: any) => (
    <NatsProvider servers={["ws://localhost:10443"]} tls={false}>
      {children}
    </NatsProvider>
  );

  // Render the useNats hook
  const { result } = renderHook(() => useNats(), { wrapper });
  // Let's wait until NATS is connected
  await act(async () => {
    await waitFor(() => result.current.connected);
  });

  // Define a subject
  const subject = "jest.tests.nats.publish.empty";

  // Test to publish an empty message
  let _result: { msg: Msg | undefined } = { msg: undefined };
  await act(async () => {
    const sub = await result.current.nc.subscribe(subject);
    // We publish an empty message
    result.current.nc.publish(subject, new Uint8Array());
    for await (const m of sub) {
      _result.msg = m;
      break;
    }
    sub.unsubscribe();
  });
  expect(_result.msg?.subject).toBe(subject);
  // We expect the response data be an Uint8Array
  expect(_result.msg?.data).toBeInstanceOf(Uint8Array);
  // We expect the response data to be decodable into an empty string
  expect(result.current.decodeText(_result.msg?.data as any as Uint8Array)).toBe(
    ""
  );
});
