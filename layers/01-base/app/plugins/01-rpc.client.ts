import { createRPC } from "../libs/rpc";

export default defineNuxtPlugin(() => {
  const e = useRequestEvent();

  const rpc = createRPC(e);

  return {
    provide: {
      rpcClient: rpc,
    },
  };
});