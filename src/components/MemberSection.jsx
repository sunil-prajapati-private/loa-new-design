import { Alert, Avatar, Button, Chip, CircularProgress, Skeleton, TextField } from "@mui/material";
import { BadgeCheck, Search, UserRound } from "lucide-react";
import { ageAtDate, dateLabel } from "../domain.js";
import Section from "./Section.jsx";

export default function MemberSection({ card, dob, onInput, onLookup, loading, member, error, onSamples, type, date }) {
  return <Section id="member" step="2" title="Member details" description="Find a member using their card number and date of birth." action={<Button size="small" startIcon={<UserRound size={16} />} onClick={onSamples}>Sample members</Button>}>
    <div className="member-search"><TextField fullWidth size="small" label="Maxicare card number" required value={card} inputProps={{ inputMode: "numeric", maxLength: 16 }} onChange={(event) => onInput("card", event.target.value)} /><TextField fullWidth size="small" type="date" label="Date of birth" required value={dob} InputLabelProps={{ shrink: true }} onChange={(event) => onInput("dob", event.target.value)} /><Button variant="contained" disableElevation onClick={onLookup} disabled={loading || !card || !dob} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Search size={17} />}>{loading ? "Finding member…" : "Find member"}</Button></div>

    <div aria-live="polite" aria-busy={loading}>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {loading && <div className="member-result"><Skeleton variant="circular" width={48} height={48} /><div style={{ flex: 1 }}><Skeleton width="45%" height={26} /><Skeleton width="70%" /><Skeleton width="85%" /></div></div>}
      {member && !loading && <div className="member-result">
        <Avatar sx={{ bgcolor: member.avatar, color: "primary.main", width: 52, height: 52, fontWeight: 600 }}>{member.initials}</Avatar>
        <div className="member-result-content"><div className="member-title"><h3>{member.name}</h3><Chip size="small" icon={<BadgeCheck size={14} />} label="Active · demo" color="success" variant="outlined" /></div><p>{member.company}</p>
          <dl className="member-facts"><div><dt>Age at availment</dt><dd>{ageAtDate(member.dob, date) ?? "—"}</dd></div><div><dt>Membership</dt><dd>{member.relationship}</dd></div><div><dt>Card expiry</dt><dd>{dateLabel(member.expiry)}</dd></div><div><dt>Plan</dt><dd>{member.plan}</dd></div><div><dt>Dental benefit</dt><dd>{member.dental ? "Included in sample plan" : "Not included"}</dd></div>{member.citizenship && <div><dt>Citizenship (sample)</dt><dd>{member.citizenship}</dd></div>}</dl>
        </div>
      </div>}
      {member && !member.dental && type === "DENT" && <Alert severity="warning" sx={{ mt: 1.5 }}>This sample member has no Dental benefit. The clinic can request Dental LOAs, but this member cannot complete this sample journey.</Alert>}
      {!member && !loading && !error && <div className="empty-member"><UserRound size={22} /><span>Member name, company, plan and card expiry will appear here.</span></div>}
    </div>
  </Section>;
}
