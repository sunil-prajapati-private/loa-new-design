import { dates, parseCents } from './domain.js';
// Missing source amount is an explicit UX proposal, not a discovered PAC gate.
export const canEnterClaimAmount = (line) => line.sourceAmount === null;
export const claimAmount = (line) => canEnterClaimAmount(line) ? parseCents(line.entered) : line.sourceAmount;
export function claimErrors(claim, serviceDate, files) {
  if (!claim) return ['Find an LOA first.'];
  if (!claim.eligible) return ['This LOA is unavailable for claim creation.'];
  const errors = [];
  if (!serviceDate) errors.push('Enter the service date.');
  if (claim.type === 'OPCON' && claim.covered <= 0) errors.push('Consultation covered amount is zero. Manual adjudication is required.');
  claim.lines.forEach((line, index) => { if (claimAmount(line) === null) errors.push(`Line ${index + 1}: enter a valid non-negative charged amount with up to two decimal places.`); });
  if (!files.length) errors.push('Attach a supporting document.');
  return errors;
}
export function claimSample(kind) {
  const base = { reference: 'DEMO-LOA-2001', eligible: true, type: 'OLP', label: 'OP Lab & Procedure', covered: 130000, date: dates()[0], lines: [
    { id: 'sample-line-1', code: 'DEMO-M01', name: 'Complete blood count', doctor: 'Dr. Adrian Flores', diagnosis: 'R50.9 · Fever, unspecified', sourceAmount: 45000, covered: 45000, entered: '' },
    { id: 'sample-line-2', code: 'DEMO-M02', name: 'Chest radiograph', doctor: 'Dr. Adrian Flores', diagnosis: 'R50.9 · Fever, unspecified', sourceAmount: 85000, covered: 85000, entered: '' },
  ] };
  if (kind === 'entry') { base.reference = 'DEMO-LOA-2002'; base.lines[1] = { ...base.lines[1], sourceAmount: null }; }
  if (kind === 'blocked') { base.reference = 'DEMO-LOA-2003'; base.type = 'OPCON'; base.label = 'Outpatient consultation'; base.covered = 0; base.lines = [{ ...base.lines[0], code: 'DEMO-C01', name: 'Initial consultation', sourceAmount: 0, covered: 0 }]; }
  return base;
}
