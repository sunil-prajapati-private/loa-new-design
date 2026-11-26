import { Alert, Chip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { QUADRANTS, TOOTH_CHARTS } from "../data.js";

function ToothIcon() {
  return <svg width="21" height="27" viewBox="0 0 24 30" fill="none" aria-hidden="true"><path d="M12 4C8 0 3 2 3 8c0 5 2 6 2 11 0 4 1 8 3 8s1-11 4-11 2 11 4 11 3-4 3-8c0-5 2-6 2-11 0-6-5-8-9-4Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.4" /></svg>;
}
export default function DentalSitePicker({ kind, value, onChange, extracted, dentition, onDentitionChange, takenTeeth = [] }) {
  if (kind === "none") return <div className="site-none">This sample procedure does not require a tooth or quadrant.</div>;
  const chart = TOOTH_CHARTS[dentition];
  if (!chart) return <Alert severity="info">Verify the member and availment date to load the dental chart.</Alert>;
  return <div className="anatomy-panel">
    <div className="dental-chart-selector"><span>Dental chart</span><div className="dental-chart-controls"><ToggleButtonGroup size="small" color="primary" exclusive value={dentition} onChange={(_event, next) => next && next !== dentition && onDentitionChange(next)} aria-label="Tooth chart type">{Object.entries(TOOTH_CHARTS).map(([key, option]) => <ToggleButton key={key} value={key}>{option.label}</ToggleButton>)}</ToggleButtonGroup></div></div>
    <div className="anatomy-title"><strong>{kind === "quadrant" ? "Dental quadrant" : "Tooth number"} <span>*</span></strong><Chip size="small" color={value ? "primary" : "default"} label={value ? (kind === "quadrant" ? "Quadrant " : "Tooth ") + value + " selected" : "Select one " + kind} /></div>
    {kind === "quadrant" ? <ToggleButtonGroup exclusive value={value} onChange={(_event, next) => next && onChange(next)} className="quadrant-grid" aria-label="Dental quadrant">{QUADRANTS.map((quadrant) => <ToggleButton key={quadrant.value} value={quadrant.value}>{quadrant.label}<small>{quadrant.value}</small></ToggleButton>)}</ToggleButtonGroup> : <>
      <div className={"dental-chart " + dentition} aria-label={chart.label + " chart"}>{chart.rows.map((row, rowIndex) => <div className="dental-arch" key={rowIndex}>{[row.slice(0, row.length / 2), row.slice(row.length / 2)].map((numbers, side) => <div className="tooth-quadrant" key={side}><div className="dental-axis">{rowIndex ? "Lower" : "Upper"} {side ? "left" : "right"} · patient’s side</div><div className="tooth-row" role="group" aria-label={(rowIndex ? "Lower " : "Upper ") + (side ? "left teeth" : "right teeth")}>{numbers.map((number) => { const historical = extracted.includes(String(number)); const taken = takenTeeth.includes(String(number)); const blocked = historical || taken; const reason = historical ? " — previously extracted" : taken ? " — used by another procedure" : ""; return <button key={number} type="button" disabled={blocked} aria-label={"Tooth " + number + reason} aria-pressed={value === String(number)} title={historical ? "Previously extracted in sample history" : taken ? "Already used by another procedure in this request" : "Select tooth " + number} className={"tooth" + (value === String(number) ? " selected" : "") + (taken && !historical ? " tooth-used" : "")} onClick={() => onChange(String(number))}><ToothIcon /><span>{number}</span></button>; })}</div></div>)}</div>)}</div>
      <div className="chart-legend"><span><i className="legend-selected" />Selected</span><span><i className="legend-used" />Used in this request</span><span><i className="legend-disabled" />Previously extracted · sample history</span></div>
    </>}
    <p className="field-note">{chart.label} · {kind === "tooth" ? chart.rows.flat().length + " teeth. One tooth per line." : "One quadrant per line."} Each tooth can be used only once in this request.</p>
  </div>;
}
