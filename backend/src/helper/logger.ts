export let logger = {
  log: null,
  info: null,
  warn: null,
  error: null,
};

const keys = ["log", "info", "warn", "error", "debug"] as const;
for (let key of keys) {
  logger[key] = (tag: string, message: string) => {
    console[key]("[" + tag + "] " + ": " + message);
  };
}
