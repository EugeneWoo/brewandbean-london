import { describe, it, expect } from "vitest";
import { coffeeShops, isIndependentVerified } from "@/data/coffeeShops";

describe("isIndependentVerified", () => {
  it("should verify independent shops with good ratings", () => {
    const monmouth = coffeeShops.find((s) => s.id === "monmouth-bermondsey")!;
    expect(isIndependentVerified(monmouth)).toBe(true);
  });

  it("should reject chain shops (Costa)", () => {
    const costa = coffeeShops.find((s) => s.id === "costa-waterloo")!;
    expect(costa).toBeDefined();
    expect(isIndependentVerified(costa)).toBe(false);
  });

  it("should reject shops with >5 locations", () => {
    const multi = coffeeShops.find((s) => s.id === "generic-multi-site")!;
    expect(multi).toBeDefined();
    expect(isIndependentVerified(multi)).toBe(false);
  });
});
