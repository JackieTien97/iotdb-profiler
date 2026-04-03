import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { testConnection, type ConnectionParams } from '../api/queryApi';

interface Props {
  connection: ConnectionParams;
  onChange: (conn: ConnectionParams) => void;
}

export default function ConnectionForm({ connection, onChange }: Props) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const update = (field: keyof ConnectionParams, value: string | number) =>
    onChange({ ...connection, [field]: value });

  const handleTest = async () => {
    setStatus('testing');
    try {
      const res = await testConnection(connection);
      setStatus(res.success ? 'success' : 'error');
      if (!res.success) setErrorMsg(res.message);
    } catch (e: unknown) {
      setStatus('error');
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-600" style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', fontWeight: 600 }}>
          {t('connection.title')}
        </span>
        {status === 'success' && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ color: 'var(--success)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{t('connection.success')}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        <div className="col-span-3">
          <Label>{t('connection.host')}</Label>
          <Input value={connection.host} onChange={(v) => update('host', v)} />
        </div>
        <div className="col-span-2">
          <Label>{t('connection.port')}</Label>
          <Input type="number" value={String(connection.port)} onChange={(v) => update('port', parseInt(v) || 6667)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label>{t('connection.username')}</Label>
          <Input value={connection.username} onChange={(v) => update('username', v)} />
        </div>
        <div>
          <Label>{t('connection.password')}</Label>
          <Input type="password" value={connection.password} onChange={(v) => update('password', v)} />
        </div>
      </div>

      <div>
        <Label>{t('connection.database')}</Label>
        <Input value={connection.database} onChange={(v) => update('database', v)} placeholder="e.g. cmp_db" />
      </div>

      <button
        className="w-full py-2 text-[12px] font-medium rounded-lg cursor-pointer transition-all duration-150 disabled:opacity-40"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
          background: 'var(--bg-raised)',
        }}
        onClick={handleTest}
        disabled={status === 'testing'}
      >
        {status === 'testing' ? t('connection.testing') : t('connection.test')}
      </button>

      {status === 'error' && (
        <div className="text-[11px] px-3 py-2 rounded-lg" style={{ background: 'var(--error-bg)', color: 'var(--error)', fontFamily: 'var(--font-mono)' }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block mb-1" style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
      {children}
    </label>
  );
}

function Input({ value, onChange, type, placeholder }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-[7px] text-[12px] rounded-lg outline-none transition-all duration-150"
      style={{
        fontFamily: 'var(--font-mono)',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-soft)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
    />
  );
}
