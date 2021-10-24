import { NatsError, ErrorCode } from "nats.ws";

export class NatsContextError extends Error {
  public name: string;
  public code: ErrorCode | string | undefined;
  public description: string | undefined;

  constructor(
    msg: string,
    options?: { name?: string; code?: string; description?: string }
  ) {
    super(msg);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NatsContextError.prototype);
    this.name = options?.name || "Error";
    this.code = options?.code || "JS_ERROR";
    this.description = options?.description || "";
  }
}

export { NatsError, ErrorCode };
