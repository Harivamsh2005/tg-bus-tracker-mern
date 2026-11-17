import React, { useState } from 'react';
import { Bus, Copy, Check, ArrowLeftRight, Tag } from 'lucide-react';
import { OPERATORS_DATA, PROMO_CODES } from '../data/tgData';

export default function OperatorsAndOffers() {
  const [copiedCode, setCopiedCode] = useState('');

  const copyPromo = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div>
      {/* One-Click Promo Offers Strip */}
      <div className="card">
        <div className="card-title">
          <span><Tag size={18} style={{ verticalAlign: 'middle' }} /> Active Telangana Transit Promo Codes</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {PROMO_CODES.map(p => (
            <div key={p.code} style={{ background: '#0f172a', border: '1px dashed #3b82f6', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#60a5fa', fontSize: '1rem' }}>{p.code}</strong>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>{p.desc}</div>
              </div>
              <button className="btn btn-secondary" onClick={() => copyPromo(p.code)}>
                {copiedCode === p.code ? <><Check size={14} color="#10b981" /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Operators & Bidirectional Routes */}
      <div className="card">
        <div className="card-title">
          <span><Bus size={18} style={{ verticalAlign: 'middle' }} /> Partner Bus Operators & Bidirectional (Vice-Versa) Routes</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {OPERATORS_DATA.map(op => (
            <div key={op.id} className="bus-item" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong>{op.name}</strong>
                <span className="badge badge-green">{op.rating}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 10 }}>
                Fleet: {op.fleetCount} • {op.categories.join(', ')}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {op.routes.map((r, idx) => (
                  <div key={idx} style={{ background: '#111827', padding: '8px 12px', borderRadius: 8, fontSize: '0.83rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{r.from} <ArrowLeftRight size={13} style={{ verticalAlign: 'middle', color: '#60a5fa' }} /> {r.to}</span>
                    <strong style={{ color: '#34d399' }}>₹{r.fareFrom}+</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}