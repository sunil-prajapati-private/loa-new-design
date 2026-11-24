import { canEnterClaimAmount, claimAmount, claimErrors, claimSample } from '../src/claimDomain.js';
import test from "node:test";
import assert from "node:assert/strict";
import { deductionOptions, amountFor, catalogFor, dates, lineErrors, newLine, parseCents, requestErrors } from "../src/domain.js";
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
test("Stale prices, missing procedures and invalid quantities never show a number", () => {
  const line = newLine("m1", diagnoses, { code: "DEMO-M01" }); assert.equal(amountFor(line), 45000);
  assert.equal(amountFor({ ...line, stale: true }), null);
  assert.equal(amountFor({ ...line, quantity: "abc" }), null);
  assert.equal(amountFor({ ...line, code: "UNKNOWN-PROCEDURE" }), null);
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

test('OP Lab PhilHealth depends on class or this line, not another RVS line', () => {
  const context = { type: 'OLP', medicalClass: 'MEDICAL', date: '2026-11-24' };
  assert.equal(deductionOptions({ code: 'DEMO-M01' }, context).includes('PhilHealth'), false);
  assert.equal(deductionOptions({ code: 'DEMO-R01' }, context).includes('PhilHealth'), true);
  assert.equal(deductionOptions({ code: 'DEMO-M01' }, { ...context, medicalClass: 'SURGICAL' }).includes('PhilHealth'), true);
  assert.equal(deductionOptions({ code: 'DEMO-D01' }, { ...context, type: 'DENT' }).includes('PhilHealth'), false);
});

test('Senior Citizen requires age at availment, citizenship and an eligible LOA type', () => {
  const context = { type: 'OLP', date: '2026-11-24', member: { dob: '1966-11-25', citizenship: 'Filipino' } };
  const line = { code: 'DEMO-M01' };
  assert.equal(deductionOptions(line, context).includes('Senior Citizen'), false);
  assert.equal(deductionOptions(line, { ...context, date: '2026-11-25' }).includes('Senior Citizen'), true);
  assert.equal(deductionOptions(line, { ...context, date: '2026-11-25', member: { dob: '1966-11-25' } }).includes('Senior Citizen'), false);
  assert.equal(deductionOptions(line, { ...context, date: '2026-11-25', type: 'DENT' }).includes('Senior Citizen'), false);
});

test('Previously entered deductions cannot pass review after eligibility changes', () => {
  const line = newLine('m1', diagnoses, { code: 'DEMO-M01', deductions: { PhilHealth: '100' } });
  assert(lineErrors(line, 'OLP', MEMBERS[0], { type: 'OLP', medicalClass: 'MEDICAL', member: MEMBERS[0], date: '2026-11-24' }).some(message => message.includes('Remove PhilHealth')));
});

test('Claim amount entry distinguishes missing source from an existing zero', () => {
  assert.equal(canEnterClaimAmount({sourceAmount:0}), false);
  assert.equal(claimAmount({sourceAmount:0,entered:'500'}), 0);
  assert.equal(claimAmount({sourceAmount:null,entered:'1250.50'}),125050);
  assert.equal(claimAmount({sourceAmount:null,entered:'-1'}),null);
  assert.equal(claimAmount({sourceAmount:null,entered:''}),null);
});
test('Claim review requires service date, amounts and documents and blocks zero-covered consultation', () => {
  const claim=claimSample('entry');
  assert.equal(claimErrors(claim,'',[]).length,3);
  claim.lines[1].entered='0';
  assert.deepEqual(claimErrors(claim,claim.date,[{}]),[]);
  assert(claimErrors(claimSample('blocked'),claim.date,[{}]).some(x=>x.includes('Manual adjudication')));
  assert(claimErrors({...claim,eligible:false},claim.date,[{}]).some(x=>x.includes('unavailable')));
});
