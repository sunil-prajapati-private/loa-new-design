import { REVIEW_CHECKLIST } from "../reviewChecklist.js";

export default function ReviewChecklist() {
  return <details className="review-checklist"><summary>26-point review verification · 26 November 2026</summary><p>These statuses describe this demo. Production integration, business decisions and UAT remain separate checks.</p><div className="summary-table-scroll" tabIndex={0} role="region" aria-label="Review verification checklist"><table className="summary-lines-table"><thead><tr><th scope="col">No. / item</th><th scope="col">Status</th><th scope="col">Verification / remaining work</th></tr></thead><tbody>{REVIEW_CHECKLIST.map(([number, title, status, detail]) => <tr key={number}><th scope="row">{number}. {title}</th><td>{status}</td><td>{detail}</td></tr>)}</tbody></table></div></details>;
}
