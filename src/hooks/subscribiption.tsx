import { useState, useEffect } from "react";
import { Subscription, SubscriptionOptions } from "../context";
import { useNats } from "./nats";

/**
 * Inject the NATS context into a given component lifecycle
 *
 * @returns An instance of NatsContext values
 */
export const useSubscription = (
  subject: string,
  opts?: SubscriptionOptions
) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionOptions, setSubscriptionOptions] = useState<
    SubscriptionOptions | undefined
  >(opts);
  const { subscribe, connected, connecting, reconnecting, closed } = useNats();
  useEffect(() => {
    if (!connected || !subject) {
      return;
    }
    const sub = subscribe(subject, subscriptionOptions);
    setSubscription(sub);
    return () => sub.unsubscribe();
  }, [subscriptionOptions, subject, subscribe, connected]);

  return {
    sub: subscription,
    options: subscriptionOptions,
    update: (options: SubscriptionOptions) => setSubscriptionOptions(options),
    connected,
    connecting,
    reconnecting,
    closed,
  };
};
