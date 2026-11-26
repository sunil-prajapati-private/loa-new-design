import { CHIEF_COMPLAINTS, chiefComplaintLabel, contactErrors } from "../src/portalForm.js";
import { canEnterClaimAmount, claimAmount, claimErrors, claimSample } from '../src/claimDomain.js';
import test from "node:test";
import assert from "node:assert/strict";
import { ageAtDate, alignDentalLine, dentitionFor, duplicateLineError, usedTeeth, seniorEligible, siteLabel, deductionOptions, deductionTotal, requestAmounts, amountFor, catalogFor, dates, lineErrors, newLine, parseCents, requestErrors } from "../src/domain.js";
import { MEMBERS, ORGANISATIONS, TOOTH_CHARTS } from "../src/data.js";
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
  const form = { requesterName: "Jamie Cruz", department: "Patient services", org: ORGANISATIONS[1], type: "DENT", attending: "d1", date: dates()[0], diagnoses, member: MEMBERS[2], lines: [newLine("d1", diagnoses, { code: "DEMO-D01" })], files: [], complaint: "" };
  const errors = requestErrors(form);
  assert(errors.some((error) => error.includes("organisation")));
  assert(errors.some((error) => error.includes("no Dental benefit")));
});
test("Repeated procedures are allowed on different teeth but not the same site", () => {
  const line = newLine("d1", diagnoses, { code: "DEMO-D03", site: "16" });
  const form = { requesterName: "Jamie Cruz", department: "Patient services", org: ORGANISATIONS[0], type: "DENT", attending: "d1", date: dates()[0], diagnoses, member: MEMBERS[0], lines: [line, { ...line, id: "second", site: "17" }], files: [], complaint: "" };
  assert.deepEqual(requestErrors(form), []);
  assert(requestErrors({ ...form, lines: [line, { ...line, id: "second" }] }).some((error) => error.includes("Duplicate")));
});

test('PhilHealth is available on every Dental, OP Lab, IP and ER line', () => {
  for (const type of ['DENT', 'OLP', 'IP', 'EMERG']) {
    for (const medicalClass of ['MEDICAL', 'SURGICAL']) {
      assert(deductionOptions({ code: 'DEMO-M01' }, { type, medicalClass }).includes('PhilHealth'));
    }
  }
  for (const type of ['OPCON', 'ACU', 'PEME']) assert(!deductionOptions({}, { type }).includes('PhilHealth'));
});

test('Senior Citizen enables from the 60th birthday for every LOA type regardless of citizenship', () => {
  const member = { dob: '1966-11-25' };
  for (const type of ['DENT', 'OPCON', 'OLP', 'IP', 'EMERG', 'ACU', 'PEME']) {
    assert.equal(deductionOptions({}, { type, member, date: '2026-11-24' }).includes('Senior Citizen'), false);
    assert.equal(deductionOptions({}, { type, member, date: '2026-11-25' }).includes('Senior Citizen'), true);
  }
  assert.equal(seniorEligible({ member: { ...member, citizenship: 'Other' }, date: '2026-11-25' }), true);
  assert.equal(seniorEligible({ date: '2026-11-25' }), false);
  assert.equal(ageAtDate('2030-01-01', '2026-11-25'), null);
});

test('Previously entered deductions cannot pass review after eligibility changes', () => {
  const line = newLine('m1', diagnoses, { code: 'DEMO-M01', deductions: { PhilHealth: '100' } });
  assert(lineErrors(line, 'OLP', MEMBERS[0], { type: 'OPCON', medicalClass: 'MEDICAL', member: MEMBERS[0], date: '2026-11-24' }).some(message => message.includes('Remove PhilHealth')));
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


test('Requester name and department are mandatory; contacts remain optional', () => {
  const form = { org: ORGANISATIONS[0], type: 'DENT', attending: 'd1', date: dates()[0], diagnoses, member: MEMBERS[0], lines: [newLine('d1', diagnoses, { code: 'DEMO-D01' })], files: [], complaint: '' };
  assert.deepEqual(requestErrors(form), ['Enter the LOA requester name.', 'Enter the requester department.']);
  assert.deepEqual(requestErrors({ ...form, requesterName: 'Jamie', department: 'Patient services' }), []);
  assert(requestErrors({ ...form, requesterName: '  ', department: 'Patient services' }).includes('Enter the LOA requester name.'));
});

test('PAC requires meaningful remarks without affecting scheduled-only requests', () => {
  const form = { requesterName: 'Jamie', department: 'Patient services', org: ORGANISATIONS[1], type: 'OLP', attending: 'm1', date: dates()[0], diagnoses, member: MEMBERS[0], lines: [newLine('m1', diagnoses, { code: 'DEMO-M05', charge: '1200' })], files: [{}], complaint: '' };
  assert(requestErrors({ ...form, remarks: '  ' }).some(message => message.includes('Enter remarks')));
  assert.deepEqual(requestErrors({ ...form, remarks: 'Additional laboratory charge' }), []);
  assert.deepEqual(requestErrors({ ...form, lines: [newLine('m1', diagnoses, { code: 'DEMO-M01' })] }), []);
});


test('Request summary keeps agreed CPT amounts, PAC charges and itemized deductions separate', () => {
  const lines = [
    newLine('m1', diagnoses, { code: 'DEMO-M01', quantity: '2', deductions: { PhilHealth: '100.25', 'PWD discount': '20.50' } }),
    newLine('m1', diagnoses, { code: 'DEMO-M05', charge: '2000.75', deductions: { PhilHealth: '50', 'Other discount': '10.10' } }),
  ];
  const summary = requestAmounts(lines);
  assert.equal(summary.scheduled, 90000);
  assert.equal(summary.charged, 200075);
  assert.equal(summary.deductions.PhilHealth, 15025);
  assert.equal(summary.deductions['Senior Citizen'], 0);
  assert.equal(summary.totalDeductions, 18085);
  assert.equal(summary.covered, 71915);
  assert.equal(deductionTotal(lines[0]), 12075);
});

test('Incomplete charges or deductions stay pending instead of displaying partial totals', () => {
  const stale = newLine('m1', diagnoses, { code: 'DEMO-M01', stale: true });
  const pending = newLine('m1', diagnoses, { code: 'DEMO-M05', charge: '', deductions: { PhilHealth: '' } });
  const summary = requestAmounts([stale, pending]);
  assert.equal(summary.scheduled, null);
  assert.equal(summary.charged, null);
  assert.equal(summary.deductions.PhilHealth, null);
  assert.equal(summary.totalDeductions, null);
  assert.equal(summary.covered, null);
  assert.equal(deductionTotal(pending), null);
});


test('Permanent and temporary teeth have distinct quadrants and validate against their chart', () => {
  assert.equal(TOOTH_CHARTS.permanent.rows.flat().length, 32);
  assert.equal(TOOTH_CHARTS.temporary.rows.flat().length, 20);
  const temporary = newLine('d1', diagnoses, { code: 'DEMO-D03', dentition: 'temporary', site: '55' });
  assert.deepEqual(lineErrors(temporary, 'DENT', MEMBERS[3]), []);
  assert.equal(siteLabel(temporary), 'Tooth 55 · Temporary teeth');
  assert(lineErrors({ ...temporary, site: '16' }, 'DENT', MEMBERS[3]).some(message => message.includes('selected dental chart')));
  assert(lineErrors({ ...temporary, dentition: 'permanent' }, 'DENT', MEMBERS[3]).some(message => message.includes('selected dental chart')));
  assert.equal(siteLabel(newLine('d1', diagnoses, { code: 'DEMO-D06', dentition: 'temporary', site: 'UR' })), 'Quadrant UR · Temporary teeth');
});

test('A retained Senior Citizen deduction cannot pass after switching to a younger member', () => {
  const line = newLine('d1', diagnoses, { code: 'DEMO-D01', deductions: { 'Senior Citizen': '80' } });
  const context = { type: 'DENT', member: MEMBERS[0], date: dates()[0] };
  assert(lineErrors(line, 'DENT', MEMBERS[0], context).some(message => message.includes('Remove Senior Citizen')));
});

test('Covered amount follows the confirmed subtraction without silently clamping excess deductions', () => {
  const line = newLine('m1', diagnoses, { code: 'DEMO-M01', deductions: { PhilHealth: '500' } });
  assert.equal(requestAmounts([line]).covered, -5000);
  assert.deepEqual(requestAmounts([]), { scheduled: 0, charged: 0, deductions: { PhilHealth: 0, 'Senior Citizen': 0, 'PWD discount': 0, 'Other discount': 0 }, totalDeductions: 0, covered: 0 });
});


test('The demo dental chart switches on the 12th birthday at availment', () => {
  const member = { ...MEMBERS[3], dob: '2014-11-27' };
  assert.equal(dentitionFor(member, '2026-11-26'), 'temporary');
  assert.equal(dentitionFor(member, '2026-11-27'), 'permanent');
  assert.equal(dentitionFor(null, '2026-11-27'), null);
  const line = newLine('d1', diagnoses, { code: 'DEMO-D03', dentition: 'temporary', site: '55' });
  assert.deepEqual(alignDentalLine(line, member, '2026-11-26'), line);
  const changed = alignDentalLine(line, member, '2026-11-27');
  assert.equal(changed.dentition, 'permanent');
  assert.equal(changed.site, '');
  assert.equal(changed.stale, true);
  assert(lineErrors(line, 'DENT', member, { date: '2026-11-27' }).some(message => message.includes("member's age")));
});

test('A tooth cannot be reused across different procedures or doctors in one request', () => {
  const first = newLine('d1', diagnoses, { code: 'DEMO-D03', site: '16' });
  const second = newLine('d2', diagnoses, { code: 'DEMO-D07', site: '16' });
  const form = { requesterName: 'Jamie', department: 'Patient services', org: ORGANISATIONS[0], type: 'DENT', attending: 'd1', date: dates()[0], diagnoses, member: MEMBERS[0], lines: [first, second], files: [], complaint: '' };
  assert.match(duplicateLineError(second, form.lines), /Tooth 16 is already used/);
  assert(requestErrors(form).some(message => message.includes('Duplicate tooth')));
  assert.deepEqual(usedTeeth(form.lines, second.id), ['16']);
  assert.deepEqual(lineErrors(first, 'DENT', MEMBERS[0], { ...form, lines: [first] }), []);
  assert.equal(duplicateLineError(second, [second]), null);
  assert.equal(duplicateLineError({ ...second, site: '17' }, form.lines), null);
});

test('A member change replaces the chart and clears an incompatible saved tooth', () => {
  const first = newLine('d1', diagnoses, { code: 'DEMO-D03', site: '16' });
  const childLine = alignDentalLine(first, MEMBERS[3], dates()[0]);
  assert.equal(childLine.dentition, 'temporary');
  assert.equal(childLine.site, '');
  assert.equal(childLine.stale, true);
  const quadrant = newLine('d1', diagnoses, { code: 'DEMO-D06', site: 'UR' });
  assert.equal(alignDentalLine(quadrant, MEMBERS[3], dates()[0]).site, 'UR');
  assert.deepEqual(usedTeeth([quadrant], 'another-line'), []);
});


test('Optional contacts use the portal Philippine mobile and email rules', () => {
  assert.deepEqual(contactErrors({}), { mobile: null, email: null });
  assert.deepEqual(contactErrors({ mobile: '  ', email: '  ' }), { mobile: null, email: null });
  for (const mobile of ['09171234567', '+639171234567', '0917-123-4567', '+63 917 123 4567']) {
    assert.equal(contactErrors({ mobile }).mobile, null, mobile);
  }
  for (const mobile of ['12345', '08171234567', '+649171234567', '639171234567', '091712345678', '0917abc4567']) {
    assert.match(contactErrors({ mobile }).mobile, /valid Philippine mobile number/, mobile);
  }
  for (const email of ['user@example.com', 'first.last+tag@example.com', 'user@my-clinic.com.ph', ' USER@EXAMPLE.COM ']) {
    assert.equal(contactErrors({ email }).email, null, email);
  }
  for (const email of ['plainaddress', 'user@@example.com', '.user@example.com', 'user..name@example.com', 'user__name@example.com', 'user@domain..com', 'user@-domain.com', 'user@do_main.com', 'user@domain.c', 'user@domain.123', 'user name@example.com', 'user@a.b.c.com']) {
    assert.ok(contactErrors({ email }).email, email);
  }
  assert.equal(contactErrors({ email: 'a'.repeat(38) + '@example.com' }).email, null);
  assert.equal(contactErrors({ email: 'a'.repeat(39) + '@example.com' }).email, 'Email cannot exceed 50 characters');
});

test('Invalid optional contacts prevent request review until corrected or cleared', () => {
  const form = { requesterName: 'Jamie', department: 'Patient services', org: ORGANISATIONS[0], type: 'DENT', attending: 'd1', date: dates()[0], diagnoses, member: MEMBERS[0], lines: [newLine('d1', diagnoses, { code: 'DEMO-D01' })], files: [], complaint: '' };
  assert.deepEqual(requestErrors(form), []);
  assert.equal(requestErrors({ ...form, mobile: '123', email: 'jamie@' }).length, 2);
  assert.deepEqual(requestErrors({ ...form, mobile: '+639171234567', email: 'jamie@example.com' }), []);
  assert.deepEqual(requestErrors({ ...form, mobile: '', email: '' }), []);
});

test('Chief complaint accepts portal codes and shows descriptions in review', () => {
  const form = { requesterName: 'Jamie', department: 'Patient services', org: ORGANISATIONS[0], type: 'DENT', attending: 'd1', date: dates()[0], diagnoses, member: MEMBERS[0], lines: [newLine('d1', diagnoses, { code: 'DEMO-D01' })], files: [], complaint: '' };
  assert.equal(CHIEF_COMPLAINTS.length, 17);
  assert.equal(chiefComplaintLabel('09'), 'Accidents and Trauma');
  for (const option of CHIEF_COMPLAINTS) assert.deepEqual(requestErrors({ ...form, complaint: option.value }), []);
  for (const complaint of ['Fever', 'fever', '99']) assert(requestErrors({ ...form, complaint }).includes('Select a chief complaint from the list.'));
  for (const type of ['OPCON', 'IP', 'EMERG']) assert(requestErrors({ ...form, type }).includes('Select a chief complaint.'));
  for (const type of ['DENT', 'OLP', 'ACU', 'PEME']) assert(!requestErrors({ ...form, type }).includes('Select a chief complaint.'));
});
