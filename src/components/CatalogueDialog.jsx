import { useState } from "react";
import { Button, Chip, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ArrowRight, Search, X } from "lucide-react";
import { doctorName, money } from "../domain.js";

export default function CatalogueDialog({ open, onClose, procedures, doctorId, onSelect }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("all");
  const results = procedures.filter((p) => (filter === "all" || p.pricing === filter) && (p.code + " " + p.name).toLowerCase().includes(query.toLowerCase()));
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="catalogue-title"><DialogTitle id="catalogue-title"><div className="dialog-title">Choose a procedure<IconButton aria-label="Close procedure catalogue" onClick={onClose}><X size={20} /></IconButton></div><p className="dialog-subtitle">Available sample procedures for {doctorName(doctorId)}. All codes and prices are fictional.</p></DialogTitle><DialogContent>
    <TextField size="small" fullWidth autoFocus label="Search procedures" value={query} onChange={(event) => setQuery(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }} />
    <div className="catalogue-toolbar"><ToggleButtonGroup size="small" exclusive value={filter} onChange={(_event, next) => next && setFilter(next)} aria-label="Pricing filter"><ToggleButton value="all">All</ToggleButton><ToggleButton value="scheduled">Fee schedule</ToggleButton><ToggleButton value="pac">Price As Charged</ToggleButton></ToggleButtonGroup><span className="muted">{results.length} procedures</span></div>
    <div className="catalogue-grid">{results.map((p) => <button className="procedure-option" key={p.code} onClick={() => onSelect(p)}><div className="option-top"><span className="procedure-code">{p.code}</span><Chip size="small" label={p.group} /></div><h3>{p.name}</h3><p>{p.site === "none" ? p.modifiers ? "Laterality selection" : "No dental site required" : "One " + p.site + " per line"}</p><div className="option-bottom"><strong>{p.pricing === "scheduled" ? money(p.cents + (doctorId === "d2" ? 10000 : 0)) : p.pricing === "pac" ? "Enter your charge" : "Pricing unresolved"}</strong><ArrowRight size={18} /></div><span className={"pricing-tag " + p.pricing}>{p.pricing === "scheduled" ? "Fee schedule" : p.pricing === "pac" ? "Price As Charged" : "Review required"}</span></button>)}</div>
    {!results.length && <div className="empty-member">No sample procedures match this search and pricing filter.</div>}
    <Button sx={{ mt: 2 }} onClick={onClose}>Back to request</Button>
  </DialogContent></Dialog>;
}
