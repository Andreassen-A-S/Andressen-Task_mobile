const VALID_ID = /^[a-zA-Z0-9_-]+$/;

export type DeepLinkTarget = { screen: "task"; taskId: string };

export function resolveDeepLink(url: string): DeepLinkTarget | null {
  try {
    const parsed = new URL(url);
    const taskId = parsed.searchParams.get("taskId");
    if (!taskId || !VALID_ID.test(taskId)) return null;

    const isTasksRoute = parsed.hostname === "tasks" || parsed.pathname === "/tasks";
    if (isTasksRoute) return { screen: "task", taskId };
  } catch (e) {
    if (__DEV__) console.warn("resolveDeepLink: failed to parse URL", url, e);
  }

  return null;
}
