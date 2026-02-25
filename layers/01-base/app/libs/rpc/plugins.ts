// import { ClientRetryPlugin } from "@orpc/client/plugins";

export const PLUGINS = [
  /* new ClientRetryPlugin({
    default: {
      shouldRetry(opts) {
        return opts.context.retry === Number.POSITIVE_INFINITY;
      },
      retry: () => {
        return 3;
      },
    },
  }), */
];