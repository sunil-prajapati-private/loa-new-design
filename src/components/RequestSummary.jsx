import { chiefComplaintLabel } from "../portalForm.js";
import { TYPES } from "../data.js";
import { amountFor, dateLabel, deductionTotal, doctorName, doctorSpecialty, money, parseCents, procedureFor, siteLabel } from "../domain.js";
import AmountSummary from "./AmountSummary.jsx";

const showAmount = (amount) => amount === null ? "Pending" : money(amount);
export default function RequestSummary({ state, errors }) {
  return <aside className="request-summary detailed-summary compact-summary" aria-label="Request summary">
    <div className="summary-heading"><h3>Request summary</h3><span className="summary-type">{TYPES.find((type) => type.code === state.type)?.label}</span></div>

    <AmountSummary lines={state.lines} />
    <details className="summary-line-details"><summary>Request & procedure details <span>{state.lines.length} lines · {state.diagnoses.length} diagnoses</span></summary><dl className="summary-context"><div><dt>Member</dt><dd>{state.member?.name ?? "Not yet verified"}</dd></div><div><dt>Availment</dt><dd>{dateLabel(state.date)}</dd></div><div><dt>Requester / department</dt><dd>{state.requesterName || "Not provided"} · {state.department || "Not provided"}</dd></div><div><dt>Requesting / attending doctor</dt><dd>{doctorName(state.attending)}<small>{doctorSpecialty(state.attending)}</small></dd></div>{state.complaint && <div><dt>Chief complaint</dt><dd>{chiefComplaintLabel(state.complaint)}</dd></div>}</dl><div className="summary-table-scroll" tabIndex={0} role="region" aria-label="Procedure amounts and deductions"><table className="summary-lines-table"><thead><tr><th scope="col">Procedure & clinical details</th><th scope="col">Qty</th><th scope="col">Agreed CPT<br />PHP</th><th scope="col">Additional charges<br />PHP</th><th scope="col">Deductions<br />PHP</th></tr></thead><tbody>{state.lines.map((line, index) => {
      const procedure = procedureFor(line);
      const amount = amountFor(line);
      return <tr key={line.id}><th scope="row"><strong>{index + 1}. {procedure?.name ?? "Choose procedure"}</strong><small>{line.code} · {doctorName(line.doctorId)} · {doctorSpecialty(line.doctorId)}</small>{line.site && <small>{siteLabel(line)}</small>}{line.modifier && <small>Modifier: {line.modifier}</small>}<small>Diagnoses: {state.diagnoses.filter((diagnosis) => line.diagnoses.includes(diagnosis.code)).map((diagnosis) => diagnosis.code + " · " + diagnosis.label + " (" + diagnosis.rank + ")").join("; ") || "None applied"}</small>{line.assistant && <small>Assistant: {doctorName(line.assistant)} · {doctorSpecialty(line.assistant)}</small>}{line.anesthetist && <small>Anesthetist: {doctorName(line.anesthetist)} · {doctorSpecialty(line.anesthetist)}</small>}</th><td>{line.quantity}</td><td>{procedure?.pricing === "pac" ? "—" : showAmount(amount)}</td><td>{procedure?.pricing === "pac" ? showAmount(amount) : "—"}</td><td><strong>{showAmount(deductionTotal(line))}</strong>{Object.entries(line.deductions).map(([name, value]) => <small key={name}>{name}: {showAmount(parseCents(value))}</small>)}</td></tr>;
    })}</tbody></table>{!state.lines.length && <p className="field-note">Add a procedure to see the line breakdown.</p>}</div></details>
    <div className="summary-footer"><p className="summary-disclaimer">Demo amounts · subject to LOA assessment</p><div className="summary-check"><span className={errors.length ? "status-pending" : "status-ready"} />{errors.length ? "Complete the form to review" : "Ready for demo review"}</div></div>
  </aside>;
}
