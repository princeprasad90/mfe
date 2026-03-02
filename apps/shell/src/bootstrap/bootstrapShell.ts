import { useShellStore } from "../stores/shellStore";

export const bootstrapShell = async () => {
  const appId = localStorage.getItem("shell_appId");
  const profileId = localStorage.getItem("shell_profileId");

  if (appId && profileId) {
    await useShellStore.getState().selectProfile(appId, profileId);
    return;
  }

  await useShellStore.getState().selectProfile("default-app", "default-profile");
};
