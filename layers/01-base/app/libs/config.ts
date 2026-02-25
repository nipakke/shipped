import type { UserConfigView } from "~~/libs/config/view";

export type Config = {
  data: Ref<UserConfigView | undefined>;
  isStreaming: Ref<boolean>;
  isConnected: Ref<boolean>;
  streamError: Ref<unknown>;
  refresh: () => Promise<void>;
};