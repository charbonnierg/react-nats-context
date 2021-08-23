import { renderHook, act } from '@testing-library/react-hooks/dom'
import { NatsProvider ,useNats } from "../context"
import { waitFor } from "../utils"

test("Should create a Nats Connection", async () => {
  const wrapper = ({ children }: any) => <NatsProvider servers={["ws://localhost:10443"]} tls={false}>{children}</NatsProvider>
  const { result } = renderHook(() => useNats(), { wrapper })
  // By the time script is running it should be connecting
  expect(result.current.connecting).toBe(true)
  // Let's wait until it's connected
  await act(async () => {
    await waitFor(() => result.current.connected)
  })
  // Let's make sure we're connected
  expect(result.current.connected).toBe(true)
  // And other state variables are coherent
  expect(result.current.connecting).toBe(false)
  expect(result.current.reconnecting).toBe(false)
})

test("Should not create a Nats Connection", async () => {
  const wrapper = ({ children }: any) => <NatsProvider connect_auto={false} servers={["ws://localhost:10443"]} tls={false}>{children}</NatsProvider>
  const { result } = renderHook(() => useNats(), { wrapper })
  expect(result.current.closed).toBe(true)
  expect(result.current.connecting).toBe(false)
  expect(result.current.reconnecting).toBe(false)
  expect(result.current.connected).toBe(false)
})
