import { StringCodec, JSONCodec, Empty, Msg } from "nats.ws";

const sc = StringCodec();
const jc = JSONCodec();

export const loadText = (data?: Uint8Array) => (data ? sc.decode(data) : "");
export const dumpText = (data?: string) => (data ? sc.encode(data) : Empty);

export const loadJSON = (data?: Uint8Array) => (data ? jc.decode(data) : null);
export const dumpJSON = (data?: unknown) => (data ? jc.encode(data) : Empty);

export const getHeaders = (msg: Msg) => {
  let msgHeaders: { [key: string]: string } = {};
  if (msg.headers) {
    for (const [key, [value, ..._]] of msg.headers) {
      msgHeaders[key] = value;
    }
  }
  return msgHeaders;
};
