<template>
  <div>
    <UPopover mode="hover">
      <UButton variant="ghost" :color="chipColor" icon="stash:circle-dot-duotone">
        <!-- <div
          :class="`size-3 rounded-full ${state === 'active' ? 'bg-emerald-500' : state === 'retrying' ? 'bg-yellow-500' : 'bg-gray-500'}`">
        </div> -->
      </UButton>
      <template #content>
        <div class="max-w-xs space-y-4 p-4">
          <div class="flex gap-2">
            <div class="pt-1">
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-full"
                :class="popoverIconClass"
              >
                <UIcon :name="popoverIcon" class="size-5" />
              </div>
            </div>
            <div class="">
              <div class="font-bold">
                {{ tooltipTitle }}
              </div>
              <div class="text-muted text-sm">
                {{ tooltipBody }}
              </div>
            </div>
          </div>
          <div v-if="userConfig.state.value === 'static'">
            <UButton
              icon="lucide:refresh-cw"
              color="neutral"
              block
              variant="solid"
              @click="userConfig.refresh()"
              >Refresh config</UButton
            >
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
const userConfig = useUserConfig();
const streamError = computed(() => userConfig.streamError.value);

const chipColor = computed(() => {
  switch (userConfig.state.value) {
    case "active":
      return "success";
    case "retrying":
      return "warning";
    case "static":
      return "neutral";
    default:
      return "neutral";
  }
});

const tooltipTitle = computed(() => {
  switch (userConfig.state.value) {
    case "active":
      return "Config Streaming Active";
    case "retrying":
      return "Config Stream Interrupted";
    case "static":
      return "Config Streaming Disabled";
    default:
      return "";
  }
});

const tooltipBody = computed(() => {
  switch (userConfig.state.value) {
    case "active":
      return "Configuration updates are being applied automatically in real-time.";
    case "retrying":
      return `Failed to reach server. Retrying automatically... \n\n ${streamError.value || ""}`;
    case "static":
      return "Live updates are turned off in your config. You must refresh the page manually to see changes.";
    default:
      return "";
  }
});

const popoverIcon = computed(() => {
  switch (userConfig.state.value) {
    case "active":
      return "lucide:wifi";
    case "retrying":
      return "lucide:triangle-alert";
    case "static":
      return "lucide:wifi-off";
    default:
      return "lucide:wifi";
  }
});

const popoverIconClass = computed(() => {
  switch (userConfig.state.value) {
    case "active":
      return "bg-emerald-500/10 text-emerald-500";
    case "retrying":
      return "bg-yellow-500/10 text-yellow-500";
    case "static":
      return "bg-gray-500/10 text-gray-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
});
</script>