import { useId, useState } from 'react';
import { Tabs, Tab } from '@mui/material';

export default function ScenarioTabs({ scenarios, onSelect, children }) {
  const id = useId();
  const [selected, setSelected] = useState(false);
  return <div className="scenario-tabs"><Tabs value={selected} onChange={(_event, value) => setSelected(value)} variant="scrollable" scrollButtons="auto" aria-label="Review scenarios">
    {scenarios.map(([value, label]) => <Tab key={value} value={value} label={label} id={id + value} onClick={() => onSelect(value)} />)}
    <Tab value="notes" label="Review notes" id={id + "notes"} aria-controls={id + "panel"} />
  </Tabs>{selected === 'notes' && <div role="tabpanel" id={id + "panel"} aria-labelledby={id + "notes"} className="scenario-notes">{children}</div>}</div>;
}
