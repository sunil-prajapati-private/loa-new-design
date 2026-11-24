import { useEffect, useRef, useState } from "react";
import { Alert, Autocomplete, Button, Chip, Drawer, IconButton, MenuItem, Snackbar, TextField } from "@mui/material";
import { ArrowRight, BadgeCheck, Building2, Check, ChevronRight, FileCheck2, FlaskConical, Plus, RotateCcw, Stethoscope, Trash2, Upload, UserRound, X } from "lucide-react";
import { DIAGNOSES, DOCTORS, MEMBERS, ORGANISATIONS, TYPES } from "./data.js";
import { amountFor, dateLabel, dates, lineErrors, money, newLine, procedureFor, requestErrors } from "./domain.js";
import ScenarioTabs from "./components/ScenarioTabs.jsx";
import Shell from "./components/Shell.jsx";
import Section from "./components/Section.jsx";
import MemberSection from "./components/MemberSection.jsx";
import ProcedureLine from "./components/ProcedureLine.jsx";
import ReviewDialog from "./components/ReviewDialog.jsx";

function initialForm(org = ORGANISATIONS[0]) {
  return { org, type: org.dental ? "DENT" : "OLP", date: dates()[0], attending: org.doctors[0], card: MEMBERS[0].card, dob: MEMBERS[0].dob, member: null, diagnoses: [], lines: [], complaint: "", medicalClass: "MEDICAL", history: "", remarks: "", files: [] };
}
function seededForm(kind) {
  const form = initialForm(ORGANISATIONS[kind === "dental" ? 0 : 1]);
  const dx = DIAGNOSES.find((d) => d.code === (kind === "dental" ? "K02.9" : kind === "rvs" ? "R10.9" : "R50.9"));
  form.diagnoses = [{ ...dx, rank: "Primary" }];
  if (kind === "dental") {
    form.lines = [newLine("d1", form.diagnoses, { code: "DEMO-D03", site: "16" }), newLine("d3", form.diagnoses, { code: "DEMO-D06", site: "UR" }), newLine("d1", form.diagnoses, { code: "DEMO-D02" })];
  } else {
    form.files = [{ id: "demo-document", name: "Doctor-request-example.pdf", size: 146000, sample: true }];
    if (kind === "rvs") { form.attending = "m2"; form.medicalClass = "SURGICAL"; form.lines = [newLine("m2", form.diagnoses, { code: "DEMO-R01", modifier: "Right", assistant: "m1", anesthetist: "m3" })]; }
    else form.lines = [newLine("m1", form.diagnoses, { code: "DEMO-M01" }), newLine("m1", form.diagnoses, { code: "DEMO-M03" }), newLine("m2", form.diagnoses, { code: "DEMO-M05", charge: "2450.00" })];
  }
  return form;
}

export default function App({ onNavigate }) {
  const [form, setForm] = useState(initialForm);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [notice, setNotice] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [expandedLine, setExpandedLine] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [review, setReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fileError, setFileError] = useState("");
  const lookup = useRef({ timer: null, generation: 0 });
  const upload = useRef(null); const errorSummary = useRef(null);
  useEffect(() => { const request = lookup.current; return () => { clearTimeout(request.timer); request.generation += 1; }; }, []);

  const doctors = DOCTORS.filter((doctor) => form.type === "OLP" || form.org.doctors.includes(doctor.id));
  const errors = requestErrors(form);
  const canAdd = Boolean(form.member && form.diagnoses.length && form.attending && (form.type !== "DENT" || form.member.dental));
  const scheduled = form.lines.filter((line) => procedureFor(line)?.pricing === "scheduled").reduce((sum, line) => sum + (amountFor(line) ?? 0), 0);
  const charged = form.lines.filter((line) => procedureFor(line)?.pricing === "pac").reduce((sum, line) => sum + (amountFor(line) ?? 0), 0);
  function cancelLookup() { clearTimeout(lookup.current.timer); lookup.current.generation += 1; setMemberLoading(false); }
  function setField(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function findMember(card = form.card, dob = form.dob) {
    cancelLookup(); const generation = lookup.current.generation;
    setMemberLoading(true); setMemberError(""); setForm((current) => ({ ...current, member: null }));
    lookup.current.timer = setTimeout(() => {
      if (generation !== lookup.current.generation) return;
      const member = MEMBERS.find((item) => item.card === card && item.dob === dob);
      setMemberLoading(false);
      if (member) setForm((current) => ({ ...current, member }));
      else setMemberError("No sample member matches this card number and date of birth. Choose a record from Sample members.");
    }, 650);
  }
  function changeMemberInput(field, value) {
    cancelLookup(); setMemberError("");
    setForm((current) => ({ ...current, [field]: value, member: null, lines: current.lines.map((line) => ({ ...line, stale: Boolean(line.code) })) }));
  }
  function reset(org = form.org) {
    cancelLookup(); setForm(initialForm(org)); setShowErrors(false); setMemberError(""); setFileError(""); setExpandedLine(""); setReview(false); setSubmitted(false);
  }
  function loadScenario(kind) {
    cancelLookup(); const next = seededForm(kind); setForm(next); setExpandedLine(next.lines[0]?.id ?? ""); setShowErrors(false); setFileError(""); setDrawer(false); setReview(false); setSubmitted(false); findMember(next.card, next.dob);
    setNotice("Sample journey loaded. Every record and price in this demo is fictional.");
  }
  function chooseMember(member) {
    setDrawer(false); setForm((current) => ({ ...current, card: member.card, dob: member.dob, lines: current.lines.map((line) => ({ ...line, stale: Boolean(line.code) })) })); findMember(member.card, member.dob);
  }
  function changeType(type) {
    const packageCode = type === "ACU" ? "Z00.0" : type === "PEME" ? "Z02.1" : null;
    setForm((current) => ({ ...current, type, diagnoses: packageCode ? [{ ...DIAGNOSES.find((dx) => dx.code === packageCode), rank: "Primary" }] : current.diagnoses, lines: current.lines.map((line) => ({ ...line, stale: Boolean(line.code), deductions: {} })) }));
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
  function addLine(seed) {
    const line = newLine(form.attending, form.diagnoses, seed); setForm((current) => ({ ...current, lines: [...current.lines, line] })); setExpandedLine(line.id);
  }
  function duplicateLine(line) {
    const copy = { ...line, id: crypto.randomUUID(), site: "", deductions: { ...line.deductions } }; setForm((current) => ({ ...current, lines: [...current.lines, copy] })); setExpandedLine(copy.id); setNotice("Line duplicated. Choose a different tooth or site before review.");
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
    if (errors.length) { const invalid = form.lines.find((line) => lineErrors(line, form.type, form.member, form).length); if (invalid) setExpandedLine(invalid.id); requestAnimationFrame(() => { errorSummary.current?.focus(); errorSummary.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }); return; }
    setSubmitted(false); setReview(true);
  }

  return <Shell onNavigate={onNavigate} org={form.org} onSamples={() => setDrawer(true)} onNotice={setNotice}>
    <ScenarioTabs scenarios={[["dental", "Dental & tooth selection"], ["pricing", "Fee schedule + PAC"], ["rvs", "RVS doctors"]]} onSelect={loadScenario}><ul><li>Review the form layout, diagnosis-first flow, doctor selection per procedure, tooth / quadrant controls, and manual line amounts.</li><li>All members, doctors, procedure codes, prices, coverage and history are fictional. The sample catalogue does not prove diagnosis, provider, package or benefit eligibility.</li><li>Dental access follows the sample organisation; both Dental and Dental Therapeutic examples are included. Policy PHIC filing status is not supplied.</li><li>ACU / PEME package entitlement, consultation-clearance rules, inpatient room entitlement and the chief-complaint dropdown are not fully represented. Requester details are deferred.</li><li>RVS Assistant / Anesthetist capture is shown for review; delivery through existing OHI fields and the supporting summary still needs integration verification.</li><li>Deductions are manual PHP amounts per line. Use Daniel in a medical organisation to review the Senior Citizen example; his Filipino citizenship is fictional sample data.</li></ul></ScenarioTabs>
    <div className="journey-nav" aria-label="Form sections">{[["request", "Request", true], ["member", "Member", Boolean(form.member)], ["clinical", "Diagnoses", Boolean(form.diagnoses.length)], ["procedures", "Procedures", canAdd && form.lines.length > 0], ["documents", "Documents", Boolean(form.files.length)]].map(([id, title, done], index) => <a href={"#" + id} key={id}><span className={done ? "journey-dot done" : "journey-dot"}>{done ? <Check size={12} /> : index + 1}</span>{title}{index < 4 && <ChevronRight size={13} />}</a>)}</div>
    {showErrors && errors.length > 0 && <div ref={errorSummary} tabIndex={-1} className="validation-summary"><Alert severity="error"><strong>Complete these details before review</strong><ul className="error-list">{errors.map((error) => <li key={error}>{error}</li>)}</ul></Alert></div>}
    <div className="form-layout"><div className="form-main">
      <Section id="request" step="1" title="Provider & request" description="The organisation is taken from the demo account.">
        <div className="organisation-card"><Building2 size={23} /><div><strong>{form.org.name}</strong><p>{form.org.code} · {form.org.location}</p></div><Chip size="small" icon={<BadgeCheck size={14} />} label={form.org.dental ? "Dental Hub · demo" : "Accredited · demo"} color="success" variant="outlined" /></div>
        <div className="field-grid two"><TextField size="small" select label="LOA type" required value={form.type} onChange={(event) => changeType(event.target.value)}>{TYPES.map((type) => <MenuItem key={type.code} value={type.code} disabled={type.code === "DENT" && !form.org.dental}>{type.label}{type.code === "DENT" && !form.org.dental ? " — not enabled for this organisation" : ""}</MenuItem>)}</TextField><Autocomplete options={doctors} value={DOCTORS.find((doctor) => doctor.id === form.attending) ?? null} getOptionLabel={(doctor) => doctor.name} isOptionEqualToValue={(a, b) => a.id === b.id} onChange={(_event, doctor) => setField("attending", doctor?.id ?? "")} renderInput={(params) => <TextField {...params} size="small" label="Requesting / attending doctor" required />} />
          <TextField size="small" label="Availment type" value={form.type === "IP" ? "Inpatient" : form.type === "EMERG" ? "Emergency" : "Outpatient"} InputProps={{ readOnly: true }} /><TextField size="small" select required label="Availment / admission date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value, lines: current.lines.map((line) => ({ ...line, stale: Boolean(line.code) })) }))} helperText="Today and the next two days · Philippine time">{dates().map((date, index) => <MenuItem key={date} value={date}>{dateLabel(date)}{index === 0 ? " · Today" : index === 1 ? " · Tomorrow" : ""}</MenuItem>)}</TextField></div>
        {!form.org.dental && <p className="field-note">Dental is not enabled for this organisation. Selecting a dentist does not change organisation access.</p>}
        {form.type === "IP" && <div className="field-grid two"><TextField size="small" label="Point of entry" select defaultValue="Direct admission"><MenuItem value="Direct admission">Direct admission</MenuItem><MenuItem value="Emergency department">Emergency department</MenuItem></TextField><TextField size="small" label="Room number (demo)" placeholder="e.g. 301" /></div>}
      </Section>
      <MemberSection card={form.card} dob={form.dob} onInput={changeMemberInput} onLookup={() => findMember()} loading={memberLoading} member={form.member} error={memberError} onSamples={() => setDrawer(true)} type={form.type} />
      <Section id="clinical" step="3" title="Clinical details & diagnoses" description="Select diagnoses before adding procedures. Each line can keep its own applicable diagnoses.">
        <div className="field-grid two"><TextField size="small" fullWidth label="Chief complaint" required={["OPCON", "IP", "EMERG"].includes(form.type)} placeholder={form.type === "DENT" ? "e.g. Tooth discomfort" : "Describe the reason for the request"} value={form.complaint} onChange={(event) => setField("complaint", event.target.value)} />{["OLP", "IP", "EMERG"].includes(form.type) && <TextField size="small" select label="Class" value={form.medicalClass} onChange={(event) => setField("medicalClass", event.target.value)}><MenuItem value="MEDICAL">Medical</MenuItem><MenuItem value="SURGICAL">Surgical</MenuItem></TextField>}</div>
        {["IP", "EMERG"].includes(form.type) && <TextField size="small" fullWidth multiline minRows={2} label="Brief history" value={form.history} onChange={(event) => setField("history", event.target.value)} inputProps={{ maxLength: 1000 }} helperText={form.history.length + " / 1,000"} sx={{ mt: 2 }} />}
        <Autocomplete value={null} disabled={!form.member} options={DIAGNOSES.filter((diagnosis) => (form.type === "DENT" ? diagnosis.dental : !diagnosis.dental) && !form.diagnoses.some((item) => item.code === diagnosis.code))} getOptionLabel={(diagnosis) => diagnosis.code + " · " + diagnosis.label} onChange={(_event, diagnosis) => addDiagnosis(diagnosis)} renderInput={(params) => <TextField {...params} size="small" label="Search and add diagnosis" placeholder="Code or description" helperText={!form.member ? "Find a sample member first." : "One Primary diagnosis is required. Add Secondary or Tertiary diagnoses as needed."} />} sx={{ mt: 2 }} />
        <div className="diagnosis-list">{form.diagnoses.map((diagnosis) => <div className="diagnosis-row" key={diagnosis.code}><span className="diagnosis-code">{diagnosis.code}</span><span className="diagnosis-label">{diagnosis.label}</span><TextField size="small" select value={diagnosis.rank} onChange={(event) => rankDiagnosis(diagnosis.code, event.target.value)} inputProps={{ "aria-label": "Rank for " + diagnosis.code }}>{["Primary", "Secondary", "Tertiary"].map((rank) => <MenuItem key={rank} value={rank}>{rank}</MenuItem>)}</TextField><IconButton aria-label={"Remove diagnosis " + diagnosis.code} onClick={() => removeDiagnosis(diagnosis.code)}><X size={16} /></IconButton></div>)}</div>
      </Section>
      <Section id="procedures" step="4" title="Doctors & procedures" description="Choose a doctor on each line, then select from that doctor's sample catalogue." action={<Chip size="small" label={form.lines.length + (form.lines.length === 1 ? " line" : " lines")} />}>
        {!canAdd && <div className="empty-member"><Stethoscope size={23} /><span>Find a member and add a diagnosis to unlock procedure selection.</span></div>}
        {form.lines.map((line, index) => <ProcedureLine key={line.id} line={line} index={index} type={form.type} member={form.member} date={form.date} medicalClass={form.medicalClass} doctors={doctors} diagnoses={form.diagnoses} expanded={expandedLine === line.id} onExpand={(open) => setExpandedLine(open ? line.id : "")} onUpdate={(updated) => setForm((current) => ({ ...current, lines: current.lines.map((item) => item.id === line.id ? updated : item) }))} onRemove={() => setForm((current) => ({ ...current, lines: current.lines.filter((item) => item.id !== line.id) }))} onDuplicate={() => duplicateLine(line)} showErrors={showErrors} />)}
        <Button variant="outlined" startIcon={<Plus size={17} />} disabled={!canAdd} onClick={() => addLine()} sx={{ mt: 1.5 }}>Add procedure line</Button>

      </Section>
      <Section id="documents" step="5" title="Documents & remarks" description={["OLP", "IP"].includes(form.type) ? "Supporting document required for this sample journey." : "Supporting documents are optional for this sample journey."}>
        <div className="upload-zone"><Upload size={25} /><div><strong>Add supporting documents</strong><p>{["ACU", "PEME"].includes(form.type) ? "PDF, PNG or JPEG" : "PDF, PNG, JPEG or TIFF"} · up to {["DENT", "ACU", "PEME"].includes(form.type) ? "10" : "30"} MB per file</p><small>Only filenames are kept in this tab. Nothing is uploaded.</small></div><Button variant="outlined" onClick={() => upload.current?.click()}>Choose files</Button></div>
        <input type="file" ref={upload} hidden multiple accept={["ACU", "PEME"].includes(form.type) ? ".pdf,.png,.jpg,.jpeg" : ".pdf,.png,.jpg,.jpeg,.tif,.tiff"} onChange={(event) => { addFiles(Array.from(event.target.files)); event.target.value = ""; }} />
        <Button size="small" startIcon={<FileCheck2 size={16} />} onClick={() => { if (!form.files.some((file) => file.sample)) setField("files", [...form.files, { id: crypto.randomUUID(), name: "Doctor-request-example.pdf", size: 146000, sample: true }]); }}>Use a sample document</Button>
        {fileError && <Alert severity="error">{fileError}</Alert>}
        {form.files.map((file) => <div className="file-row" key={file.id}><FileCheck2 size={18} /><span>{file.name}<small>{file.sample ? "Sample placeholder" : "Local filename only"} · {Math.ceil(file.size / 1024)} KB</small></span><IconButton aria-label={"Remove " + file.name} onClick={() => setField("files", form.files.filter((item) => item.id !== file.id))}><Trash2 size={16} /></IconButton></div>)}
        <TextField size="small" multiline minRows={3} fullWidth label="Remarks" placeholder="Add relevant information about the request" value={form.remarks} inputProps={{ maxLength: 2000 }} onChange={(event) => setField("remarks", event.target.value)} helperText={form.remarks.length + " / 2,000"} sx={{ mt: 3 }} />
      </Section>
    </div><aside className="request-summary" aria-label="Request summary"><h3>Request summary</h3><span className="summary-type">{TYPES.find((type) => type.code === form.type)?.label}</span><dl><div><dt>Member</dt><dd>{form.member?.name ?? "Not yet verified"}</dd></div><div><dt>Availment</dt><dd>{dateLabel(form.date)}</dd></div><div><dt>Diagnoses</dt><dd>{form.diagnoses.length}</dd></div><div><dt>Procedure lines</dt><dd>{form.lines.length}</dd></div></dl><div className="summary-amount"><span>Scheduled amounts</span><strong>{money(scheduled)}</strong></div><div className="summary-amount"><span>Entered PAC charges</span><strong>{money(charged)}</strong></div><p>Separate sample amounts. These are not approved benefits or a net payable total.</p><div className="summary-check"><span className={errors.length ? "status-pending" : "status-ready"} />{errors.length ? "Complete the form to review" : "Ready for demo review"}</div></aside></div>
    <footer className="form-footer"><Button startIcon={<RotateCcw size={16} />} onClick={() => reset()}>Reset demo</Button><div><span className="footer-hint">{form.lines.length} procedure {form.lines.length === 1 ? "line" : "lines"} · Demo only</span><Button variant="contained" disableElevation endIcon={<ArrowRight size={17} />} onClick={openReview} disabled={memberLoading}>Review request</Button></div></footer>
    <Drawer anchor="right" open={drawer} onClose={() => setDrawer(false)}><div className="demo-drawer"><div className="dialog-title"><h2>Explore the demo</h2><IconButton aria-label="Close demo scenarios" onClick={() => setDrawer(false)}><X size={20} /></IconButton></div><p>All records below are fictional. Scenarios replace the current demo draft.</p><h3>Sample journeys</h3>{[["dental", "Dental & anatomy", "Three procedures, tooth selection, a quadrant and different dentists.", Stethoscope], ["pricing", "Fee schedule + Price As Charged", "Scheduled amounts, an editable total charge and a sample document.", FlaskConical], ["rvs", "RVS & doctor roles", "Main, Assistant and Anesthetist on a surgical procedure line.", UserRound]].map(([key, title, description, Icon]) => <button className="scenario-card" key={key} onClick={() => loadScenario(key)}><Icon size={22} /><div><strong>{title}</strong><span>{description}</span></div><ChevronRight size={18} /></button>)}<h3>Sample members</h3>{MEMBERS.map((member) => <button className="sample-member" key={member.id} onClick={() => chooseMember(member)}><div><strong>{member.name}</strong><span>{member.card} · {dateLabel(member.dob)}</span><small>{member.dental ? "Includes sample Dental benefit" : "No Dental benefit — try the error state"}</small></div><ChevronRight size={17} /></button>)}<h3>Logged-in organisation</h3>{ORGANISATIONS.map((org) => <button className="sample-member" key={org.id} onClick={() => { reset(org); setDrawer(false); setNotice("Switched demo organisation. A new draft has started."); }}><div><strong>{org.name}</strong><span>{org.dental ? "Dental enabled · sample Hub affiliation" : "Dental unavailable · medical organisation"}</span></div><Building2 size={20} /></button>)}<Alert severity="info" sx={{ mt: 3 }}>No real member lookup, OHI access, upload or LOA submission occurs. Reloading clears your draft.</Alert></div></Drawer>
    <ReviewDialog open={review} onClose={() => setReview(false)} state={form} submitted={submitted} onSubmit={() => setSubmitted(true)} onNew={() => reset()} />
    <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice("")} message={notice} action={<IconButton color="inherit" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={17} /></IconButton>} />
  </Shell>;
}
