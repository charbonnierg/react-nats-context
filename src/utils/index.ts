/**
 * Wait for a predica to be true.
 *
 * Examples:
 *
 *   * await waitFor(_ => )
 */
export const waitFor = (
  condition: () => boolean,
  repeat: number = 200
): Promise<void> => {
  const poll = (resolve: any) => {
    if (condition()) resolve();
    else setTimeout((_) => poll(resolve), repeat);
  };
  return new Promise(poll);
};
