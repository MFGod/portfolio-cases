const LATENCY_MS = 250;

export const createSimulator = () => {
  const request = async <T>(resolve: () => T) => {
    await new Promise((done) => setTimeout(done, LATENCY_MS));
    return resolve();
  };

  return { request };
};
