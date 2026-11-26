import { TYPES } from "../data.js";
import AmountSummary from "./AmountSummary.jsx";

export default function RequestSummary({ state, errors }) {
  return <aside className="request-summary compact-summary" aria-label="Request summary">
    <div className="summary-heading"><h3>Request summary</h3><span className="summary-type">{TYPES.find((type) => type.code === state.type)?.label}</span></div>

    <AmountSummary lines={state.lines} />
    <div className="summary-footer"><p className="summary-disclaimer">Demo amounts · subject to LOA assessment</p><div className="summary-check"><span className={errors.length ? "status-pending" : "status-ready"} />{errors.length ? "Complete the form to review" : "Ready for demo review"}</div></div>
  </aside>;
}
