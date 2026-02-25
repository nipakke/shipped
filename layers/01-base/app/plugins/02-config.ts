import { consumeEventIterator } from "@orpc/client";
import { Option, Schema } from "effect";
import { UserConfig } from "~~/libs/config/schemas";
import { UserConfigView } from "~~/libs/config/view";
import { createStateCarrier } from "~~/libs/utils";

import { useRPC } from "../libs/rpc";

const userConfigCarrier = createStateCarrier({
  key: "#USER_CONFIG",
  schema: UserConfig,
});

const PING_TIMEOUT = import.meta.dev ? 2000 : 10000;

//TODO: ha meghal a szerver nem reconnectel :(
export default defineNuxtPlugin(async (nuxtApp) => {
  const data = ref<UserConfigView | undefined>();
  const isConnected = ref(false);
  const streamError = ref<unknown>();
  const isStreamingEnabled = ref(false);

  /**
   * 3 states
   * - streaming enabled and active, no errors
   * - streaming enabled but has errors (errors), this is not config errors but connection problem
   * - streaming disabled (static)
   */
  const state = computed(() => {
    if (isStreamingEnabled.value && isConnected.value && !streamError.value) return "active";
    if (isStreamingEnabled.value && !isConnected.value && streamError.value) return "retrying";
    return "static";
  });

  const error = ref<string>();

  let _unsubscribeStream: (() => void) | null = null;
  let _pingTimeout: ReturnType<typeof setTimeout> | null = null;

  function clearPingTimeout() {
    if (_pingTimeout) {
      clearTimeout(_pingTimeout);
      _pingTimeout = null;
    }
  }

  function resetPingTimeout() {
    clearPingTimeout();
    _pingTimeout = setTimeout(() => {
      console.error("Config stream ping timeout - connection lost");
      streamError.value = "Connection timeout - no ping received";
      isConnected.value = false;
      _unsubscribeStream?.();
      _unsubscribeStream = null;
    }, PING_TIMEOUT);
  }

  function applyConfig(userConfig?: UserConfig | null) {
    const decoded = Schema.decodeUnknownOption(UserConfig)(userConfig);
    if (Option.isSome(decoded)) {
      data.value = UserConfigView.make(decoded.value);
    } else {
      error.value =
        "Configuration loading failed. Please refresh the page; this appears to be an application bug.";
    }

    isStreamingEnabled.value = data.value?.general?.streamConfigChanges ?? false;
  }

  if (import.meta.server) {
    const rpc = useRPC();

    try {
      const userConfig = await rpc.config.get.call();

      if (userConfig && nuxtApp?.payload.state) userConfigCarrier.inject(nuxtApp.payload.state, userConfig);

      applyConfig(userConfig);
    } catch (error) {
      console.error(error);
    }
  }

  if (import.meta.client) {
    const nuxtApp = tryUseNuxtApp();
    const initialData = userConfigCarrier.extract(nuxtApp?.payload.state);
    applyConfig(initialData);

    if (initialData?.general?.streamConfigChanges !== false) {
      start();
    }
  }

  async function start() {
    if (import.meta.server) return;
    if (import.meta.prerender) return;

    if (isConnected.value) return;

    isStreamingEnabled.value = data.value?.general?.streamConfigChanges ?? false;

    if (!isStreamingEnabled.value) {
      isConnected.value = false;
      streamError.value = undefined;
      clearPingTimeout();
      return;
    }

    //TODO: Ez nem timeoutul. legalábbis a call... (make a timeout signal?)
    _unsubscribeStream = consumeEventIterator(useRPC().config.getStream.call(undefined, {}), {
      onEvent(val) {
        isConnected.value = true;
        streamError.value = undefined;
        resetPingTimeout();

        if (val.type === "config") {
          applyConfig(val.data);

          // If streaming was disabled, stop waiting for pings
          if (!val.data?.general?.streamConfigChanges) {
            clearPingTimeout();
            _unsubscribeStream?.();
            _unsubscribeStream = null;
            isConnected.value = false;
          }
        }
        // ping type - just resets timeout, nothing else to do
      },
      onError: (error) => {
        console.error("Failed to create stream for config:", error);

        clearPingTimeout();
        streamError.value = error.message;
        isConnected.value = false;

        setTimeout(start, 2000);
      },
      onSuccess(value) {
        // Server closed connection gracefully
        console.log("Config stream finished", value);
        clearPingTimeout();
        isConnected.value = false;
        streamError.value = undefined;
        if (value.type === "config") {
          applyConfig(value.data);
        }
      },
    });
  }

  async function refresh() {
    useRPC()
      .config.get.call()
      .then((res) => {
        applyConfig(res);

        //try to run start streaming in case streaming config changed
        start();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return {
    provide: {
      userConfigData: {
        state,
        data,
        isConnected,
        isStreamingEnabled,
        streamError,
        error,
        refresh,
      } /*  satisfies Config, */,
    },
  };
});