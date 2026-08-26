import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchElections, fetchCandidates, fetchStations, fetchUsers } from "./api";

describe("paginated api helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it("fetchElections builds pagination QS and returns envelope when paginated", async () => {
    const payload = { elections: [{ id: 1 }], data: [{ id: 1 }], pagination: { page: 1, limit: 10, total: 1, total_pages: 1 } };
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(payload),
      json: async () => payload,
      clone: () => ({ json: async () => payload }),
    });
    const data = await fetchElections({ page: 1, limit: 10, search: "test" });
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("search=test");
    expect(data.pagination).toBeDefined();
  });

  it("fetchElections returns array when no pagination opts", async () => {
    const payload = { elections: [{ id: 1, name: "A" }] };
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(payload),
      json: async () => payload,
      clone: () => ({ json: async () => payload }),
    });
    const data = await fetchElections();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].name).toBe("A");
  });

  it("fetchUsers sends auth header", async () => {
    localStorage.setItem("seis_token", "tok123");
    const payload = { users: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0 } };
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(payload),
      json: async () => payload,
      clone: () => ({ json: async () => payload }),
    });
    await fetchUsers({ page: 1, limit: 5 });
    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("Bearer tok123");
  });

  it("throws on error response", async () => {
    const payload = { error: "failed" };
    global.fetch.mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify(payload),
      json: async () => payload,
      clone: () => ({ json: async () => payload }),
    });
    await expect(fetchCandidates()).rejects.toThrow("failed");
  });
});
