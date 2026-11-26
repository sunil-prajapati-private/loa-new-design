import { useEffect, useRef, useState } from "react";
import { Alert, Autocomplete, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, IconButton, MenuItem, Snackbar, TextField } from "@mui/material";
import { ArrowRight, BadgeCheck, Building2, Check, ChevronRight, FileCheck2, FlaskConical, Plus, RotateCcw, Stethoscope, Trash2, Upload, UserRound, X } from "lucide-react";
import { DIAGNOSES, DOCTORS, MEMBERS, ORGANISATIONS, TYPES } from "./data.js";
import { alignDentalLine, alignRoomLine, PERMANENT_TEETH_AGE, dateLabel, dates, doctorSpecialty, newLine, procedureFor, requestErrors } from "./domain.js";
import { CHIEF_COMPLAINTS, MAX_EMAIL_LENGTH, chiefComplaintError, chiefComplaintRequired, contactErrors } from "./portalForm.js";
import ScenarioTabs from "./components/ScenarioTabs.jsx";
import Shell from "./components/Shell.jsx";
import Section from "./components/Section.jsx";
import MemberSection from "./components/MemberSection.jsx";
import ProcedureDialog from "./components/ProcedureDialog.jsx";
import ProcedureLine from "./components/ProcedureLine.jsx";
import RequestSummary from "./components/RequestSummary.jsx";
import ReviewDialog from "./components/ReviewDialog.jsx";

function initialForm(org = ORGANISATIONS[0]) {
  return { requesterName: "", department: "", mobile: "", email: "", consultationType: "", org, type: org.dental ? "DENT" : "OLP", date: dates()[0], attending: org.doctors[0], card: MEMBERS[0].card, dob: MEMBERS[0].dob, member: null, diagnoses: [], lines: [], complaint: "", medicalClass: "MEDICAL", history: "", remarks: "", files: [] };
}
function seededForm(kind) {
  const form = initialForm(ORGANISATIONS[kind === "dental" ? 0 : 1]);
  form.requesterName = "Jamie Cruz"; form.department = "Patient services"; form.email = "jamie@example.com";
  if (kind === "pricing") form.remarks = "Estimated charge for the specialised laboratory panel.";
  const dx = DIAGNOSES.find((d) => d.code === (kind === "dental" ? "K02.9" : kind === "rvs" ? "R10.9" : "R50.9"));
  form.diagnoses = [{ ...dx, rank: "Primary" }];
  if (kind === "dental") {
    form.lines = [newLine("d1", form.diagnoses, { code: "DEMO-D03", site: "16" }), newLine("d3", form.diagnoses, { code: "DEMO-D06", site: "UR" }), newLine("d1", form.diagnoses, { code: "DEMO-D02" })];
  } else {
    form.files = [{ id: "demo-document", name: "Doctor-request-example.pdf", size: 146000, sample: true }];
    if (kind === "rvs") { form.attending = "m2"; form.medicalClass = "SURGICAL"; form.lines = [newLine("m2", form.diagnoses, { code: "DEMO-R01", modifier: "Right", assistant: "m1", anesthetist: "m3" })]; }
    else if (kind === "rooms") {
      form.type = "IP"; form.complaint = "07";
      form.lines = [newLine("m1", form.diagnoses, { code: "DEMO-IP01", providerRoomTypeCode: "DEMO-WARD" }), newLine("m2", form.diagnoses, { code: "DEMO-IP02", providerRoomTypeCode: "DEMO-SMALL-PRIVATE" }), newLine("m1", form.diagnoses, { code: "DEMO-M01" })];
    }
    else form.lines = [newLine("m1", form.diagnoses, { code: "DEMO-M01" }), newLine("m1", form.diagnoses, { code: "DEMO-M03" }), newLine("m2", form.diagnoses, { code: "DEMO-M05", charge: "2450.00" })];
  }
  form.lines = form.lines.map((line) => alignRoomLine(line, form.type));
  return form;
}

export default function App({ onNavigate }) {
  const [form, setForm] = useState(initialForm);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [notice, setNotice] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [editor, setEditor] = useState(null);
  const [removeLine, setRemoveLine] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [touched, setTouched] = useState({});
  const [review, setReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fileError, setFileError] = useState("");
  const lookup = useRef({ timer: null, generation: 0 });
  const upload = useRef(null); const errorSummary = useRef(null);
  useEffect(() => { const request = lookup.current; return () => { clearTimeout(request.timer); request.generation += 1; }; }, []);

  const doctors = DOCTORS.filter((doctor) => form.type === "OLP" || form.org.doctors.includes(doctor.id));
  const errors = requestErrors(form);
  const contactValidation = contactErrors(form);
  const mobileError = (showErrors || touched.mobile) && contactValidation.mobile;
  const emailError = (showErrors || touched.email) && contactValidation.email;
  const complaintError = (showErrors || touched.complaint) && chiefComplaintError(form);
  const touchField = (field) => setTouched((current) => ({ ...current, [field]: true }));
  const canAdd = Boolean(form.member && form.diagnoses.length && form.attending && (form.type !== "DENT" || form.member.dental));
  function cancelLookup() { clearTimeout(lookup.current.timer); lookup.current.generation += 1; setMemberLoading(false); }
  function setField(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function findMember(card = form.card, dob = form.dob) {
    cancelLookup(); const generation = lookup.current.generation;
    setMemberLoading(true); setMemberError(""); setForm((current) => ({ ...current, member: null }));
    lookup.current.timer = setTimeout(() => {
      if (generation !== lookup.current.generation) return;
      const member = MEMBERS.find((item) => item.card === card && item.dob === dob);
      setMemberLoading(false);
      if (member) setForm((current) => ({ ...current, member, lines: current.lines.map((line) => alignDentalLine(line, member, current.date)) }));
      else setMemberError("No sample member matches this card number and date of birth. Choose a record from Sample members.");
    }, 650);
  }
  function changeMemberInput(field, value) {
    cancelLookup(); setMemberError("");
    setForm((current) => ({ ...current, [field]: value, member: null, lines: current.lines.map((line) => ({ ...line, stale: Boolean(line.code) })) }));
  }
  function reset(org = form.org) {
    cancelLookup(); setForm(initialForm(org)); setShowErrors(false); setTouched({}); setMemberError(""); setFileError(""); setEditor(null); setRemoveLine(null); setReview(false); setSubmitted(false);
  }
  function loadScenario(kind) {
    cancelLookup(); const next = seededForm(kind); setForm(next); setTouched({}); setEditor(null); setRemoveLine(null); setShowErrors(false); setFileError(""); setDrawer(false); setReview(false); setSubmitted(false); findMember(next.card, next.dob);
    setNotice("Sample journey loaded. Every record and price in this demo is fictional.");
  }
  function chooseMember(member) {
    setDrawer(false); setForm((current) => ({ ...current, card: member.card, dob: member.dob, lines: current.lines.map((line) => ({ ...line, stale: Boolean(line.code) })) })); findMember(member.card, member.dob);
  }
  function changeType(type) {
    const packageCode = type === "ACU" ? "Z00.0" : type === "PEME" ? "Z02.1" : null;
    setForm((current) => ({ ...current, type, diagnoses: packageCode ? [{ ...DIAGNOSES.find((dx) => dx.code === packageCode), rank: "Primary" }] : current.diagnoses, lines: current.lines.map((line) => alignRoomLine({ ...line, stale: Boolean(line.code), deductions: {} }, type)) }));
  }
  function addDiagnosis(diagnosis) {
    if (!diagnosis || form.diagnoses.some((item) => item.code === diagnosis.code)) return;
    setForm((current) => ({ ...current, diagnoses: [...current.diagnoses, { ...diagnosis, rank: current.diagnoses.length ? "Secondary" : "Primary" }], lines: current.lines.map((line) => ({ ...line, diagnoses: [...line.diagnoses, diagnosis.code] })) }));
  }
  function removeDiagnosis(code) {
    setForm((current) => {
      const diagnoses = current.diagnoses.filter((dx) => dx.code !== code);
      if (diagnoses.length && !diagnoses.some((dx) => dx.rank === "Primary")) diagnoses[0] = { ...diagnoses[0], rank: "Primary" };
      return { ...current, diagnoses, lines: current.lines.map((line) => ({ ...line, diagnoses: line.diagnoses.filter((id) => id !== code) })) };
    });
  }
  function rankDiagnosis(code, rank) {
    setForm((current) => {
      const diagnoses = current.diagnoses.map((dx) => ({ ...dx, rank: dx.code === code ? rank : rank === "Primary" && dx.rank === "Primary" ? "Secondary" : dx.rank }));
      if (!diagnoses.some((dx) => dx.rank === "Primary")) { setNotice("Keep one Primary diagnosis. Select another diagnosis as Primary first."); return current; }
      return { ...current, diagnoses };
    });
  }
  function addLine() {
    setEditor({ line: alignDentalLine(newLine(form.attending, form.diagnoses), form.member, form.date), isNew: true, index: form.lines.length });
  }
  function duplicateLine(line) {
    setEditor({ line: { ...line, id: crypto.randomUUID(), site: "", diagnoses: [...line.diagnoses], deductions: { ...line.deductions } }, isNew: true, index: form.lines.length });
  }
  function saveLine(line) {
    setForm((current) => ({ ...current, lines: editor.isNew ? [...current.lines, line] : current.lines.map((item) => item.id === line.id ? line : item) }));
    setEditor(null);
    setNotice(editor.isNew ? "Procedure added." : "Procedure updated.");
  }
  function addFiles(files) {
    const limit = ["DENT", "ACU", "PEME"].includes(form.type) ? 10 : 30;
    const allowed = ["ACU", "PEME"].includes(form.type) ? /\.(pdf|png|jpe?g)$/i : /\.(pdf|png|jpe?g|tiff?)$/i;
    const invalid = files.find((file) => !allowed.test(file.name) || file.size > limit * 1024 * 1024);
    if (invalid) { setFileError("Choose a supported file no larger than " + limit + " MB. No files from this selection were added."); return; }
    setFileError(""); setForm((current) => ({ ...current, files: [...current.files, ...files.map((file) => ({ id: crypto.randomUUID(), name: file.name, size: file.size, sample: false }))] }));
  }
  function openReview() {
    setShowErrors(true);
    if (errors.length) { requestAnimationFrame(() => { errorSummary.current?.focus(); errorSummary.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }); return; }
    setSubmitted(false); setReview(true);
  }

  return <Shell onNavigate={onNavigate} org={form.org} onSamples={() => setDrawer(true)} onNotice={setNotice}>
    <ScenarioTabs scenarios={[["dental", "Dental & tooth selection"], ["pricing", "Fee schedule + PAC"], ["rvs", "RVS doctors"], ["rooms", "Room types"]]} onSelect={loadScenario}><ul><li>Review the form layout, diagnosis-first flow, doctor selection per procedure, tooth / quadrant controls, room type selection, and manual line amounts. The Room types scenario demonstrates procedure-specific inpatient options; OP and Emergency Room are fixed for the corresponding LOA types. Room selection follows the existing portal’s optional field behavior. Amounts remain illustrative; actual room-specific rate resolution is not implemented.</li><li>All members, doctors, procedure codes, prices, coverage and history are fictional. The sample catalogue does not prove diagnosis, provider, package or benefit eligibility.</li><li>Review point 7 — demo assumption pending business confirmation: below age {PERMANENT_TEETH_AGE}, default to temporary teeth; from age {PERMANENT_TEETH_AGE}, default to permanent teeth. Age is measured at availment. Add and Edit share a Permanent / Temporary selector, and each procedure can keep its chosen chart. Changing charts clears the selected site. A different member resets the chart to the age-based default.</li><li>Review point 9: a tooth can be used only once across all procedures in the same request, even when procedure codes or doctors differ. Teeth used on other lines are disabled; a line keeps its own tooth available while editing.</li><li>Dental access follows the sample organisation; both Dental and Dental Therapeutic examples are included. Policy PHIC filing status is not supplied.</li><li>ACU / PEME package entitlement, consultation-clearance eligibility and inpatient room entitlement are not fully represented. Requester name and department are required; mobile and email are optional and validated using the existing portal rules. Chief complaints use the portal’s 17 reference values; the demo keeps its existing required-field rules.</li><li>RVS Assistant / Anesthetist capture is shown for review; delivery through existing OHI fields and the supporting summary still needs integration verification.</li><li>Deductions are manual PHP amounts per line. Review point 10: Senior Citizen enables automatically at age 60+ for all LOA types; amounts are entered manually. Use Daniel to try it.</li></ul></ScenarioTabs>
    <nav className="journey-nav loa-journey-nav" aria-label="Form sections">{[["request", "Request", true], ["member", "Member", Boolean(form.member)], ["clinical", "Diagnoses", Boolean(form.diagnoses.length)], ["procedures", "Procedures", canAdd && form.lines.length > 0], ["documents", "Documents", Boolean(form.files.length)]].map(([id, title, done], index) => <a href={"#" + id} key={id}><span className={done ? "journey-dot done" : "journey-dot"}>{done ? <Check size={12} /> : index + 1}</span>{title}{index < 4 && <ChevronRight size={13} />}</a>)}</nav>
    {showErrors && errors.length > 0 && <div ref={errorSummary} tabIndex={-1} className="validation-summary"><Alert severity="error"><strong>Complete these details before review</strong><ul className="error-list">{errors.map((error) => <li key={error}>{error}</li>)}</ul></Alert></div>}
    <div className="form-layout"><div className="form-main">
      <Section id="request" step="1" title="Provider & request" description="The organisation is taken from the demo account.">
        <div className="organisation-card"><Building2 size={23} /><div><strong>{form.org.name}</strong><p>{form.org.code} · {form.org.location}</p></div><Chip size="small" icon={<BadgeCheck size={14} />} label={form.org.dental ? "Dental Hub · demo" : "Accredited · demo"} color="success" variant="outlined" /></div>
        <div className="requester-details"><h3>LOA requester</h3><div className="field-grid two">
          <TextField size="small" label="LOA requester name" required value={form.requesterName} onChange={(event) => setField("requesterName", event.target.value)} error={showErrors && !form.requesterName.trim()} helperText={showErrors && !form.requesterName.trim() ? "Requester name is required." : undefined} />
          <TextField size="small" label="Department" required value={form.department} onChange={(event) => setField("department", event.target.value)} error={showErrors && !form.department.trim()} helperText={showErrors && !form.department.trim() ? "Department is required." : undefined} />
          <TextField size="small" label="Mobile number" type="tel" autoComplete="tel" value={form.mobile} onChange={(event) => setField("mobile", event.target.value)} onBlur={() => touchField("mobile")} error={Boolean(mobileError)} helperText={mobileError || "Optional · 09171234567 or +639171234567"} />
          <TextField size="small" label="Email address" type="email" autoComplete="email" value={form.email} onChange={(event) => setField("email", event.target.value)} onBlur={() => touchField("email")} error={Boolean(emailError)} helperText={emailError || "Optional · maximum " + MAX_EMAIL_LENGTH + " characters"} />
        </div></div>
        <div className="field-grid two"><TextField size="small" select label="LOA type" required value={form.type} onChange={(event) => changeType(event.target.value)}>{TYPES.map((type) => <MenuItem key={type.code} value={type.code} disabled={type.code === "DENT" && !form.org.dental}>{type.label}{type.code === "DENT" && !form.org.dental ? " — not enabled for this organisation" : ""}</MenuItem>)}</TextField><Autocomplete options={doctors} value={DOCTORS.find((doctor) => doctor.id === form.attending) ?? null} getOptionLabel={(doctor) => doctor.name} isOptionEqualToValue={(a, b) => a.id === b.id} onChange={(_event, doctor) => setField("attending", doctor?.id ?? "")} renderOption={(props, doctor) => { const { key, ...rest } = props; return <li key={key} {...rest}><div><strong>{doctor.name}</strong><small className="option-subtitle">{doctor.specialty}</small></div></li>; }} renderInput={(params) => <TextField {...params} size="small" label="Requesting / attending doctor" required helperText={"Specialty: " + doctorSpecialty(form.attending)} />} />
          <TextField size="small" label="Availment type" value={form.type === "IP" ? "Inpatient" : form.type === "EMERG" ? "Emergency" : "Outpatient"} InputProps={{ readOnly: true }} /><TextField size="small" select required label="Availment / admission date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value, lines: current.lines.map((line) => alignDentalLine({ ...line, stale: Boolean(line.code) }, current.member, event.target.value)) }))} helperText="Today and the next two days · Philippine time">{dates().map((date, index) => <MenuItem key={date} value={date}>{dateLabel(date)}{index === 0 ? " · Today" : ""}</MenuItem>)}</TextField></div>
        {form.type === "OPCON" && <TextField size="small" select fullWidth required label="Consultation type" value={form.consultationType} onChange={(event) => setField("consultationType", event.target.value)} sx={{ mt: 2 }}>{["Initial", "Follow up", "Clearance"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>}
        {!form.org.dental && <p className="field-note">Dental is not enabled for this organisation. Selecting a dentist does not change organisation access.</p>}
        {form.type === "IP" && <div className="field-grid two"><TextField size="small" label="Point of entry" select defaultValue="Direct admission"><MenuItem value="Direct admission">Direct admission</MenuItem><MenuItem value="Emergency department">Emergency department</MenuItem></TextField><TextField size="small" label="Room number (demo)" placeholder="e.g. 301" /></div>}
      </Section>
      <MemberSection card={form.card} dob={form.dob} onInput={changeMemberInput} onLookup={() => findMember()} loading={memberLoading} member={form.member} error={memberError} onSamples={() => setDrawer(true)} type={form.type} date={form.date} />
      <Section id="clinical" step="3" title="Clinical details & diagnoses" description="Select diagnoses before adding procedures. All diagnoses apply by default; uncheck unrelated diagnoses in each procedure popup.">
        <div className="field-grid two"><TextField size="small" select fullWidth label="Chief complaint" required={chiefComplaintRequired(form.type)} value={form.complaint} onChange={(event) => setField("complaint", event.target.value)} onBlur={() => touchField("complaint")} error={Boolean(complaintError)} helperText={complaintError || (chiefComplaintRequired(form.type) ? "Select the reason for this request" : "Optional")} SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 320, "& .MuiMenuItem-root": { whiteSpace: "normal" } } } } }}><MenuItem value=""><em>Select chief complaint</em></MenuItem>{CHIEF_COMPLAINTS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>{["OLP", "IP", "EMERG"].includes(form.type) && <TextField size="small" select label="Class" value={form.medicalClass} onChange={(event) => setField("medicalClass", event.target.value)}><MenuItem value="MEDICAL">Medical</MenuItem><MenuItem value="SURGICAL">Surgical</MenuItem></TextField>}</div>
        {["IP", "EMERG"].includes(form.type) && <TextField size="small" fullWidth multiline minRows={2} label="Brief history" value={form.history} onChange={(event) => setField("history", event.target.value)} inputProps={{ maxLength: 1000 }} helperText={form.history.length + " / 1,000"} sx={{ mt: 2 }} />}
        <div className="diagnosis-list">{form.diagnoses.map((diagnosis) => <div className="diagnosis-row" key={diagnosis.code}><span className="diagnosis-code">{diagnosis.code}</span><span className="diagnosis-label">{diagnosis.label}</span><TextField size="small" select value={diagnosis.rank} onChange={(event) => rankDiagnosis(diagnosis.code, event.target.value)} inputProps={{ "aria-label": "Rank for " + diagnosis.code }}>{["Primary", "Secondary", "Other"].map((rank) => <MenuItem key={rank} value={rank}>{rank}</MenuItem>)}</TextField><IconButton aria-label={"Remove diagnosis " + diagnosis.code} onClick={() => removeDiagnosis(diagnosis.code)}><X size={16} /></IconButton></div>)}</div>
        <Autocomplete value={null} disabled={!form.member} options={DIAGNOSES.filter((diagnosis) => (form.type === "DENT" ? diagnosis.dental : !diagnosis.dental) && !form.diagnoses.some((item) => item.code === diagnosis.code))} getOptionLabel={(diagnosis) => diagnosis.code + " · " + diagnosis.label} onChange={(_event, diagnosis) => addDiagnosis(diagnosis)} renderInput={(params) => <TextField {...params} size="small" label="Search and add diagnosis" placeholder="Code or description" helperText={!form.member ? "Find a sample member first." : "One Primary diagnosis is required. Add Secondary or Other diagnoses as needed."} />} sx={{ mt: 2 }} />
      </Section>
      <Section id="procedures" step="4" title="Doctors & procedures" description="Choose a doctor on each line, then select from that doctor's sample catalogue." action={<Chip size="small" label={form.lines.length + (form.lines.length === 1 ? " line" : " lines")} />}>
        {!canAdd && <div className="empty-member"><Stethoscope size={23} /><span>Find a member and add a diagnosis to unlock procedure selection.</span></div>}
        {form.lines.map((line, index) => <ProcedureLine key={line.id} line={line} index={index} type={form.type} member={form.member} date={form.date} medicalClass={form.medicalClass} diagnoses={form.diagnoses} onEdit={() => setEditor({ line, isNew: false, index })} onRemove={() => setRemoveLine(line)} onDuplicate={() => duplicateLine(line)} showErrors={showErrors} />)}
        <Button variant="outlined" startIcon={<Plus size={17} />} disabled={!canAdd} onClick={() => addLine()} sx={{ mt: 1.5 }}>Add procedure line</Button>

      </Section>
      <Section id="documents" step="5" title="Documents & remarks" description={["OLP", "IP"].includes(form.type) ? "Supporting document required for this sample journey." : "Supporting documents are optional for this sample journey."}>
        <div className="upload-zone"><Upload size={25} /><div><strong>Add supporting documents</strong><p>{["ACU", "PEME"].includes(form.type) ? "PDF, PNG or JPEG" : "PDF, PNG, JPEG or TIFF"} · up to {["DENT", "ACU", "PEME"].includes(form.type) ? "10" : "30"} MB per file</p><small>Only filenames are kept in this tab. Nothing is uploaded.</small></div><Button variant="outlined" onClick={() => upload.current?.click()}>Choose files</Button></div>
        <input type="file" ref={upload} hidden multiple accept={["ACU", "PEME"].includes(form.type) ? ".pdf,.png,.jpg,.jpeg" : ".pdf,.png,.jpg,.jpeg,.tif,.tiff"} onChange={(event) => { addFiles(Array.from(event.target.files)); event.target.value = ""; }} />
        <Button size="small" startIcon={<FileCheck2 size={16} />} onClick={() => { if (!form.files.some((file) => file.sample)) setField("files", [...form.files, { id: crypto.randomUUID(), name: "Doctor-request-example.pdf", size: 146000, sample: true }]); }}>Use a sample document</Button>
        {fileError && <Alert severity="error">{fileError}</Alert>}
        {form.files.map((file) => <div className="file-row" key={file.id}><FileCheck2 size={18} /><span>{file.name}<small>{file.sample ? "Sample placeholder" : "Local filename only"} · {Math.ceil(file.size / 1024)} KB</small></span><IconButton aria-label={"Remove " + file.name} onClick={() => setField("files", form.files.filter((item) => item.id !== file.id))}><Trash2 size={16} /></IconButton></div>)}
        <TextField size="small" multiline minRows={3} fullWidth label="Remarks" required={form.lines.some((line) => procedureFor(line)?.pricing === "pac")} placeholder="Add relevant information about the request" value={form.remarks} inputProps={{ maxLength: 2000 }} onChange={(event) => setField("remarks", event.target.value)} helperText={(form.lines.some((line) => procedureFor(line)?.pricing === "pac") ? "Required for Price As Charged procedures. " : "") + form.remarks.length + " / 2,000"} sx={{ mt: 3 }} />
      </Section>
    </div><RequestSummary state={form} errors={errors} /></div>
    <footer className="form-footer"><Button startIcon={<RotateCcw size={16} />} onClick={() => reset()}>Reset demo</Button><div><span className="footer-hint">{form.lines.length} procedure {form.lines.length === 1 ? "line" : "lines"} · Demo only</span><Button variant="contained" disableElevation endIcon={<ArrowRight size={17} />} onClick={openReview} disabled={memberLoading}>Review request</Button></div></footer>
    <Drawer anchor="right" open={drawer} onClose={() => setDrawer(false)}><div className="demo-drawer"><div className="dialog-title"><h2>Explore the demo</h2><IconButton aria-label="Close demo scenarios" onClick={() => setDrawer(false)}><X size={20} /></IconButton></div><p>All records below are fictional. Scenarios replace the current demo draft.</p><h3>Sample journeys</h3>{[["dental", "Dental & anatomy", "Three procedures, tooth selection, a quadrant and different dentists.", Stethoscope], ["pricing", "Fee schedule + Price As Charged", "Scheduled amounts, an editable total charge and a sample document.", FlaskConical], ["rvs", "RVS & doctor roles", "Main, Assistant and Anesthetist on a surgical procedure line.", UserRound], ["rooms", "Room types", "Inpatient room modifiers with different available rooms per procedure.", Building2]].map(([key, title, description, Icon]) => <button className="scenario-card" key={key} onClick={() => loadScenario(key)}><Icon size={22} /><div><strong>{title}</strong><span>{description}</span></div><ChevronRight size={18} /></button>)}<h3>Sample members</h3>{MEMBERS.map((member) => <button className="sample-member" key={member.id} onClick={() => chooseMember(member)}><div><strong>{member.name}</strong><span>{member.card} · {dateLabel(member.dob)}</span><small>{member.dental ? "Includes sample Dental benefit" : "No Dental benefit — try the error state"}</small></div><ChevronRight size={17} /></button>)}<h3>Logged-in organisation</h3>{ORGANISATIONS.map((org) => <button className="sample-member" key={org.id} onClick={() => { reset(org); setDrawer(false); setNotice("Switched demo organisation. A new draft has started."); }}><div><strong>{org.name}</strong><span>{org.dental ? "Dental enabled · sample Hub affiliation" : "Dental unavailable · medical organisation"}</span></div><Building2 size={20} /></button>)}<Alert severity="info" sx={{ mt: 3 }}>No real member lookup, OHI access, upload or LOA submission occurs. Reloading clears your draft.</Alert></div></Drawer>
    {editor && <ProcedureDialog key={editor.line.id} initialLine={editor.line} index={editor.index} isNew={editor.isNew} type={form.type} member={form.member} date={form.date} medicalClass={form.medicalClass} doctors={doctors} diagnoses={form.diagnoses} lines={form.lines} onSave={saveLine} onClose={() => setEditor(null)} />}
    <Dialog open={Boolean(removeLine)} onClose={() => setRemoveLine(null)} maxWidth="xs" fullWidth aria-labelledby="remove-line-title"><DialogTitle id="remove-line-title">Remove procedure?</DialogTitle><DialogContent>Are you sure you want to remove {removeLine && procedureFor(removeLine)?.name}?</DialogContent><DialogActions><Button onClick={() => setRemoveLine(null)}>Keep procedure</Button><Button color="error" onClick={() => { setForm((current) => ({ ...current, lines: current.lines.filter((line) => line.id !== removeLine.id) })); setRemoveLine(null); }}>Remove procedure</Button></DialogActions></Dialog>
    <ReviewDialog open={review} onClose={() => setReview(false)} state={form} submitted={submitted} onSubmit={() => setSubmitted(true)} onNew={() => reset()} />
    <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice("")} message={notice} action={<IconButton color="inherit" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={17} /></IconButton>} />
  </Shell>;
}
