export function useUserConfig() /* : Config */ {
  const data = useNuxtApp().$userConfigData;

  if (!data) {
    throw new Error("Error providing config data. `$userConfigData` does not exists on `nuxtApp`");
  }

  return data;
}