import { validateProspect, filterProspectsBySearch } from "../prospect-helpers";

describe("prospect creation validation", () => {
  test("rejects a blank company name", () => {
    const result = validateProspect({
      companyName: "",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Company name is required");
  });

  test("rejects a blank role title", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Role title is required");
  });
});

describe("salary validation", () => {
  test("accepts a valid positive salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: 120000,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts zero as a salary value", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: 0,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a missing salary (field absent)", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a null salary (explicitly unset)", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects a non-numeric salary string", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: "lots" as unknown as number,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a valid number");
  });

  test("rejects a negative salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: -5000,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a positive number");
  });

  test("rejects a non-integer salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: 99999.99 as unknown as number,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a valid number");
  });
});

describe("search filtering", () => {
  const prospects = [
    { companyName: "Google", roleTitle: "Software Engineer" },
    { companyName: "Meta", roleTitle: "Product Manager" },
    { companyName: "Apple", roleTitle: "Designer" },
    { companyName: "Amazon", roleTitle: "Software Engineer" },
  ];

  test("filters by company name", () => {
    const result = filterProspectsBySearch(prospects, "Google");
    expect(result).toHaveLength(1);
    expect(result[0].companyName).toBe("Google");
  });

  test("filters by role title", () => {
    const result = filterProspectsBySearch(prospects, "Designer");
    expect(result).toHaveLength(1);
    expect(result[0].companyName).toBe("Apple");
  });

  test("is case-insensitive", () => {
    const result = filterProspectsBySearch(prospects, "google");
    expect(result).toHaveLength(1);
    expect(result[0].companyName).toBe("Google");
  });

  test("returns multiple matches", () => {
    const result = filterProspectsBySearch(prospects, "Software Engineer");
    expect(result).toHaveLength(2);
  });

  test("returns empty array when no match", () => {
    const result = filterProspectsBySearch(prospects, "Netflix");
    expect(result).toHaveLength(0);
  });

  test("returns all prospects for empty query", () => {
    const result = filterProspectsBySearch(prospects, "");
    expect(result).toHaveLength(4);
  });

  test("returns all prospects for whitespace-only query", () => {
    const result = filterProspectsBySearch(prospects, "   ");
    expect(result).toHaveLength(4);
  });
});
