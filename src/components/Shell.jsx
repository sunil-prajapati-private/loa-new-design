import { useState } from "react";
import { Avatar, Button, Chip, IconButton, Tooltip } from "@mui/material";
import { ArrowLeftToLine, Building2, ClipboardList, FileText, LayoutDashboard, Menu, SlidersHorizontal, FolderOpen } from "lucide-react";

export default function Shell({ org, onSamples, onNotice, onNavigate, page = "loa", children }) {
  const title = page === "claims" ? "Add claim" : "Request LOA";
  const module = page === "claims" ? "Claims" : "Letter of Authorization";
  const [expanded, setExpanded] = useState(false);
  return <div className={expanded ? "app-shell rail-open" : "app-shell"}>
    <header className="app-header">
      <div className="brand-wrap"><img src="./gopartner-logo.png" alt="GoPartner" /><span className="welcome">Welcome back, Demo Reviewer</span></div>
      <div className="header-tools"><Chip className="organisation-chip" icon={<Building2 size={15} />} label="Organisation" size="small" variant="outlined" /><Button className="samples-button" startIcon={<SlidersHorizontal size={17} />} onClick={onSamples}>Demo scenarios</Button><Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: "#e9f1ff", color: "primary.main" }}>DR</Avatar></div>
    </header>
    <aside className="app-rail" aria-label="Portal navigation">
      <IconButton aria-label={expanded ? "Collapse navigation" : "Expand navigation"} onClick={() => setExpanded(!expanded)}><Menu size={20} /></IconButton>
      {[[LayoutDashboard, "Dashboard"], [FileText, "Letter of Authorization"], [ClipboardList, "Claims"], [FolderOpen, "Reports"]].map(([Icon, label]) => <Tooltip key={label} title={expanded ? "" : label} placement="right"><button className={label === module ? "nav-item active" : "nav-item"} aria-current={label === module ? "page" : undefined} aria-label={label} onClick={() => ["Letter of Authorization", "Claims"].includes(label) ? onNavigate(label === "Claims" ? "claims" : "loa") : onNotice("This module is outside the review demo.")}><Icon size={21} /><span>{label}</span></button></Tooltip>)}
      <div className="rail-bottom"><IconButton aria-label="Collapse navigation" onClick={() => setExpanded(false)}><ArrowLeftToLine size={19} /></IconButton></div>
    </aside>
    <main className="page-content">
      <nav className="module-switch" aria-label="Review pages"><Button variant={page === 'loa' ? 'contained' : 'text'} disableElevation onClick={() => onNavigate('loa')}>LOA creation</Button><Button variant={page === 'claims' ? 'contained' : 'text'} disableElevation onClick={() => onNavigate('claims')}>Claim creation</Button></nav>
      <div className="page-heading"><h1>{title}</h1><Chip label="Design demo" size="small" variant="outlined" /></div>
      <div className="demo-strip"><span>Fictional data only</span><span className="demo-org">{org.name}</span></div>
      {children}
    </main>
  </div>;
}
