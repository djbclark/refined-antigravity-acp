import { afterEach, describe, expect, it } from "vitest";
import { spawnRawAgy, spawnWrapped, type AcpTestClient } from "../../test-utils/index.js";

describe("flattened-model-efforts e2e", () => {
  const activeClients: AcpTestClient[] = [];

  afterEach(async () => {
    while (activeClients.length > 0) {
      const client = activeClients.pop();
      if (client) await client.close().catch(() => {});
    }
  });

  it("verified: raw agy binary natively provides clean models and thinking_level option in ACP >= 1.4.0", async () => {
    const rawClient = await spawnRawAgy();
    activeClients.push(rawClient);
    await rawClient.initialize();
    const res = await rawClient.newSession();

    const configOptions =
      (res.configOptions as Array<{ id?: string; options?: Array<{ value?: string }> }>) ?? [];
    const thinkingOpt = configOptions.find((o) => o.id === "thinking_level");
    expect(thinkingOpt).toBeDefined();
    expect(thinkingOpt?.options?.map((o) => o.value)).toEqual(["low", "medium", "high"]);

    const modelOpt = configOptions.find((o) => o.id === "model");
    expect(modelOpt).toBeDefined();
    const hasFlattened = modelOpt?.options?.some(
      (opt) => opt.value?.endsWith("-high") || opt.value?.endsWith("-low"),
    );
    expect(hasFlattened).toBe(false);

    await rawClient.close();
  });

  it("solution: wrapped connector cleanly passes through native models and thinking_level option", async () => {
    const wrappedClient = await spawnWrapped();
    activeClients.push(wrappedClient);
    await wrappedClient.initialize();
    const res = await wrappedClient.newSession();

    const configOptions =
      (res.configOptions as Array<{ id?: string; options?: Array<{ value?: string }> }>) ?? [];
    const thinkingOpt = configOptions.find((o) => o.id === "thinking_level");
    expect(thinkingOpt).toBeDefined();
    expect(thinkingOpt?.options?.map((o) => o.value)).toEqual(["low", "medium", "high"]);

    const modelOpt = configOptions.find((o) => o.id === "model");
    expect(modelOpt).toBeDefined();
    const hasFlattened = modelOpt?.options?.some(
      (opt) => opt.value?.endsWith("-high") || opt.value?.endsWith("-low"),
    );
    expect(hasFlattened).toBe(false);

    await wrappedClient.close();
  });
});
