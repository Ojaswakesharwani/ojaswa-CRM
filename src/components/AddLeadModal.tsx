// =============================================================
// Add/Edit Lead Modal — full slide-over panel
// =============================================================
import React, { useState, useEffect } from 'react';
import { X, Building2, User, Lightbulb, Wrench, Sparkles, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';
import type { Lead, LeadSource, ServiceInterest, LeadStatus } from '../types';

const LEAD_SOURCES: LeadSource[] = ['LinkedIn', 'Google Play', 'Clutch', 'Upwork', 'Contra', 'Referral', 'Website', 'Cold Email', 'WhatsApp', 'Other'];
const SERVICES: ServiceInterest[] = ['Android Bug Fix', 'API/Firebase Integration', 'Feature Development', 'Build/Gradle Fix', 'Play Store/Release Support', 'Android Maintenance', 'Other'];
const STATUSES: LeadStatus[] = ['YET_TO_SEND', 'SENT', 'REPLIED', 'INTERESTED', 'CALL', 'PROPOSAL', 'ACCEPTED', 'NOT_ACCEPTED', 'WON', 'LOST'];

interface AddLeadModalProps {
  onClose: () => void;
  editLead?: Lead;
}

const EMPTY_FORM = {
  companyName: '', companyType: '', website: '', androidApp: '', industry: '',
  country: '', city: '', contactPerson: '', contactRole: '', linkedinUrl: '',
  email: '', whatsapp: '', phone: '', whyThisLead: '', potentialProblem: '',
  recommendedService: '' as ServiceInterest | string, personalizationLine: '',
  dateAdded: new Date().toISOString().split('T')[0], dateContacted: '',
  nextFollowUp: '', leadSource: '' as LeadSource | string,
  serviceInterest: '' as ServiceInterest | string, dealValue: 0, notes: '',
  status: 'YET_TO_SEND' as LeadStatus,
};

export function AddLeadModal({ onClose, editLead }: AddLeadModalProps) {
  const { addLead, updateLead } = useApp();
  const { success } = useToast();
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (editLead) {
      setForm({
        companyName: editLead.companyName,
        companyType: editLead.companyType,
        website: editLead.website,
        androidApp: editLead.androidApp,
        industry: editLead.industry,
        country: editLead.country,
        city: editLead.city,
        contactPerson: editLead.contactPerson,
        contactRole: editLead.contactRole,
        linkedinUrl: editLead.linkedinUrl,
        email: editLead.email,
        whatsapp: editLead.whatsapp,
        phone: editLead.phone,
        whyThisLead: editLead.whyThisLead,
        potentialProblem: editLead.potentialProblem,
        recommendedService: editLead.recommendedService,
        personalizationLine: editLead.personalizationLine,
        dateAdded: editLead.dateAdded,
        dateContacted: editLead.dateContacted,
        nextFollowUp: editLead.nextFollowUp,
        leadSource: editLead.leadSource,
        serviceInterest: editLead.serviceInterest,
        dealValue: editLead.dealValue,
        notes: editLead.notes,
        status: editLead.status,
      });
    }
  }, [editLead]);

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: field === 'dealValue' ? Number(e.target.value) : e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim()) return;

    if (editLead) {
      updateLead(editLead.id, form);
      success('Lead updated');
    } else {
      addLead(form);
      success('Lead added to pipeline');
    }
    onClose();
  };

  const SectionHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 24 }}>
      <div style={{ color: 'var(--color-accent)' }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
        {title}
      </div>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="form-group" style={{ marginBottom: 12 }}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={editLead ? 'Edit Lead' : 'Add Lead'}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{editLead ? 'Edit Lead' : 'Add Lead'}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {editLead ? `// ${editLead.companyName}` : '// new_prospect.ts'}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Company */}
          <SectionHeader title="Company Information" icon={<Building2 size={13} />} />
          <div className="grid-2">
            <Field label="Company Name *">
              <input className="form-input" value={form.companyName} onChange={set('companyName')} required placeholder="Acme Corp" />
            </Field>
            <Field label="Company Type">
              <input className="form-input" value={form.companyType} onChange={set('companyType')} placeholder="Agency, Startup, Enterprise…" />
            </Field>
          </div>
          <div className="grid-2">
            <Field label="Website">
              <input className="form-input" value={form.website} onChange={set('website')} placeholder="https://example.com" type="url" />
            </Field>
            <Field label="Android App">
              <input className="form-input" value={form.androidApp} onChange={set('androidApp')} placeholder="Play Store URL or package name" />
            </Field>
          </div>
          <div className="grid-2">
            <Field label="Industry">
              <input className="form-input" value={form.industry} onChange={set('industry')} placeholder="FinTech, EdTech…" />
            </Field>
            <Field label="Country">
              <input className="form-input" value={form.country} onChange={set('country')} placeholder="India" />
            </Field>
          </div>
          <Field label="City">
            <input className="form-input" value={form.city} onChange={set('city')} placeholder="Bangalore" />
          </Field>

          {/* Contact */}
          <SectionHeader title="Contact" icon={<User size={13} />} />
          <div className="grid-2">
            <Field label="Contact Person">
              <input className="form-input" value={form.contactPerson} onChange={set('contactPerson')} placeholder="Rahul Sharma" />
            </Field>
            <Field label="Role">
              <input className="form-input" value={form.contactRole} onChange={set('contactRole')} placeholder="CTO, Founder…" />
            </Field>
          </div>
          <Field label="LinkedIn URL">
            <input className="form-input" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/…" />
          </Field>
          <div className="grid-2">
            <Field label="Email">
              <input className="form-input" value={form.email} onChange={set('email')} placeholder="rahul@example.com" type="email" />
            </Field>
            <Field label="WhatsApp">
              <input className="form-input" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+91 9876543210" />
            </Field>
          </div>
          <Field label="Phone">
            <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" />
          </Field>

          {/* Opportunity */}
          <SectionHeader title="Opportunity" icon={<Lightbulb size={13} />} />
          <Field label="Why This Lead?">
            <textarea className="form-textarea" value={form.whyThisLead} onChange={set('whyThisLead')} placeholder="Strong Play Store presence, poor ratings…" rows={2} />
          </Field>
          <Field label="Potential Android Problem">
            <textarea className="form-textarea" value={form.potentialProblem} onChange={set('potentialProblem')} placeholder="App crashes on Android 13, build issues…" rows={2} />
          </Field>
          <div className="grid-2">
            <Field label="Recommended Service">
              <select className="form-select" value={form.recommendedService} onChange={set('recommendedService')}>
                <option value="">Select…</option>
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Deal Value (₹)">
              <input className="form-input" value={form.dealValue || ''} onChange={set('dealValue')} type="number" min={0} placeholder="0" />
            </Field>
          </div>
          <Field label="Personalization Line">
            <textarea className="form-textarea" value={form.personalizationLine} onChange={set('personalizationLine')} placeholder="Your app has 2.8 stars — I can fix that…" rows={2} />
          </Field>

          {/* Outreach */}
          <SectionHeader title="Outreach" icon={<Sparkles size={13} />} />
          <div className="grid-2">
            <Field label="Lead Source">
              <select className="form-select" value={form.leadSource} onChange={set('leadSource')}>
                <option value="">Select…</option>
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Service Interest">
              <select className="form-select" value={form.serviceInterest} onChange={set('serviceInterest')}>
                <option value="">Select…</option>
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid-2">
            <Field label="Date Added">
              <input className="form-input" value={form.dateAdded} onChange={set('dateAdded')} type="date" />
            </Field>
            <Field label="Date Contacted">
              <input className="form-input" value={form.dateContacted} onChange={set('dateContacted')} type="date" />
            </Field>
          </div>
          <Field label="Next Follow-up Date">
            <input className="form-input" value={form.nextFollowUp} onChange={set('nextFollowUp')} type="date" />
          </Field>

          {/* Status */}
          <SectionHeader title="Status" icon={<Wrench size={13} />} />
          <Field label="Current Status">
            <select className="form-select" value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </Field>

          {/* Notes */}
          <SectionHeader title="Notes" icon={<FileText size={13} />} />
          <Field label="Notes">
            <textarea className="form-textarea" value={form.notes} onChange={set('notes')} placeholder="Additional context, observations…" rows={3} />
          </Field>
        </form>

        <div className="modal-footer">
          <button className="btn btn-outline" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" type="submit" onClick={handleSubmit}>
            {editLead ? 'Update Lead' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
