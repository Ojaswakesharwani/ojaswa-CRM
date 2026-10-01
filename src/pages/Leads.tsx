// =============================================================
// Leads Page — Pipeline, Grid, List, Search, Filter, Detail
// =============================================================
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Search, Grid, List, Filter, ExternalLink, Edit2,
  Send, CheckCircle, XCircle, MessageSquare, ChevronRight,
  Calendar, ArrowLeft, Trash2, Copy, Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { AddLeadModal } from '../components/AddLeadModal';
import type { Lead, LeadStatus } from '../types';
import { formatINRFull } from '../utils/kpi';

// ============================================================
// Status Badge
// ============================================================
function StatusBadge({ status }: { status: LeadStatus }) {
  const labels: Record<LeadStatus, string> = {
    YET_TO_SEND: 'Yet to Send', SENT: 'Sent', REPLIED: 'Replied',
    INTERESTED: 'Interested', CALL: 'Call', PROPOSAL: 'Proposal',
    ACCEPTED: 'Accepted', NOT_ACCEPTED: 'Not Accepted', WON: 'Won', LOST: 'Lost',
  };
  return <span className={`status-badge status-${status}`}>{labels[status]}</span>;
}

// ============================================================
// Pipeline Bar
// ============================================================
const PIPELINE_STAGES: { status: LeadStatus; label: string }[] = [
  { status: 'YET_TO_SEND', label: 'Draft' },
  { status: 'SENT', label: 'Sent' },
  { status: 'REPLIED', label: 'Replied' },
  { status: 'INTERESTED', label: 'Interest' },
  { status: 'CALL', label: 'Call' },
  { status: 'PROPOSAL', label: 'Proposal' },
  { status: 'ACCEPTED', label: 'Accept' },
  { status: 'WON', label: 'Won' },
];

function Pipeline({ leads, activeFilter, onFilter }: {
  leads: Lead[];
  activeFilter: LeadStatus | null;
  onFilter: (s: LeadStatus | null) => void;
}) {
  return (
    <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
        Pipeline
      </div>
      <div className="pipeline-stages">
        {PIPELINE_STAGES.map(({ status, label }) => {
          const count = leads.filter((l) => l.status === status).length;
          return (
            <div
              key={status}
              className={`pipeline-stage ${activeFilter === status ? 'active' : ''}`}
              onClick={() => onFilter(activeFilter === status ? null : status)}
              role="button"
              aria-pressed={activeFilter === status}
              aria-label={`Filter by ${label}: ${count} leads`}
            >
              <div className="pipeline-stage-inner">
                <div className="pipeline-stage-count">{count}</div>
                <div className="pipeline-stage-label">{label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Lead Card (Grid)
// ============================================================
function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { changeLeadStatus } = useApp();
  const { success } = useToast();

  const markSent = (e: React.MouseEvent) => {
    e.stopPropagation();
    changeLeadStatus(lead.id, 'SENT', 'Marked as sent');
    success(`${lead.companyName} marked as Sent`);
  };

  const accept = (e: React.MouseEvent) => {
    e.stopPropagation();
    changeLeadStatus(lead.id, 'ACCEPTED', 'Client accepted');
    success(`${lead.companyName} — Accepted!`);
  };

  const reject = (e: React.MouseEvent) => {
    e.stopPropagation();
    changeLeadStatus(lead.id, 'NOT_ACCEPTED', 'Client did not accept');
    success(`${lead.companyName} marked as Not Accepted`);
  };

  return (
    <div className="lead-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()} aria-label={`Lead: ${lead.companyName}`}>
      {lead.isDemo && (
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span className="code-tag">DEMO</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="lead-card-company">{lead.companyName}</div>
          <div className="lead-card-contact">{lead.contactPerson} {lead.contactRole ? `· ${lead.contactRole}` : ''}</div>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="lead-card-meta">
        {lead.industry && <span className="lead-card-tag">{lead.industry}</span>}
        {lead.leadSource && <span className="lead-card-tag">{lead.leadSource}</span>}
        {lead.recommendedService && <span className="lead-card-tag">{lead.recommendedService}</span>}
      </div>

      {lead.dealValue > 0 && (
        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>
          {formatINRFull(lead.dealValue)}
        </div>
      )}

      {lead.nextFollowUp && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={10} />
          Follow-up: {lead.nextFollowUp}
        </div>
      )}

      <div className="lead-card-actions">
        {lead.status === 'YET_TO_SEND' && (
          <button className="btn btn-sm btn-outline" onClick={markSent} aria-label="Mark Sent">
            <Send size={11} /> Sent
          </button>
        )}
        {['PROPOSAL', 'CALL', 'INTERESTED'].includes(lead.status) && (
          <>
            <button className="btn btn-sm btn-accent" onClick={accept} style={{ fontSize: 11, padding: '3px 10px' }}>
              <CheckCircle size={11} /> Accept
            </button>
            <button className="btn btn-sm btn-danger" onClick={reject} style={{ fontSize: 11, padding: '3px 10px' }}>
              <XCircle size={11} /> Reject
            </button>
          </>
        )}
        <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          Open <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Lead List Row
// ============================================================
function LeadListRow({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background var(--transition-fast)',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ flex: 2, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{lead.companyName}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{lead.contactPerson}</div>
      </div>
      <StatusBadge status={lead.status} />
      <div style={{ flex: 1, fontSize: 12, color: 'var(--color-text-tertiary)', display: 'none', minWidth: 100 }} className="hide-mobile">
        {lead.leadSource}
      </div>
      <div style={{ flex: 1, fontSize: 12, color: lead.dealValue > 0 ? 'var(--color-accent)' : 'var(--color-text-tertiary)', fontWeight: lead.dealValue > 0 ? 700 : 400 }}>
        {lead.dealValue > 0 ? formatINRFull(lead.dealValue) : '—'}
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', minWidth: 80 }}>
        {lead.nextFollowUp || '—'}
      </div>
      <ChevronRight size={14} color="var(--color-text-tertiary)" />
    </div>
  );
}

// ============================================================
// Lead Detail Page
// ============================================================
export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, changeLeadStatus, addLeadNote, deleteLead } = useApp();
  const { success } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const lead = data.leads.find((l) => l.id === id);
  if (!lead) return (
    <div className="empty-state">
      <div className="empty-state-title">Lead not found</div>
      <button className="btn btn-outline" onClick={() => navigate('/leads')}>← Back to Leads</button>
    </div>
  );

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleStatusChange = (status: LeadStatus) => {
    changeLeadStatus(lead.id, status);
    success(`Status changed to ${status.replace('_', ' ')}`);
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    addLeadNote(lead.id, note.trim());
    setNote('');
    setShowNoteInput(false);
    success('Note added');
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete ${lead.companyName}? This cannot be undone.`)) return;
    deleteLead(lead.id);
    navigate('/leads');
    success('Lead deleted');
  };

  const STATUS_OPTIONS: LeadStatus[] = ['YET_TO_SEND', 'SENT', 'REPLIED', 'INTERESTED', 'CALL', 'PROPOSAL', 'ACCEPTED', 'NOT_ACCEPTED', 'WON', 'LOST'];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/leads')} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>{lead.companyName}</h1>
            <StatusBadge status={lead.status} />
            {lead.isDemo && <span className="code-tag">DEMO</span>}
          </div>
          {lead.dealValue > 0 && (
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-accent)', marginTop: 2 }}>
              {formatINRFull(lead.dealValue)}
            </div>
          )}
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
          <Edit2 size={13} /> Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
          <Trash2 size={13} /> Delete
        </button>
      </div>

      {/* Quick Status Actions */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
          Change Status
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`filter-chip ${lead.status === s ? 'active' : ''}`}
              onClick={() => handleStatusChange(s)}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        {/* Prominent Accept/Reject */}
        {['PROPOSAL', 'CALL', 'INTERESTED', 'SENT', 'REPLIED'].includes(lead.status) && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
            <button className="btn btn-accent" onClick={() => handleStatusChange('ACCEPTED')}>
              <CheckCircle size={14} /> ACCEPTED
            </button>
            <button className="btn btn-danger" onClick={() => handleStatusChange('NOT_ACCEPTED')}>
              <XCircle size={14} /> NOT ACCEPTED
            </button>
            <button className="btn btn-primary" onClick={() => handleStatusChange('WON')} style={{ background: '#10b981', color: '#000' }}>
              🏆 WON
            </button>
          </div>
        )}
      </div>

      <div className="grid-2">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Company */}
          <div className="card">
            <div className="detail-section-title">Company</div>
            <Field label="Name" value={lead.companyName} />
            <Field label="Type" value={lead.companyType} />
            <Field label="Industry" value={lead.industry} />
            <Field label="Location" value={[lead.city, lead.country].filter(Boolean).join(', ')} />
            {lead.website && (
              <div className="detail-field">
                <div className="detail-field-label">Website</div>
                <a href={lead.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {lead.website} <ExternalLink size={11} />
                </a>
              </div>
            )}
            {lead.androidApp && <Field label="Android App" value={lead.androidApp} />}
          </div>

          {/* Contact */}
          <div className="card">
            <div className="detail-section-title">Contact</div>
            <Field label="Person" value={lead.contactPerson} />
            <Field label="Role" value={lead.contactRole} />
            {lead.email && (
              <div className="detail-field">
                <div className="detail-field-label">Email</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="detail-field-value">{lead.email}</span>
                  <button className="btn btn-ghost btn-icon" onClick={() => copyText(lead.email, 'email')} aria-label="Copy email">
                    {copied === 'email' ? <Check size={12} color="var(--color-accent)" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            )}
            {lead.whatsapp && (
              <div className="detail-field">
                <div className="detail-field-label">WhatsApp</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="detail-field-value">{lead.whatsapp}</span>
                  <button className="btn btn-ghost btn-icon" onClick={() => copyText(lead.whatsapp, 'wa')} aria-label="Copy WhatsApp">
                    {copied === 'wa' ? <Check size={12} color="var(--color-accent)" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            )}
            {lead.linkedinUrl && (
              <div className="detail-field">
                <div className="detail-field-label">LinkedIn</div>
                <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                  View Profile <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Opportunity */}
          <div className="card">
            <div className="detail-section-title">Opportunity</div>
            <Field label="Why This Lead" value={lead.whyThisLead} />
            <Field label="Problem" value={lead.potentialProblem} />
            <Field label="Service" value={lead.recommendedService} />
            <Field label="Personalization" value={lead.personalizationLine} />
            <Field label="Deal Value" value={lead.dealValue > 0 ? formatINRFull(lead.dealValue) : '—'} />
          </div>

          {/* Outreach */}
          <div className="card">
            <div className="detail-section-title">Outreach</div>
            <Field label="Source" value={lead.leadSource} />
            <Field label="Service Interest" value={lead.serviceInterest} />
            <Field label="Date Added" value={lead.dateAdded} />
            <Field label="Date Contacted" value={lead.dateContacted || '—'} />
            <Field label="Next Follow-up" value={lead.nextFollowUp || '—'} />
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="card">
              <div className="detail-section-title">Notes</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{lead.notes}</div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="detail-section-title">Activity Timeline</div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowNoteInput(!showNoteInput)}>
            <MessageSquare size={12} /> Add Note
          </button>
        </div>

        {showNoteInput && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note…"
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              autoFocus
            />
            <button className="btn btn-accent btn-sm" onClick={handleAddNote}>Save</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowNoteInput(false)}>Cancel</button>
          </div>
        )}

        <div className="timeline">
          {[...lead.activities].reverse().map((activity) => (
            <div key={activity.id} className="timeline-item">
              <div className={`timeline-dot ${activity.type === 'created' ? 'accent' : ''}`} />
              <div className="timeline-time">{new Date(activity.timestamp).toLocaleString('en-IN')}</div>
              <div className="timeline-text">{activity.description}</div>
            </div>
          ))}
        </div>

        {lead.activities.length === 0 && (
          <div className="empty-state" style={{ padding: 24 }}>
            <div className="empty-state-title">No activity yet</div>
          </div>
        )}
      </div>

      {editing && <AddLeadModal onClose={() => setEditing(false)} editLead={lead} />}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  if (!value) return null;
  return (
    <div className="detail-field">
      <div className="detail-field-label">{label}</div>
      <div className="detail-field-value">{value}</div>
    </div>
  );
}

// ============================================================
// Main Leads Page
// ============================================================
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest', label: 'Highest Value' },
  { value: 'lowest', label: 'Lowest Value' },
  { value: 'followup', label: 'Next Follow-up' },
];

export function LeadsPage() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | null>(null);
  const [sourceFilter, setSourceFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let leads = [...data.leads];

    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter((l) =>
        l.companyName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter) leads = leads.filter((l) => l.status === statusFilter);
    if (sourceFilter) leads = leads.filter((l) => l.leadSource === sourceFilter);
    if (serviceFilter) leads = leads.filter((l) => l.serviceInterest === serviceFilter || l.recommendedService === serviceFilter);

    // Sort
    if (sortBy === 'newest') leads.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    else if (sortBy === 'oldest') leads.sort((a, b) => a.dateAdded.localeCompare(b.dateAdded));
    else if (sortBy === 'highest') leads.sort((a, b) => b.dealValue - a.dealValue);
    else if (sortBy === 'lowest') leads.sort((a, b) => a.dealValue - b.dealValue);
    else if (sortBy === 'followup') leads.sort((a, b) => (a.nextFollowUp || 'zzzz').localeCompare(b.nextFollowUp || 'zzzz'));

    return leads;
  }, [data.leads, search, statusFilter, sourceFilter, serviceFilter, sortBy]);

  const sources = useMemo(() => [...new Set(data.leads.map((l) => l.leadSource).filter(Boolean))], [data.leads]);
  const services = useMemo(() => [...new Set(data.leads.map((l) => l.serviceInterest || l.recommendedService).filter(Boolean))], [data.leads]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <div className="page-subtitle">// {data.leads.length} total · {filtered.length} showing</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={13} /> Filters
          </button>
          <button className="btn btn-ghost btn-icon" onClick={() => setViewMode('grid')} aria-label="Grid view" aria-pressed={viewMode === 'grid'}>
            <Grid size={16} color={viewMode === 'grid' ? 'var(--color-accent)' : undefined} />
          </button>
          <button className="btn btn-ghost btn-icon" onClick={() => setViewMode('list')} aria-label="List view" aria-pressed={viewMode === 'list'}>
            <List size={16} color={viewMode === 'list' ? 'var(--color-accent)' : undefined} />
          </button>
          <button className="btn btn-accent" onClick={() => setShowAdd(true)} id="new-lead-btn">
            <Plus size={15} /> New Lead
          </button>
        </div>
      </div>

      {/* Search + Sort */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} className="search-icon" />
          <input
            className="form-input search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            aria-label="Search leads"
          />
        </div>
        <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: 160 }}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card" style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Source</label>
              <select className="form-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="">All Sources</option>
                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Service</label>
              <select className="form-select" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                <option value="">All Services</option>
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setSourceFilter(''); setServiceFilter(''); setSearch(''); setStatusFilter(null); }}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline */}
      <Pipeline leads={data.leads} activeFilter={statusFilter} onFilter={setStatusFilter} />

      {/* Lead list / grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={24} />
          </div>
          <div className="empty-state-title">
            {data.leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
          </div>
          <div className="empty-state-desc">
            {data.leads.length === 0
              ? 'Your pipeline starts here. Add your first prospect to get started.'
              : 'Try adjusting your search or filters.'}
          </div>
          {data.leads.length === 0 && (
            <button className="btn btn-accent" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add First Lead
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="lead-grid">
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={() => navigate(`/leads/${lead.id}`)} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'flex',
            gap: 12,
            padding: '10px 16px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface-2)',
          }}>
            <div style={{ flex: 2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Company</div>
            <div style={{ width: 110, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Status</div>
            <div style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Value</div>
            <div style={{ width: 90, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Follow-up</div>
            <div style={{ width: 24 }} />
          </div>
          {filtered.map((lead) => (
            <LeadListRow key={lead.id} lead={lead} onClick={() => navigate(`/leads/${lead.id}`)} />
          ))}
        </div>
      )}

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
