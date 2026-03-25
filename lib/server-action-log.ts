function newActionId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isFailResult(value: unknown): value is { success: false; message?: string } {
  return (
    value !== null &&
    typeof value === "object" &&
    "success" in value &&
    (value as { success: unknown }).success === false
  );
}

export async function withActionLog<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const id = newActionId();
  console.log("[action]", id, name, "start");
  try {
    const out = await fn();
    if (isFailResult(out)) {
      console.warn("[action]", id, name, "fail", out.message ?? "");
    } else {
      console.log("[action]", id, name, "ok");
    }
    return out;
  } catch (error) {
    console.error("[action]", id, name, "error", error);
    throw error;
  }
}
