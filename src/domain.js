import { DOCTORS, PROCEDURES } from "./data.js";
export const money = (cents) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(cents / 100);
export const doctorName = (id) => DOCTORS.find((doctor) => doctor.id === id)?.name ?? "Choose doctor";
export const procedureFor = (line) => PROCEDURES.find((procedure) => procedure.code === line.code);
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
export const catalogFor = (doctorId, type) => PROCEDURES.filter((procedure) => procedure.doctors.includes(doctorId) && procedure.types.includes(type));
export function newLine(doctorId, diagnoses, seed = {}) {
  return { id: crypto.randomUUID(), doctorId, code: "", site: "", modifier: "", quantity: "1", charge: "", diagnoses: diagnoses.map((d) => d.code), assistant: "", anesthetist: "", stale: false, deductions: {}, ...seed };
}
export function amountFor(line) {
  const procedure = procedureFor(line);
  if (!procedure || line.stale || procedure.pricing === "conflict") return null;
  if (procedure.pricing === "pac") return parseCents(line.charge);
  if (!/^\d{1,2}$/.test(line.quantity) || Number(line.quantity) < 1) return null;
  return (procedure.cents + (line.doctorId === "d2" ? 10000 : 0)) * Number(line.quantity || 0);
}
export function deductionOptions(line, { type, member, date, medicalClass }) {
  const options = [];
  if (["IP", "EMERG"].includes(type) || (type === "OLP" && (medicalClass === "SURGICAL" || procedureFor(line)?.group === "RVS"))) options.push("PhilHealth");
  const age = member?.dob && date ? Number(date.slice(0, 4)) - Number(member.dob.slice(0, 4)) - (date.slice(5) < member.dob.slice(5) ? 1 : 0) : 0;
  if (["IP", "EMERG", "OLP"].includes(type) && age >= 60 && member?.citizenship === "Filipino") options.push("Senior Citizen");
  return [...options, "PWD discount", "Other discount"];
}
export function lineErrors(line, type, member, context) {
  const errors = [];
  const procedure = procedureFor(line);
  if (!line.doctorId) errors.push("Select a procedure doctor.");
  if (!procedure) return [...errors, "Select a procedure."];
  if (!catalogFor(line.doctorId, type).some((entry) => entry.code === line.code)) errors.push("This procedure is unavailable for the selected doctor and LOA type.");
  if (line.stale) errors.push("Reconfirm this procedure after changing the doctor or request context.");
  if (!line.diagnoses.length) errors.push("Keep at least one diagnosis on this line.");
  if (procedure.site !== "none" && !line.site) errors.push("Select one " + procedure.site + ".");
  if (procedure.site === "tooth" && member?.extracted.includes(line.site)) errors.push("This tooth is marked as previously extracted in the demo history.");
  if (procedure.modifiers?.length && !procedure.modifiers.includes(line.modifier)) errors.push("Select an applicable modifier.");
  if (!/^\d{1,2}$/.test(line.quantity) || Number(line.quantity) < 1) errors.push("Quantity must be a whole number from 1 to 99.");
  if (type === "DENT" && line.quantity !== "1") errors.push("Use one Dental service per line in this demo.");
  if (procedure.pricing === "pac" && !(parseCents(line.charge) > 0)) errors.push("Enter a positive total charge with at most two decimal places.");
  if (procedure.pricing === "conflict") errors.push("Pricing conflict: no confirmed rate. Choose another procedure to complete this demo.");
  const roles = [line.doctorId, line.assistant, line.anesthetist].filter(Boolean);
  if (procedure.group === "RVS" && new Set(roles).size !== roles.length) errors.push("Choose different doctors for Main, Assistant and Anesthetist.");
  Object.entries(line.deductions).forEach(([name, amount]) => { if (context && !deductionOptions(line, context).includes(name)) errors.push("Remove " + name + ": no longer applicable to this request."); if (!(parseCents(amount) > 0)) errors.push("Enter a positive " + name + " amount."); });
  return errors;
}
export function requestErrors(state) {
  const result = [];
  if (state.type === "DENT" && !state.org.dental) result.push("Dental is unavailable for this organisation.");
  if (!state.attending) result.push("Select a requesting / attending doctor.");
  if (!state.member) result.push("Find a member using the sample card number and date of birth.");
  if (state.type === "DENT" && state.member && !state.member.dental) result.push("This sample member has no Dental benefit. Use Alina or Daniel for the Dental journey.");
  if (!dates().includes(state.date)) result.push("Choose today, tomorrow or the following day in Philippine time.");
  if (!state.diagnoses.length) result.push("Add at least one diagnosis before procedures.");
  if (["IP", "EMERG", "OPCON"].includes(state.type) && !state.complaint.trim()) result.push("Enter a chief complaint.");
  if (!state.lines.length) result.push("Add at least one procedure line.");
  state.lines.forEach((line, index) => lineErrors(line, state.type, state.member, state).forEach((message) => result.push("Line " + (index + 1) + ": " + message)));
  const keys = state.lines.filter((line) => line.code).map((line) => line.code + "|" + line.site);
  if (new Set(keys).size !== keys.length) result.push("Duplicate procedure and site: select a different tooth/site or remove the duplicate.");
  if (["IP", "OLP"].includes(state.type) && !state.files.length) result.push("Add a supporting document; the sample document button works without uploading a file.");
  return result;
}
