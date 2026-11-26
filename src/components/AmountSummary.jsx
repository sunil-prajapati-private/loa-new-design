import { Alert } from "@mui/material";
import { money, requestAmounts } from "../domain.js";

const amountLabel = (value) => value === null ? "Pending completion" : money(value);
export default function AmountSummary({ lines }) {
  const amounts = requestAmounts(lines);
  return <div className="amount-summary">
    <div className="summary-totals"><div><span>Total agreed CPT amount</span><strong>{amountLabel(amounts.scheduled)}</strong></div><div><span>Estimated Additional Charges</span><strong>{amountLabel(amounts.charged)}</strong></div><div className="loa-total"><span>Total LOA Amount</span><strong>{amountLabel(amounts.totalLoa)}</strong></div></div>
    {amounts.totalLoa !== null && amounts.totalLoa < 0 && <Alert severity="warning">Deductions exceed the agreed CPT amount plus estimated additional charges. Check the amounts entered on each line.</Alert>}
    <p className="loa-formula">Total LOA = agreed CPT + additional charges − deductions · All amounts in PHP</p>
    <div className="deduction-breakdown"><h4>Deductions</h4><dl>{Object.entries(amounts.deductions).map(([name, amount]) => <div key={name}><dt>{name === "Senior Citizen" ? "Senior Citizen discount" : name}</dt><dd>{amountLabel(amount)}</dd></div>)}<div className="deduction-total"><dt>Total deductions</dt><dd>{amountLabel(amounts.totalDeductions)}</dd></div></dl></div>
  </div>;
}
