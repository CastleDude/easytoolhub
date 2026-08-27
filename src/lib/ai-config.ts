import { readStore, writeStore } from "./db";

export interface AiConfig {
  deepseekApiKey: string;
}

const STORE = "ai-config";

/** Read the admin-configured AI settings (git-untracked file). */
export function getAiConfig(): AiConfig {
  return readStore<AiConfig>(STORE)[0] || { deepseekApiKey: "" };
}

export async function saveAiConfig(config: AiConfig): Promise<void> {
  await writeStore(STORE, [config]);
}
