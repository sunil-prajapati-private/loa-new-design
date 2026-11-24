import { useState } from "react";
import { Avatar, Button, Chip, IconButton, Tooltip } from "@mui/material";
import { ArrowLeftToLine, Building2, ClipboardList, FileText, LayoutDashboard, Menu, SlidersHorizontal, FolderOpen } from "lucide-react";

export default function Shell({ org, onSamples, onNotice, children }) {
  const [expanded, setExpanded] = useState(false);
  return <div className={expanded ? "app-shell rail-open" : "app-shell"}>
    <header className="app-header">
      <div className="brand-wrap"><img src="./gopartner-logo.png" alt="GoPartner" /><span className="welcome">Welcome back, Demo Reviewer</span></div>
      <div className="header-tools"><Chip className="organisation-chip" icon={<Building2 size={15} />} label="Organisation" size="small" variant="outlined" /><Button className="samples-button" startIcon={<SlidersHorizontal size={17} />} onClick={onSamples}>Demo scenarios</Button><Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: "#e9f1ff", color: "primary.main" }}>DR</Avatar></div>
    </header>
    <aside className="app-rail" aria-label="Portal navigation">
      <IconButton aria-label={expanded ? "Collapse navigation" : "Expand navigation"} onClick={() => setExpanded(!expanded)}><Menu size={20} /></IconButton>
      {[[LayoutDashboard, "Dashboard"], [FileText, "Letter of Authorization"], [ClipboardList, "Claims"], [FolderOpen, "Reports"]].map(([Icon, label]) => <Tooltip key={label} title={expanded ? "" : label} placement="right"><button className={label === "Letter of Authorization" ? "nav-item active" : "nav-item"} aria-current={label === "Letter of Authorization" ? "page" : undefined} aria-label={label} onClick={() => label === "Letter of Authorization" ? window.scrollTo({ top: 0, behavior: "smooth" }) : onNotice("This demo focuses on Request LOA. Other portal modules are not included.")}><Icon size={21} /><span>{label}</span></button></Tooltip>)}
      <div className="rail-bottom"><IconButton aria-label="Collapse navigation" onClick={() => setExpanded(false)}><ArrowLeftToLine size={19} /></IconButton></div>
    </aside>
    <main className="page-content"><div className="breadcrumbs">Letter of Authorization <span>/</span> <strong>Request LOA</strong></div>
      <div className="page-heading"><div><h1>Request LOA</h1><p>Create a request for your member, one procedure at a time.</p></div><Chip label="Unsaved demo draft" size="small" variant="outlined" /></div>
      <div className="demo-strip"><span><span className="demo-dot" />Interactive demo · fictional data only</span><span className="demo-org">{org.name}</span><Button size="small" onClick={onSamples}>Try another scenario</Button></div>
      {children}
    </main>
  </div>;
}
