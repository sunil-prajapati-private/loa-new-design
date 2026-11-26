// Invented fixtures for public design review. Not OHI codes, rates or clinical rules.
export const ORGANISATIONS = [
  { id: "dental", name: "Meridian Dental Clinic", code: "DEMO-ORG-001", dental: true, kind: "Dental clinic", location: "Makati City", doctors: ["d1", "d2", "d3"] },
  { id: "medical", name: "Harborview Medical Centre", code: "DEMO-ORG-002", dental: false, kind: "Medical centre", location: "Quezon City", doctors: ["m1", "m2", "m3"] },
];
export const DOCTORS = [
  { id: "d1", name: "Dr. Sofia Navarro", specialty: "General dentistry", initials: "SN" },
  { id: "d2", name: "Dr. Ethan Villanueva", specialty: "Restorative dentistry", initials: "EV" },
  { id: "d3", name: "Dr. Clara Santos", specialty: "Periodontics", initials: "CS" },
  { id: "m1", name: "Dr. Adrian Flores", specialty: "Internal medicine", initials: "AF" },
  { id: "m2", name: "Dr. Isabel Torres", specialty: "General surgery", initials: "IT" },
  { id: "m3", name: "Dr. Lucas Reyes", specialty: "Anesthesiology", initials: "LR" },
];
export const MEMBERS = [
  { id: "demo-alina", name: "Alina Rivera", initials: "AR", card: "0000000000001001", dob: "1992-06-18", company: "Northstar Creative Co. (Demo)", plan: "Corporate Plus · Demo", expiry: "2027-12-31", status: "Active", dental: true, relationship: "Principal", extracted: ["26"], avatar: "#e5efff" },
  { id: "demo-daniel", citizenship: "Filipino", name: "Daniel Mercado", initials: "DM", card: "0000000000001002", dob: "1958-02-12", company: "Lighthouse Trading (Demo)", plan: "Corporate Premier · Demo", expiry: "2027-06-30", status: "Active", dental: true, relationship: "Dependent", extracted: ["18", "36"], avatar: "#e7f4ef" },
  { id: "demo-nico", name: "Nico Salcedo", initials: "NS", card: "0000000000001003", dob: "2001-09-08", company: "Pine Studio (Demo)", plan: "Medical Essentials · Demo", expiry: "2027-03-31", status: "Active", dental: false, relationship: "Principal", extracted: [], avatar: "#fff0dc" },
  { id: "demo-maya", name: "Maya Rivera", initials: "MR", card: "0000000000001004", dob: "2018-04-10", company: "Northstar Creative Co. (Demo)", plan: "Family Dental · Demo", expiry: "2027-12-31", status: "Active", dental: true, relationship: "Dependent", extracted: ["65"], avatar: "#f4eaff" },
];
export const TYPES = [{ code: "DENT", label: "Dental" }, { code: "OPCON", label: "Outpatient consultation" }, { code: "OLP", label: "OP Lab & Procedure" }, { code: "IP", label: "Inpatient" }, { code: "EMERG", label: "Emergency" }, { code: "PEME", label: "Pre-employment" }, { code: "ACU", label: "Annual checkup" }];
export const DIAGNOSES = [
  { code: "K02.9", label: "Dental caries, unspecified", dental: true }, { code: "K05.1", label: "Chronic gingivitis", dental: true }, { code: "K04.0", label: "Pulpitis", dental: true }, { code: "K08.9", label: "Disorder of teeth and supporting structures", dental: true },
  { code: "R10.9", label: "Abdominal pain, unspecified" }, { code: "M25.56", label: "Pain in knee" }, { code: "R50.9", label: "Fever, unspecified" }, { code: "Z00.0", label: "General medical examination" }, { code: "Z02.1", label: "Pre-employment examination" },
];
const dental = (code, name, cents, site, group = "Dental", doctors = ["d1", "d2", "d3"]) => ({ code, name, cents, site, group, doctors, types: ["DENT"], pricing: "scheduled", unit: "service" });
const medical = (code, name, cents, options = {}) => ({ code, name, cents, site: "none", group: "Medical", doctors: ["m1", "m2", "m3"], types: ["OLP", "IP", "EMERG"], pricing: "scheduled", unit: "service", ...options });
export const PROCEDURES = [
  dental("DEMO-D01", "Oral examination", 40000, "none"),
  dental("DEMO-D02", "Oral prophylaxis", 85000, "none"),
  dental("DEMO-D03", "Tooth restoration", 120000, "tooth"),
  dental("DEMO-D04", "Simple tooth extraction", 150000, "tooth"),
  dental("DEMO-D05", "Root canal treatment", 480000, "tooth", "Dental Therapeutic", ["d1", "d2"]),
  dental("DEMO-D06", "Periodontal treatment", 210000, "quadrant", "Dental Therapeutic", ["d1", "d3"]),
  dental("DEMO-D07", "Periapical radiograph", 65000, "tooth"),
  dental("DEMO-D08", "Denture adjustment", 110000, "none"),
  dental("DEMO-D09", "Fluoride treatment", 70000, "none"),
  medical("DEMO-M01", "Complete blood count", 45000),
  medical("DEMO-M02", "Chest radiograph", 85000),
  medical("DEMO-M03", "Abdominal ultrasound", 180000),
  medical("DEMO-M04", "Electrocardiogram", 75000),
  medical("DEMO-M05", "Specialised laboratory panel", 0, { pricing: "pac" }),
  medical("DEMO-M06", "Diagnostic imaging package", 0, { pricing: "pac" }),
  medical("DEMO-M07", "Knee radiograph", 110000, { modifiers: ["Left", "Right", "Bilateral"] }),
  medical("DEMO-R01", "Surgical procedure — sample RVS", 1250000, { group: "RVS", doctors: ["m2", "m3"], modifiers: ["Left", "Right"] }),
  medical("DEMO-IP01", "Inpatient medical care — room type example", 450000, { types: ["IP"], roomModifiers: [{ code: "10", descr: "WARD" }, { code: "8", descr: "SMALL PRIVATE" }] }),
  medical("DEMO-IP02", "Inpatient monitoring — room type example", 250000, { types: ["IP"], roomModifiers: [{ code: "8", descr: "SMALL PRIVATE" }, { code: "LARPRIV", descr: "Large Private" }] }),
  ...["Initial consultation", "Follow-up consultation", "Medical clearance"].map((name, i) => medical("DEMO-C0" + (i + 1), name, 60000 + i * 10000, { types: ["OPCON"], doctors: DOCTORS.map((d) => d.id) })),
  medical("DEMO-P01", "Annual wellness package", 450000, { types: ["ACU"] }),
  medical("DEMO-P02", "Pre-employment screening package", 220000, { types: ["PEME"] }),
];
// Fictional hospital room catalogue; hierarchy names mirror the portal references.
export const ROOM_TYPES = [
  { value: "DEMO-WARD", label: "Ward", roomHierarchyLabel: "WARD" },
  { value: "DEMO-SMALL-PRIVATE", label: "Small Private", roomHierarchyLabel: "SMALL PRIVATE" },
  { value: "DEMO-LARGE-PRIVATE", label: "Large Private", roomHierarchyLabel: "Large Private" },
];
// Same fixed LOA-type values as ProcedureDiagnosisSelector in the portal.
export const FIXED_ROOM_TYPES = {
  OLP: { value: "OP", label: "OP", roomHierarchyLabel: "OP" },
  DENT: { value: "OP", label: "OP", roomHierarchyLabel: "OP" },
  EMERG: { value: "EMERGENCY ROOM", label: "Emergency Room", roomHierarchyLabel: "EMERGENCY ROOM" },
  PEME: { value: "OP", label: "OP", roomHierarchyLabel: "OP" },
};
export const QUADRANTS = [{ value: "UR", label: "Upper right" }, { value: "UL", label: "Upper left" }, { value: "LR", label: "Lower right" }, { value: "LL", label: "Lower left" }];
export const TOOTH_ROWS = [[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]];
export const TOOTH_CHARTS = {
  permanent: { label: "Permanent teeth", rows: TOOTH_ROWS },
  temporary: { label: "Temporary teeth", rows: [[55, 54, 53, 52, 51, 61, 62, 63, 64, 65], [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]] },
};
