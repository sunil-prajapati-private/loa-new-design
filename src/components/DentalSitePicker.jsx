import { Chip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { QUADRANTS, TOOTH_ROWS } from "../data.js";

function ToothIcon() {
  return <svg width="21" height="27" viewBox="0 0 24 30" fill="none" aria-hidden="true"><path d="M12 4C8 0 3 2 3 8c0 5 2 6 2 11 0 4 1 8 3 8s1-11 4-11 2 11 4 11 3-4 3-8c0-5 2-6 2-11 0-6-5-8-9-4Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.4" /></svg>;
}
export default function DentalSitePicker({ kind, value, onChange, extracted }) {
  if (kind === "none") return <div className="site-none">This sample procedure does not require a tooth or quadrant.</div>;
  if (kind === "quadrant") return <div className="anatomy-panel"><div className="anatomy-title"><strong>Dental quadrant <span>*</span></strong><Chip size="small" label="One quadrant per line" /></div><ToggleButtonGroup exclusive value={value} onChange={(_event, next) => next && onChange(next)} className="quadrant-grid" aria-label="Dental quadrant">{QUADRANTS.map((q) => <ToggleButton key={q.value} value={q.value}>{q.label}<small>{q.value}</small></ToggleButton>)}</ToggleButtonGroup><p className="field-note">Select the quadrant for this procedure. These are demonstration requirements.</p></div>;
  return <div className="anatomy-panel"><div className="anatomy-title"><strong>Tooth number <span>*</span></strong><Chip size="small" color={value ? "primary" : "default"} label={value ? "Tooth " + value + " selected" : "Select one tooth"} /></div>
    <div className="dental-chart">{TOOTH_ROWS.map((row, rowIndex) => <div className="dental-arch" key={rowIndex}>{[row.slice(0, 8), row.slice(8)].map((numbers, side) => <div className="tooth-quadrant" key={side}><div className="dental-axis">{rowIndex ? "Lower" : "Upper"} {side ? "left" : "right"} · patient’s side</div><div className="tooth-row" role="group" aria-label={(rowIndex ? "Lower " : "Upper ") + (side ? "left teeth" : "right teeth")}>{numbers.map((number) => { const blocked = extracted.includes(String(number)); return <button key={number} type="button" disabled={blocked} aria-label={"Tooth " + number + (blocked ? " — previously extracted" : "")} aria-pressed={value === String(number)} title={blocked ? "Previously extracted in sample history" : "Select tooth " + number} className={"tooth" + (value === String(number) ? " selected" : "")} onClick={() => onChange(String(number))}><ToothIcon /><span>{number}</span></button>; })}</div></div>)}</div>)}</div>
    <div className="chart-legend"><span><i className="legend-selected" />Selected</span><span><i className="legend-disabled" />Previously extracted · sample history</span></div><p className="field-note">One tooth per line. Duplicate the line to request this procedure for another tooth.</p>
  </div>;
}
