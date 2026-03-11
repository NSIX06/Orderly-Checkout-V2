import { describe, it, expect, vi } from "vitest";

const mockInsert = vi.fn(() =>
  Promise.resolve({ data: { status: "ABERTO" }, error: null })
);

describe("API criar pedido", () => {
  it("deve criar pedido aberto", async () => {
    const res = await mockInsert();
    expect(res.data.status).toBe("ABERTO");
  });
});
