import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Snackbar, TextField } from '@mui/material';
import { FileCheck2, Search, Trash2, Upload, ArrowRight } from 'lucide-react';
import Shell from './components/Shell.jsx';
import Section from './components/Section.jsx';
import ScenarioTabs from './components/ScenarioTabs.jsx';
import { MEMBERS, ORGANISATIONS } from './data.js';
import { dateLabel, money } from './domain.js';
import { canEnterClaimAmount, claimAmount, claimErrors, claimSample } from './claimDomain.js';

export default function ClaimDemo({ onNavigate }) {
  const [reference, setReference] = useState('DEMO-LOA-2001');
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [review, setReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState('');
  const timer = useRef(); const upload = useRef(); const errorRef = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const errors = claimErrors(claim, serviceDate, files);
  const amounts = claim?.lines.map(claimAmount) ?? [];
  const total = amounts.some(value => value === null) ? null : amounts.reduce((sum, value) => sum + value, 0);
  const member = MEMBERS[0];
  function clear() { clearTimeout(timer.current); setClaim(null); setLoading(false); setFiles([]); setFileError(''); setLookupError(''); setShowErrors(false); setServiceDate(''); setReview(false); setSubmitted(false); }
  function load(kind) { clear(); const next = claimSample(kind); setReference(next.reference); setClaim(next); setServiceDate(next.date); }
  function find() {
    clear(); setLoading(true);
    const kind = { 'DEMO-LOA-2001': 'existing', 'DEMO-LOA-2002': 'entry', 'DEMO-LOA-2003': 'blocked' }[reference.trim().toUpperCase()];
    timer.current = setTimeout(() => { setLoading(false); if (kind) load(kind); else setLookupError('No sample LOA found. Choose a scenario to try another record.'); }, 450);
  }
  function addFiles(selected) {
    if (selected.some(file => !/\.(pdf|png|jpe?g)$/i.test(file.name) || file.size > 25 * 1024 * 1024)) { setFileError('Choose PDF, PNG or JPEG files up to 25 MB each.'); return; }
    setFileError(''); setFiles(current => [...current, ...selected.map(file => ({ id: crypto.randomUUID(), name: file.name }))]);
  }
  function openReview() { setShowErrors(true); if (errors.length) { requestAnimationFrame(() => { errorRef.current?.focus(); errorRef.current?.scrollIntoView({ block: 'center' }); }); return; } setSubmitted(false); setReview(true); }
  return <Shell page="claims" org={ORGANISATIONS[1]} onNavigate={onNavigate} onSamples={() => { document.getElementById('claim-scenarios')?.scrollIntoView({ block: 'start' }); setNotice('Choose a scenario or open Review notes.'); }} onNotice={setNotice}>
    <div id="claim-scenarios"><ScenarioTabs scenarios={[[ 'existing', 'LOA amounts' ], [ 'entry', 'Enter missing charge' ], [ 'blocked', 'Manual review' ]]} onSelect={load}>
      <h3>What to review</h3><ul><li>Find the LOA, confirm member and service details, check each procedure amount, attach documents and review.</li><li>LOA amounts: source amounts remain read-only, separate from covered amounts. Procedures, doctors and diagnoses are inherited from the LOA.</li><li>Enter missing charge: proposed fix for the current screen, which requires a claimed amount but has no editor when the source amount is absent. Only missing source amounts are editable; zero is an existing amount. This is not a PAC-only rule.</li><li>Manual review: consultation with zero covered amount blocks submission, following the current Add Claim guard.</li><li>All data is fictional. No eligibility service, upload, claim creation or adjudication runs. Actual eligibility, submission recovery, invoices and payment workflows remain outside this design demo.</li></ul>
    </ScenarioTabs></div>
    <Section id="claim-search" title="Find LOA" step="1"><div className="claim-search"><TextField label="LOA number" value={reference} onChange={event => { clear(); setReference(event.target.value); }} fullWidth /><Button variant="contained" disableElevation startIcon={<Search size={18} />} disabled={loading || !reference.trim()} onClick={find}>{loading ? 'Finding LOA…' : 'Find LOA'}</Button></div><div aria-live="polite">{lookupError && <Alert severity="error" sx={{ mt: 2 }}>{lookupError}</Alert>}{!claim && !lookupError && <p className="empty-claim">{loading ? 'Retrieving LOA details…' : 'Find an LOA to view its member and procedures.'}</p>}</div></Section>
    {showErrors && errors.length > 0 && <div tabIndex={-1} ref={errorRef}><Alert severity="error"><ul className="error-list">{errors.map(error => <li key={error}>{error}</li>)}</ul></Alert></div>}
    {claim && <>
      <Section id="claim-member" title="LOA & member" step="2" action={<Chip size="small" label={claim.reference} variant="outlined" />}>
        <div className="claim-member-heading"><div><h3>{member.name}</h3><p>{member.company}</p></div><Chip size="small" label={claim.label} /></div>
        <dl className="claim-facts"><div><dt>Card number</dt><dd>{member.card}</dd></div><div><dt>Date of birth</dt><dd>{dateLabel(member.dob)}</dd></div><div><dt>Card expiry</dt><dd>{dateLabel(member.expiry)}</dd></div><div><dt>Clinic / hospital</dt><dd>{ORGANISATIONS[1].name}</dd></div><div><dt>Attending doctor</dt><dd>Dr. Adrian Flores</dd></div><div><dt>Availment date</dt><dd>{dateLabel(claim.date)}</dd></div></dl>
        <div className="field-grid two"><TextField type="date" label="Service date" required value={serviceDate} onChange={event => setServiceDate(event.target.value)} /><TextField label="Chief complaint" value="Fever" InputProps={{ readOnly: true }} /></div>
      </Section>
      <Section id="claim-procedures" title="Procedures & amounts" step="3" action={<Chip size="small" label={claim.lines.length + ' lines'} />}>
        {claim.type === 'OPCON' && claim.covered <= 0 && <Alert severity="warning" sx={{ mb: 2 }}>Covered amount is zero. Manual adjudication is required before this consultation claim can proceed.</Alert>}
        {claim.lines.map((line, index) => <article className="claim-line" key={line.id}><div className="claim-line-title"><span className="line-number">{index + 1}</span><div><h3>{line.name}</h3><p>{line.code} · {line.doctor}</p></div></div><p className="claim-diagnosis">{line.diagnosis}</p><div className="field-grid two"><TextField fullWidth label="Covered amount from LOA" value={money(line.covered)} InputProps={{ readOnly: true }} />{canEnterClaimAmount(line) ? <TextField fullWidth label={'Charged amount · line ' + (index + 1)} required value={line.entered} placeholder="0.00" onChange={event => setClaim(current => ({ ...current, lines: current.lines.map(item => item.id === line.id ? { ...item, entered: event.target.value } : item) }))} inputProps={{ inputMode: 'decimal' }} InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }} helperText="Enter the total charge for this procedure." /> : <TextField fullWidth label={'Claimed amount · line ' + (index + 1)} value={money(line.sourceAmount)} InputProps={{ readOnly: true }} helperText="From LOA" />}</div></article>)}
        <div className="claim-total"><span>Total claimed amount</span><strong>{total === null ? 'Complete amounts' : money(total)}</strong></div>
      </Section>
      <Section id="claim-documents" title="Supporting documents" step="4" action={<Chip size="small" label="Required" variant="outlined" />}>
        <div className="upload-zone"><Upload size={24} /><div><strong>Claim documents</strong><p>PDF, PNG or JPEG · up to 25 MB per file</p></div><Button variant="outlined" onClick={() => upload.current?.click()}>Choose claim files</Button></div>
        <input ref={upload} hidden type="file" accept=".pdf,.png,.jpg,.jpeg" multiple onChange={event => { addFiles(Array.from(event.target.files)); event.target.value = ''; }} />
        <Button size="small" startIcon={<FileCheck2 size={16} />} onClick={() => setFiles(current => current.some(file => file.id === 'sample') ? current : [...current, { id: 'sample', name: 'Claim-support-example.pdf' }])}>Use sample claim document</Button>
        {fileError && <Alert severity="error">{fileError}</Alert>}{files.map(file => <div className="file-row" key={file.id}><FileCheck2 size={18} /><span>{file.name}</span><IconButton aria-label={'Remove ' + file.name} onClick={() => setFiles(current => current.filter(item => item.id !== file.id))}><Trash2 size={18} /></IconButton></div>)}
      </Section>
    </>}
    <footer className="form-footer"><Button onClick={clear}>Reset claim</Button><Button variant="contained" disableElevation endIcon={<ArrowRight size={18} />} disabled={!claim || loading || submitted} onClick={openReview}>Review claim</Button></footer>
    <Dialog open={review} onClose={() => setReview(false)} fullWidth maxWidth="sm" aria-labelledby="claim-review-title"><DialogTitle id="claim-review-title">{submitted ? 'Claim simulation complete' : 'Review claim'}</DialogTitle><DialogContent>{submitted ? <Alert severity="success">No claim was created or sent. This was a design simulation.</Alert> : <><dl className="claim-facts"><div><dt>LOA</dt><dd>{claim?.reference}</dd></div><div><dt>Member</dt><dd>{member.name}</dd></div><div><dt>Service date</dt><dd>{serviceDate && dateLabel(serviceDate)}</dd></div></dl>{claim?.lines.map(line => <div className="claim-review-line" key={line.id}><span>{line.name}</span><strong>{money(claimAmount(line) ?? 0)}</strong></div>)}<div className="claim-total"><span>Total claimed</span><strong>{money(total ?? 0)}</strong></div><p>{files.map(file => file.name).join(', ')}</p></>}</DialogContent><DialogActions><Button onClick={() => setReview(false)}>{submitted ? 'Close claim review' : 'Back to claim'}</Button>{!submitted && <Button variant="contained" disableElevation onClick={() => setSubmitted(true)}>Simulate claim submission</Button>}</DialogActions></Dialog>
    <Snackbar open={Boolean(notice)} autoHideDuration={4000} message={notice} onClose={() => setNotice('')} />
  </Shell>;
}
