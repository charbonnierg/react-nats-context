import { useState, useEffect } from "react";
import { Msg, RequestOptions } from "../context";
import { useNats } from "./nats";

type RequestHookOptions = Omit<RequestOptions, "timeout"> & {
  auto?: boolean;
  timeout?: number;
};
type RequestUpdateOptions = Omit<RequestOptions, "timeout"> & {
  payload?: Uint8Array;
  timeout?: number;
};

/**
 * Inject the NATS context into a given component lifecycle
 *
 * @returns An instance of NatsContext values
 */
export const useRequest = (
  subject: string,
  payload?: Uint8Array,
  opts?: RequestHookOptions
) => {
  let auto: boolean | undefined = false;
  let requestOptions: RequestOptions | undefined;
  if (opts === undefined) {
    requestOptions = undefined;
  } else {
    // @ts-ignore
    ({ auto, ...requestOptions } = opts);
  }
  const [options, setOptions] = useState(requestOptions);
  const [data, setData] = useState(payload);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Msg | null>(null);
  const [error, setError] = useState<{
    err: any;
    message: string;
    code?: string;
    description?: string;
    name?: string;
  } | null>(null);
  const [lock, setLock] = useState(false);
  const { request, connected } = useNats();

  const doRequest = async () => {
    setLoading(true);
    return await request(subject, data, options)
      .then((msg) => {
        console.log(msg);
        setError(null);
        setResult(msg);
        setLoading(false);
      })
      .catch((err: any) => {
        setError({
          err,
          message: err?.message,
          code: err?.code,
          description: err?.description,
          name: err?.name,
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    if (lock) {
      return;
    }
    if (connected && auto) {
      doRequest();
    }
  }, [subject, data, options, auto, connected, lock]);

  const updatePayload = (payload?: Uint8Array) => {
    setData(payload);
  };

  const updateOptions = (opts?: RequestOptions) => {
    const newOptions = opts ? { ...options, ...opts } : undefined;
    setOptions(newOptions);
  };

  return {
    connected,
    data,
    options,
    loading,
    result,
    error,
    refresh: async () => await doRequest(),
    update: (values?: RequestUpdateOptions) => {
      setLock(true);
      if (values !== undefined) {
        const { payload, ...opts } = values;
        updatePayload(payload);
        // @ts-ignore
        updateOptions(opts);
      }
      setLock(false);
    },
    updateOptions,
    updatePayload,
  };
};
