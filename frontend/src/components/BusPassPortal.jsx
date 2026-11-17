import React, { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { CreditCard, Download, CheckCircle2 } from 'lucide-react';
import { TG_STATIONS } from '../data/tgData';

const API = 'http://localhost:5000/api';

export default function BusPassPortal({ onFirewallAlert }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    applicantName: '',
    fatherOrGuardianName: '',
    dob: '',
    aadhaarNumber: '',
    passType: 'STUDENT_GENERAL',
    fromStation: 'Hanamkonda',
    toStation: 'Warangal',
    durationMonths: 1
  });
  const [docFile, setDocFile] = useState(null);
  const [issuedPass, setIssuedPass] = useState(null);

  const rates = { STUDENT_GENERAL: 150, GENERAL_COMMUTER: 850 };
  const totalFee = (rates[form.passType] || 150) * Number(form.durationMonths);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      onFirewallAlert('FIREWALL BLOCKED: Only PDF, JPG, and PNG documents are permitted!');
      e.target.value = '';
      return;
    }
    setDocFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docFile) return alert('Upload Aadhaar or College Bonafide ID (PDF/JPG/PNG)');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('idProof', docFile);

    try {
      const res = await axios.post(`${API}/bookings/bus-pass`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIssuedPass(res.data);
      setStep(3);
    } catch (err) {
      if (err.response?.data?.firewallAlert) {
        onFirewallAlert(err.response.data.message);
      } else {
        // Fallback local issuance if backend offline
        const validUntil = new Date();
        validUntil.setMonth(validUntil.getMonth() + Number(form.durationMonths));
        setIssuedPass({
          ...form,
          passId: `TGPASS-${Math.floor(100000 + Math.random() * 900000)}`,
          feePaid: totalFee,
          validUntil
        });
        setStep(3);
      }
    }
  };

  // ID-Card Sized PDF Download (CR80 Smart Card Ratio: 86mm x 54mm)
  const downloadIdCardPdf = () => {
    if (!issuedPass) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [86, 54] });

    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 86, 54, 'F');
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 86, 11, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('TGSRTC DIGITAL SMART BUS PASS', 4, 7);

    doc.setFontSize(6.5);
    doc.text(`PASS ID: ${issuedPass.passId}`, 4, 17);
    doc.text(`NAME: ${issuedPass.applicantName.toUpperCase()}`, 4, 22);
    doc.text(`CATEGORY: ${issuedPass.passType}`, 4, 27);
    doc.text(`ROUTE: ${issuedPass.fromStation} - ${issuedPass.toStation}`, 4, 32);
    doc.text(`VALID UPTO: ${new Date(issuedPass.validUntil).toLocaleDateString()}`, 4, 37);
    doc.text(`FEE PAID: INR ${issuedPass.feePaid}`, 4, 42);

    // QR Code Block
    doc.setFillColor(255, 255, 255);
    doc.rect(62, 16, 20, 22, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(5.5);
    doc.text('SCAN QR', 66, 21);
    doc.text('|| ||| |||', 66, 28);
    doc.text('VERIFIED', 65, 35);

    doc.save(`${issuedPass.passId}-SmartCard.pdf`);
  };

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-title">
          <span><CreditCard size={18} style={{ verticalAlign: 'middle' }} /> Digital Bus Pass Portal (Step {step}/3)</span>
        </div>

        {step === 1 && (
          <div>
            <div className="form-row">
              <div className="form-group">
                <label>Pass Type</label>
                <select value={form.passType} onChange={e => setForm({ ...form, passType: e.target.value })}>
                  <option value="STUDENT_GENERAL">Student Bus Pass (₹150/month)</option>
                  <option value="GENERAL_COMMUTER">General Commuter Pass (₹850/month)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Duration</label>
                <select value={form.durationMonths} onChange={e => setForm({ ...form, durationMonths: Number(e.target.value) })}>
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>From Hub</label>
                <select value={form.fromStation} onChange={e => setForm({ ...form, fromStation: e.target.value })}>
                  {TG_STATIONS.map(s => <option key={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>To Hub</label>
                <select value={form.toStation} onChange={e => setForm({ ...form, toStation: e.target.value })}>
                  {TG_STATIONS.map(s => <option key={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ margin: '14px 0', color: '#34d399', fontWeight: 700 }}>Estimated Pass Fee: ₹{totalFee}</div>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Next: Applicant & Document Upload ➔</button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Applicant Full Name *</label>
                <input required value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Guardian Name *</label>
                <input required value={form.fatherOrGuardianName} onChange={e => setForm({ ...form, fatherOrGuardianName: e.target.value })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth *</label>
                <input type="date" required value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
              </div>
              <div className="form-group">
                <label>12-Digit ID Number *</label>
                <input required maxLength={12} value={form.aadhaarNumber} onChange={e => setForm({ ...form, aadhaarNumber: e.target.value })} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Upload ID / Bonafide Proof (PDF, JPG, PNG only) *</label>
              <input type="file" required accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button type="submit" className="btn btn-emerald" style={{ flex: 1 }}>Pay ₹{totalFee} & Issue Digital Pass</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <CheckCircle2 size={44} color="#10b981" style={{ marginBottom: 10 }} />
            <h3>Digital Bus Pass Approved!</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '8px 0 16px' }}>
              Your smart card pass is ready for instant PDF download.
            </p>
            <button className="btn btn-secondary" onClick={() => { setStep(1); setIssuedPass(null); }}>Apply Another Pass</button>
          </div>
        )}
      </div>

      {/* Live ID-Card Preview */}
      <div className="card">
        <div className="card-title">
          <span>ID-Card Sized Smart Pass Preview</span>
          {issuedPass && (
            <button className="btn btn-emerald" onClick={downloadIdCardPdf}>
              <Download size={15} /> Download ID-Card PDF
            </button>
          )}
        </div>

        {issuedPass ? (
          <div className="pass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8, marginBottom: 12 }}>
              <strong>TGSRTC SMART BUS PASS</strong>
              <span className="badge badge-green">{issuedPass.passId}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12, alignItems: 'center' }}>
              <div style={{ fontSize: '0.86rem', lineHeight: 1.7 }}>
                <div><strong>Name:</strong> {issuedPass.applicantName}</div>
                <div><strong>Category:</strong> {issuedPass.passType}</div>
                <div><strong>Route:</strong> {issuedPass.fromStation} ⇄ {issuedPass.toStation}</div>
                <div><strong>Valid Until:</strong> {new Date(issuedPass.validUntil).toLocaleDateString()}</div>
              </div>
              <div className="qr-box">
                <div style={{ fontSize: '0.68rem' }}>QR VERIFY</div>
                <div style={{ fontSize: '1.1rem', padding: '10px 0' }}>|||| || ||||</div>
                <div style={{ fontSize: '0.7rem' }}>₹{issuedPass.feePaid} PAID</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 45, color: '#64748b' }}>
            Complete the 2-step pass application to preview and download your ID-Card PDF.
          </div>
        )}
      </div>
    </div>
  );
}