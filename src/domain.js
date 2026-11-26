import { chiefComplaintError, contactErrors } from "./portalForm.js";
import { DIAGNOSES, DOCTORS, PROCEDURES, QUADRANTS, TOOTH_CHARTS, ROOM_TYPES, FIXED_ROOM_TYPES } from "./data.js";
export const money = (cents) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(cents / 100);
export const doctorName = (id) => DOCTORS.find((doctor) => doctor.id === id)?.name ?? "Choose doctor";
export const doctorSpecialty = (id) => DOCTORS.find((doctor) => doctor.id === id)?.specialty ?? "Select a doctor to view specialty";
export const procedureFor = (line) => PROCEDURES.find((procedure) => procedure.code === line.code);
// Match the portal's room-code / hierarchy-name filtering, independently of laterality.
export function roomTypeOptions(line, type) {
  const procedure = procedureFor(line);
  if (!procedure || type === "OPCON") return [];
  if (FIXED_ROOM_TYPES[type]) return [FIXED_ROOM_TYPES[type]];
  const normalize = (value) => String(value ?? "").trim().toLowerCase();
  const modifiers = procedure.roomModifiers ?? [];
  const codes = new Set(modifiers.map((modifier) => normalize(modifier.code)).filter(Boolean));
  const descriptions = new Set(modifiers.map((modifier) => normalize(modifier.descr)).filter(Boolean));
  return ROOM_TYPES.filter((room) => codes.has(normalize(room.value)) || codes.has(normalize(room.roomHierarchyLabel)) || descriptions.has(normalize(room.roomHierarchyLabel)));
}
export function roomTypeFor(line, type) {
  const options = roomTypeOptions(line, type);
  return FIXED_ROOM_TYPES[type] ? options[0] : options.find((room) => room.value === line.providerRoomTypeCode);
}
export function alignRoomLine(line, type) {
  const room = roomTypeFor(line, type);
  return { ...line, providerRoomTypeCode: room?.value ?? "", providerRoomType: room?.roomHierarchyLabel ?? room?.value ?? "" };
}
export const toothChartFor = (line) => TOOTH_CHARTS[line.dentition ?? "permanent"];
export const siteLabel = (line) => !line.site ? "" : procedureFor(line)?.site === "tooth" ? "Tooth " + line.site + " · " + (toothChartFor(line)?.label ?? "Choose dental chart") : "Quadrant " + line.site;
export function ageAtDate(dob, date) {
  if (!dob || !date || dob > date) return null;
  const age = Number(date.slice(0, 4)) - Number(dob.slice(0, 4)) - (date.slice(5) < dob.slice(5) ? 1 : 0);
  return Number.isFinite(age) ? age : null;
}
export const seniorEligible = ({ member, date }) => (ageAtDate(member?.dob, date) ?? -1) >= 60;
// Demo assumption for review point 7; not an approved clinical or business rule.
export const PERMANENT_TEETH_AGE = 12;
export function dentitionFor(member, date) {
  const age = ageAtDate(member?.dob, date);
  return age === null ? null : age < PERMANENT_TEETH_AGE ? "temporary" : "permanent";
}
export function alignDentalLine(line, member, date) {
  const ageDefault = dentitionFor(member, date);
  if (!ageDefault) return line;
  const dentitionOverride = line.dentitionMemberId === member.id && TOOTH_CHARTS[line.dentitionOverride] ? line.dentitionOverride : null;
  const dentition = dentitionOverride ?? ageDefault;
  const invalidTooth = Boolean(line.site && procedureFor(line)?.site === "tooth" && !TOOTH_CHARTS[dentition].rows.flat().map(String).includes(line.site));
  return { ...line, dentition, dentitionOverride, dentitionMemberId: dentitionOverride ? member.id : null, site: invalidTooth ? "" : line.site, stale: line.stale || invalidTooth };
}
export function usedTeeth(lines, editingId) {
  return lines.filter((line) => line.id !== editingId && procedureFor(line)?.site === "tooth" && line.site).map((line) => line.site);
}
export function duplicateLineError(line, lines) {
  if (line.site && procedureFor(line)?.site === "tooth" && usedTeeth(lines, line.id).includes(line.site)) return "Duplicate tooth: Tooth " + line.site + " is already used by another procedure. Select a different tooth.";
  if (procedureFor(line)?.group === "RVS") return null;
  if (line.code && lines.some((other) => other.id !== line.id && other.code === line.code && other.site === line.site)) return "Duplicate procedure and site: select a different site or remove the duplicate.";
  return null;
}
export function dates(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type).value;
  const today = `${value("year")}-${value("month")}-${value("day")}`;
  return [0, 1, 2].map((offset) => new Date(Date.parse(today + "T00:00:00Z") + offset * 86400000).toISOString().slice(0, 10));
}
export const dateLabel = (value) => new Date(value + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export function parseCents(value) {
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(String(value))) return null;
  const [whole, fraction = ""] = String(value).split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
export const catalogFor = (doctorId, type, consultationType) => PROCEDURES.filter((procedure) => procedure.doctors.includes(doctorId) && procedure.types.includes(type) && (type !== "OPCON" || !consultationType || procedure.consultationType === consultationType));
export function selectableProcedures(doctorId, type, lines, editingId, consultationType) {
  return catalogFor(doctorId, type, consultationType).filter((procedure) => procedure.group === "RVS" || procedure.site !== "none" || !lines.some((line) => line.id !== editingId && line.code === procedure.code));
}
export const ER_EXCLUDED_DIAGNOSES = new Set(["Z00.0", "Z02.1", "Z99.7", "Z71.1"]);
export const nextDiagnosisRank = (diagnoses) => !diagnoses.length ? "Primary" : diagnoses.length === 1 ? "Secondary" : "Other Diagnosis";
export const showTodayLabel = (type) => ["IP", "OLP", "OPCON", "DENT"].includes(type);
// Seed only an empty initial-consultation diagnosis list; retain clinical choices.
// The portal permits replacing/removing this default, so it is not reapplied on every render.
export function consultationDefaults(state) {
  const initial = state.type === "OPCON" && state.consultationType === "Initial";
  let diagnoses = state.diagnoses.filter((dx) => initial || dx.defaultFor !== "Initial");
  if (state.type === "EMERG") diagnoses = diagnoses.filter((dx) => !ER_EXCLUDED_DIAGNOSES.has(dx.code));
  if (initial && !diagnoses.length) diagnoses = [{ ...DIAGNOSES.find((dx) => dx.code === "Z71.1"), rank: "Primary", defaultFor: "Initial" }];
  if (diagnoses.length && !diagnoses.some((dx) => dx.rank === "Primary")) diagnoses = diagnoses.map((dx, i) => i ? dx : { ...dx, rank: "Primary" });
  const codes = diagnoses.map((dx) => dx.code);
  const added = codes.filter((code) => !state.diagnoses.some((dx) => dx.code === code));
  return { ...state, diagnoses, lines: state.lines.map((line) => ({ ...line, diagnoses: [...line.diagnoses.filter((code) => codes.includes(code)), ...added] })) };
}
export function newLine(doctorId, diagnoses, seed = {}) {
  return { id: crypto.randomUUID(), doctorId, code: "", site: "", dentition: "permanent", dentitionOverride: null, dentitionMemberId: null, modifier: "", providerRoomTypeCode: "", providerRoomType: "", quantity: "1", charge: "", diagnoses: diagnoses.map((d) => d.code), stale: false, deductions: {}, ...seed };
}
export function amountFor(line) {
  const procedure = procedureFor(line);
  if (!procedure || line.stale || procedure.pricing === "conflict") return null;
  if (procedure.pricing === "pac") return parseCents(line.charge);
  if (!/^\d{1,2}$/.test(line.quantity) || Number(line.quantity) < 1) return null;
  return (procedure.cents + (line.doctorId === "d2" ? 10000 : 0)) * Number(line.quantity || 0);
}
export const DEDUCTION_NAMES = ["PhilHealth", "Senior Citizen", "PWD discount", "Other discount"];
export function deductionTotal(line) {
  const amounts = Object.values(line.deductions).map(parseCents);
  return amounts.some((amount) => amount === null) ? null : amounts.reduce((sum, amount) => sum + amount, 0);
}
const sumAmounts = (values) => values.some((amount) => amount === null) ? null : values.reduce((sum, amount) => sum + amount, 0);
export function requestAmounts(lines) {
  const deductions = Object.fromEntries([...new Set([...DEDUCTION_NAMES, ...lines.flatMap((line) => Object.keys(line.deductions))])].map((name) => [name, sumAmounts(lines.filter((line) => Object.hasOwn(line.deductions, name)).map((line) => parseCents(line.deductions[name])))]));
  const scheduled = sumAmounts(lines.filter((line) => procedureFor(line)?.pricing !== "pac").map(amountFor));
  const charged = sumAmounts(lines.filter((line) => procedureFor(line)?.pricing === "pac").map(amountFor));
  const totalDeductions = sumAmounts(Object.values(deductions));
  return { scheduled, charged, deductions, totalDeductions, totalLoa: scheduled === null || charged === null || totalDeductions === null ? null : scheduled + charged - totalDeductions };
}
export function deductionOptions(_line, { type, member, date }) {
  const options = [];
  if (["DENT", "IP", "EMERG", "OLP"].includes(type)) options.push("PhilHealth");
  if (seniorEligible({ member, date })) options.push("Senior Citizen");
  return [...options, "PWD discount", "Other discount"];
}
export function lineErrors(line, type, member, context) {
  const errors = [];
  const procedure = procedureFor(line);
  if (!line.doctorId) errors.push("Select a procedure doctor.");
  if (!procedure) return [...errors, "Select a procedure."];
  if (!catalogFor(line.doctorId, type, context?.consultationType).some((entry) => entry.code === line.code)) errors.push("This procedure is unavailable for the selected doctor, LOA type or consultation type.");
  if (context?.lines) {
    const duplicate = duplicateLineError(line, context.lines);
    if (duplicate) errors.push(duplicate);
  }
  if (line.stale) errors.push("Reconfirm this procedure after changing the doctor or request context.");
  if (!line.diagnoses.length) errors.push("Keep at least one diagnosis on this line.");
  if (context?.diagnoses && line.diagnoses.some((code) => !context.diagnoses.some((dx) => dx.code === code))) errors.push("Select diagnoses from the current request.");
  if (type === "EMERG" && line.diagnoses.some((code) => ER_EXCLUDED_DIAGNOSES.has(code))) errors.push("Select an applicable Emergency diagnosis.");
  if (procedure.site !== "none" && !line.site) errors.push("Select one " + procedure.site + ".");
  if (type === "DENT" && procedure.site === "tooth") {
    if (!dentitionFor(member, context?.date ?? dates()[0])) errors.push("Verify the member and availment date before selecting a dental site.");
    if (!toothChartFor(line)) errors.push("Select a Permanent or Temporary dental chart.");
  }
  if (procedure.site === "tooth" && line.site && !toothChartFor(line)?.rows.flat().map(String).includes(line.site)) errors.push("Select a tooth from the selected dental chart.");
  if (procedure.site === "quadrant" && line.site && !QUADRANTS.some((quadrant) => quadrant.value === line.site)) errors.push("Select a valid dental quadrant.");
  if (procedure.site === "tooth" && member?.extracted?.includes(line.site)) errors.push("This tooth is marked as previously extracted in the demo history.");
  if (line.providerRoomTypeCode && !roomTypeOptions(line, type).some((room) => room.value === line.providerRoomTypeCode)) errors.push("Select an available room type for this procedure and LOA type.");
  if (procedure.modifiers?.length && !procedure.modifiers.includes(line.modifier)) errors.push("Select an applicable modifier.");
  if (!/^\d{1,2}$/.test(line.quantity) || Number(line.quantity) < 1) errors.push("Quantity must be a whole number from 1 to 99.");
  if (type === "DENT" && line.quantity !== "1") errors.push("Use one Dental service per line in this demo.");
  if (procedure.pricing === "pac" && !(parseCents(line.charge) > 0)) errors.push("Enter a positive total charge with at most two decimal places.");
  if (procedure.pricing === "conflict") errors.push("Pricing conflict: no confirmed rate. Choose another procedure to complete this demo.");
  Object.entries(line.deductions).forEach(([name, amount]) => { if (context && !deductionOptions(line, context).includes(name)) errors.push("Remove " + name + ": no longer applicable to this request."); if (!(parseCents(amount) > 0)) errors.push("Enter a positive " + name + " amount."); });
  return errors;
}
export function requestErrors(state) {
  const result = Object.values(contactErrors(state)).filter(Boolean);
  const complaintError = chiefComplaintError(state);
  if (complaintError) result.push(complaintError);
  if (!state.requesterName?.trim()) result.push("Enter the LOA requester name.");
  if (!state.department?.trim()) result.push("Enter the requester department.");
  if (state.type === "OPCON" && !state.consultationType) result.push("Select a consultation type.");
  if (state.type === "DENT" && !state.org.dental) result.push("Dental is unavailable for this organisation.");
  if (!state.attending) result.push("Select a requesting / attending doctor.");
  if (!state.member) result.push("Find a member using the sample card number and date of birth.");
  if (state.type === "DENT" && state.member && !state.member.dental) result.push("This sample member has no Dental benefit. Use Alina or Daniel for the Dental journey.");
  if (!dates().includes(state.date)) result.push("Choose a date within the displayed three-day window in Philippine time.");
  if (!state.diagnoses.length) result.push("Add at least one diagnosis before procedures.");
  if (!state.lines.length) result.push("Add at least one procedure line.");
  if (state.lines.some((line) => procedureFor(line)?.pricing === "pac") && !state.remarks?.trim()) result.push("Enter remarks for the Price As Charged procedure(s).");
  state.lines.forEach((line, index) => lineErrors(line, state.type, state.member, state).forEach((message) => result.push("Line " + (index + 1) + ": " + message)));
  if (["IP", "OLP"].includes(state.type) && !state.files.length) result.push("Add a supporting document; the sample document button works without uploading a file.");
  return result;
}
