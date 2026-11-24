import test from "node:test";
import assert from "node:assert/strict";
import { amountFor, catalogFor, dates, lineErrors, newLine, parseCents, requestErrors } from "../src/domain.js";
import { MEMBERS, ORGANISATIONS } from "../src/data.js";
const diagnoses = [{ code: "K02.9", rank: "Primary" }];
test("Manila dates cross UTC midnight correctly", () => {
  assert.deepEqual(dates(new Date("2026-11-24T16:01:00Z")), ["2026-11-25", "2026-11-26", "2026-11-27"]);
});
test("Money parsing rejects fractions beyond cents and non-numeric input", () => {
  assert.equal(parseCents("2450.09"), 245009); assert.equal(parseCents("0.01"), 1);
  for (const value of ["1.001", "-1", "1e3", "", "NaN"]) assert.equal(parseCents(value), null);
});
test("Doctor-specific catalogues retain eligible procedures only", () => {
  assert(catalogFor("d1", "DENT").some((p) => p.code === "DEMO-D06"));
  assert(!catalogFor("d2", "DENT").some((p) => p.code === "DEMO-D06"));
  assert.equal(catalogFor("m1", "DENT").length, 0);
  assert(!catalogFor("m2", "OPCON").some((p) => p.group === "RVS"));
});
test("Stale prices, unresolved rates and invalid quantities never show a number", () => {
  const line = newLine("m1", diagnoses, { code: "DEMO-M01" }); assert.equal(amountFor(line), 45000);
  assert.equal(amountFor({ ...line, stale: true }), null);
  assert.equal(amountFor({ ...line, quantity: "abc" }), null);
  assert.equal(amountFor({ ...line, code: "DEMO-M08" }), null);
});
test("PAC is a total charge, independent of quantity", () => {
  const line = newLine("m1", diagnoses, { code: "DEMO-M05", quantity: "3", charge: "2450.50" });
  assert.equal(amountFor(line), 245050); assert.deepEqual(lineErrors(line, "OLP", MEMBERS[0]), []);
  assert(lineErrors({ ...line, charge: "" }, "OLP", MEMBERS[0]).some((error) => error.includes("positive total charge")));
});
test("Dental history and site requiredness block invalid sample lines", () => {
  const line = newLine("d1", diagnoses, { code: "DEMO-D03", site: "26" });
  assert(lineErrors(line, "DENT", MEMBERS[0]).some((error) => error.includes("previously extracted")));
  assert(lineErrors({ ...line, site: "" }, "DENT", MEMBERS[0]).some((error) => error.includes("Select one tooth")));
  assert.deepEqual(lineErrors({ ...line, site: "16" }, "DENT", MEMBERS[0]), []);
});
test("RVS roles stay distinct and require a laterality modifier", () => {
  const line = newLine("m2", diagnoses, { code: "DEMO-R01", assistant: "m2" });
  const errors = lineErrors(line, "OLP", MEMBERS[0]);
  assert(errors.some((error) => error.includes("different doctors")));
  assert(errors.some((error) => error.includes("modifier")));
});
test("Organisation Dental access and member benefit are independent", () => {
  const form = { org: ORGANISATIONS[1], type: "DENT", attending: "d1", date: dates()[0], diagnoses, member: MEMBERS[2], lines: [newLine("d1", diagnoses, { code: "DEMO-D01" })], files: [], complaint: "" };
  const errors = requestErrors(form);
  assert(errors.some((error) => error.includes("organisation")));
  assert(errors.some((error) => error.includes("no Dental benefit")));
});
test("Repeated procedures are allowed on different teeth but not the same site", () => {
  const line = newLine("d1", diagnoses, { code: "DEMO-D03", site: "16" });
  const form = { org: ORGANISATIONS[0], type: "DENT", attending: "d1", date: dates()[0], diagnoses, member: MEMBERS[0], lines: [line, { ...line, id: "second", site: "17" }], files: [], complaint: "" };
  assert.deepEqual(requestErrors(form), []);
  assert(requestErrors({ ...form, lines: [line, { ...line, id: "second" }] }).some((error) => error.includes("Duplicate")));
});
