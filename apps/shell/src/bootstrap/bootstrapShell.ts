import { useShellStore } from "../stores/shellStore";

export const bootstrapShell = async () => {
  const { loadApplications, selectApp, selectProfile } = useShellStore.getState();

  await loadApplications();

  const appId = localStorage.getItem("shell_appId");
  const profileId = localStorage.getItem("shell_profileId");

  if (appId && profileId) {
    await selectApp(appId);
    await selectProfile(appId, profileId);
  }
};
