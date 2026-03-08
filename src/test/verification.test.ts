import { describe, it, expect } from "vitest";
import { coffeeShops, isIndependentVerified } from "@/data/coffeeShops";

describe("isIndependentVerified", () => {
  it("should verify independent shops with good ratings", () => {
    const monmouth = coffeeShops.find((s) => s.id === "monmouth-borough")!;
    expect(isIndependentVerified(monmouth)).toBe(true);
  });

  it("should reject chain shops (Costa)", () => {
    const costa = coffeeShops.find((s) => s.id === "costa-waterloo")!;
    expect(costa).toBeDefined();
    expect(isIndependentVerified(costa)).toBe(false);
  });

  it("should reject shops with >5 locations (Redemption)", () => {
    const redemption = coffeeShops.find((s) => s.id === "redemption-covent-garden")!;
    expect(redemption).toBeDefined();
    expect(isIndependentVerified(redemption)).toBe(false);
  });
});
