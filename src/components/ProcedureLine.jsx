import { Alert, Button, Chip, IconButton, Tooltip } from "@mui/material";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { amountFor, deductionTotal, doctorName, doctorSpecialty, lineErrors, money, procedureFor, roomTypeFor, siteLabel } from "../domain.js";

export default function ProcedureLine({ line, index, type, member, date, medicalClass, diagnoses, onEdit, onRemove, onDuplicate, showErrors }) {
  const procedure = procedureFor(line);
  const amount = amountFor(line);
  const deductions = deductionTotal(line);
  const errors = lineErrors(line, type, member, { type, member, date, medicalClass });
  return <article className="procedure-line procedure-card compact-procedure" aria-label={"Procedure line " + (index + 1)}>
    <div className="line-summary">
      <span className="line-number">{String(index + 1).padStart(2, "0")}</span>
      <div className="line-summary-text"><strong>{procedure?.name ?? "New procedure"}</strong><small>{line.code} · {doctorName(line.doctorId)} · {doctorSpecialty(line.doctorId)}</small></div>
      <div className="line-actions"><Button size="small" startIcon={<Pencil size={15} />} onClick={onEdit} aria-label={"Edit line " + (index + 1)}>Edit</Button><Tooltip title={procedure?.group === "RVS" ? "Add another line for this RVS procedure" : "Duplicate for a different tooth/site"}><IconButton aria-label={"Duplicate line " + (index + 1)} onClick={onDuplicate}><Copy size={17} /></IconButton></Tooltip><Tooltip title="Remove line"><IconButton aria-label={"Remove line " + (index + 1)} onClick={onRemove}><Trash2 size={17} /></IconButton></Tooltip></div>
    </div>
    <div className="line-facts"><span>Quantity <strong>{line.quantity}</strong></span>{line.site && <span>{siteLabel(line)}</span>}{roomTypeFor(line, type) && <span>Room type <strong>{roomTypeFor(line, type).label}</strong></span>}{line.modifier && <span>Modifier <strong>{line.modifier}</strong></span>}<span>{procedure?.pricing === "pac" ? "Charged amount" : "Allowed amount"} <strong>{amount === null ? "Needs reassessment" : money(amount)}</strong></span></div>
    <div className="line-diagnoses"><span>Diagnoses</span><div className="chip-row">{diagnoses.filter((diagnosis) => line.diagnoses.includes(diagnosis.code)).map((diagnosis) => <Tooltip key={diagnosis.code} title={diagnosis.label + " · " + diagnosis.rank}><Chip size="small" variant="outlined" aria-label={diagnosis.code + " · " + diagnosis.label + " · " + diagnosis.rank} label={diagnosis.code + " · " + diagnosis.rank} /></Tooltip>)}{!line.diagnoses.length && <span className="missing-diagnosis">No diagnoses applied — edit this line.</span>}</div></div>
    {Object.keys(line.deductions).length > 0 && <p className="line-deduction-summary">Deductions <strong>{deductions === null ? "Incomplete" : money(deductions)}</strong><span> · Itemized in request summary</span></p>}
    {line.stale && <Alert severity="warning" sx={{ mt: 1.5 }}>Request context changed. Edit this line to reconfirm its procedure and amount.</Alert>}
    {showErrors && errors.length > 0 && <Alert severity="error" sx={{ mt: 1.5 }}><ul className="error-list">{errors.map((error) => <li key={error}>{error}</li>)}</ul></Alert>}
  </article>;
}
