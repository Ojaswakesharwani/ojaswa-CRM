// =============================================================
// Settings Page — Profile, Goals, Theme, Data Management
// =============================================================
import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, RefreshCw, Shield, Database, User, Target, Palette, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ color: 'var(--color-accent)' }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</div>
    </div>
  );
}

function FieldRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ minWidth: 160 }}>{children}</div>
    </div>
  );
}

function TemplatesSection() {
  const { data, updateTemplate } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const startEdit = (id: string, content: string) => {
    setExpandedId(id);
    setEditContent(content);
  };

  const save = (id: string) => {
    updateTemplate(id, { content: editContent });
    setExpandedId(null);
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <SectionTitle icon={<FileText size={16} />} title="Message Templates" />
      {data.templates.map((tpl) => (
        <div key={tpl.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedId === tpl.id ? 8 : 0 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{tpl.name}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {tpl.variables.join(' · ')}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => expandedId === tpl.id ? setExpandedId(null) : startEdit(tpl.id, tpl.content)}
            >
              {expandedId === tpl.id ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {expandedId === tpl.id && (
            <div>
              <textarea
                className="form-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
              />
              <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                <button className="btn btn-accent btn-sm" onClick={() => save(tpl.id)}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(tpl.content); }}>Copy</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AchievementsSection() {
  const { data } = useApp();
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <SectionTitle icon={<Target size={16} />} title="Achievements" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {data.achievements.map((ach) => (
          <div key={ach.id} className={`achievement-card ${ach.unlocked ? 'unlocked' : ''}`}>
            <div className="achievement-icon">{ach.icon}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: ach.unlocked ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
                {ach.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>{ach.description}</div>
              {ach.unlocked && ach.unlockedAt && (
                <div style={{ fontSize: 9, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {new Date(ach.unlockedAt).toLocaleDateString('en-IN')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { data, updateSettings, exportData, importData, clearData, loadDemoData, clearDemoData } = useApp();
  const { success, error: errorToast } = useToast();
  const importRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState({ ...data.settings });

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setSettings((s) => ({ ...s, [field]: val }));
  };

  const setTargetField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((s) => ({ ...s, dailyTargets: { ...s.dailyTargets, [field]: Number(e.target.value) } }));
  };

  const saveSettings = () => {
    updateSettings(settings);
    success('Settings saved');
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growth-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Backup exported');
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Contact', 'Status', 'Source', 'Service', 'Deal Value', 'Date Added', 'Date Contacted', 'Follow-up', 'Email', 'Notes'];
    const rows = data.leads.map((l) => [
      l.companyName, l.contactPerson, l.status, l.leadSource, l.serviceInterest,
      l.dealValue, l.dateAdded, l.dateContacted, l.nextFollowUp, l.email,
      l.notes.replace(/,/g, ';'),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growth-os-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success('CSV exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      const ok = importData(json);
      if (ok) success('Backup imported successfully');
      else errorToast('Import failed: invalid backup file');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (!window.confirm('This will delete ALL your data permanently. This cannot be undone. Are you absolutely sure?')) return;
    if (!window.confirm('Final confirmation: delete everything?')) return;
    clearData();
    success('All data cleared');
  };

  const hasDemoData = data.leads.some((l) => l.isDemo) || data.sessions.some((s) => s.isDemo);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <div className="page-subtitle">// configuration · data · privacy</div>
        </div>
        <button className="btn btn-accent" onClick={saveSettings}>Save Settings</button>
      </div>

      {/* Profile */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionTitle icon={<User size={16} />} title="Profile" />
        <FieldRow label="Your Name">
          <input className="form-input" value={settings.profileName} onChange={setField('profileName')} />
        </FieldRow>
        <FieldRow label="Sprint Start Date" description="When your 30-day sprint began">
          <input className="form-input" type="date" value={settings.sprintStartDate} onChange={setField('sprintStartDate')} />
        </FieldRow>
      </div>

      {/* Goals */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionTitle icon={<Target size={16} />} title="Daily Targets" />
        <FieldRow label="Leads Researched">
          <input className="form-input" type="number" min={0} value={settings.dailyTargets.leadsResearched} onChange={setTargetField('leadsResearched')} />
        </FieldRow>
        <FieldRow label="Messages Sent">
          <input className="form-input" type="number" min={0} value={settings.dailyTargets.messagesSent} onChange={setTargetField('messagesSent')} />
        </FieldRow>
        <FieldRow label="Follow-ups">
          <input className="form-input" type="number" min={0} value={settings.dailyTargets.followUps} onChange={setTargetField('followUps')} />
        </FieldRow>
        <FieldRow label="Calls">
          <input className="form-input" type="number" min={0} value={settings.dailyTargets.calls} onChange={setTargetField('calls')} />
        </FieldRow>
        <FieldRow label="Focus Hours">
          <input className="form-input" type="number" min={0} step={0.5} value={settings.dailyTargets.devHours} onChange={setTargetField('devHours')} />
        </FieldRow>
        <FieldRow label="Revenue Target (₹)" description="Your 30-day revenue goal">
          <input className="form-input" type="number" min={0} value={settings.revenueTarget} onChange={setField('revenueTarget')} />
        </FieldRow>
      </div>

      {/* Theme */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionTitle icon={<Palette size={16} />} title="Appearance" />
        <FieldRow label="Theme">
          <select className="form-select" value={settings.theme} onChange={setField('theme')}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </FieldRow>
      </div>

      {/* Templates */}
      <TemplatesSection />

      {/* Achievements */}
      <AchievementsSection />

      {/* Data Management */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionTitle icon={<Database size={16} />} title="Data Management" />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={14} /> Export Backup (JSON)
          </button>
          <button className="btn btn-outline" onClick={handleExportCSV}>
            <Download size={14} /> Export Leads (CSV)
          </button>
          <button className="btn btn-outline" onClick={() => importRef.current?.click()}>
            <Upload size={14} /> Import Backup
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} aria-label="Import backup file" />
        </div>

        <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--color-surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          <strong>About persistence:</strong> Your data is stored in this browser's localStorage. If you open the same URL on the same browser/device tomorrow, your data will still be there. To use on a different device, Export Backup → Import on the other device.
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {!hasDemoData ? (
            <button className="btn btn-outline btn-sm" onClick={loadDemoData}>
              <RefreshCw size={13} /> Load Demo Data
            </button>
          ) : (
            <button className="btn btn-outline btn-sm" onClick={() => { clearDemoData(); success('Demo data removed'); }}>
              <Trash2 size={13} /> Clear Demo Data
            </button>
          )}
          <button className="btn btn-danger btn-sm" onClick={handleClear}>
            <Trash2 size={13} /> Clear All Data
          </button>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="card" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <SectionTitle icon={<Shield size={16} style={{ color: '#ef4444' }} />} title="Privacy & Security Note" />
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
          <div>// This is a static GitHub Pages application.</div>
          <div>// The login is a client-side privacy gate only — NOT real security.</div>
          <div>// The password exists in the compiled JavaScript bundle.</div>
          <div>// Data is stored in your browser's localStorage (unencrypted).</div>
          <div>// Data is NOT synced across devices or browsers.</div>
          <div>// Clearing browser site data will remove your information.</div>
          <div>// Do NOT store sensitive or confidential business data here.</div>
          <div style={{ marginTop: 8, color: 'var(--color-accent)' }}>// Use Export/Import backup to move data between devices.</div>
        </div>
      </div>
    </div>
  );
}
