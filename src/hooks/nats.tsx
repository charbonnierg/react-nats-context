import { useContext } from "react";
import { NatsContext, NatsContextAttrs } from "../context/context";

/**
 * Inject the NATS context into a given component lifecycle
 *
 * @returns An instance of NatsContext values
 */
export const useNats = (): NatsContextAttrs => {
  const nats = useContext(NatsContext);
  return nats;
};
