import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import edwincover from './assets/edwin_inc_cover.jpeg';



const DOC_TYPES = [
  {
    id: 'book', label: 'Book', icon: '📖',
    desc: 'Full book formatting with chapters, headers & print layout',
    fields: [
      { key: 'title', label: 'Book Title', placeholder: 'e.g. The Art of Science' },
      { key: 'author', label: 'Author Name', placeholder: 'e.g. Dr. Ramesh Kumar' },
      { key: 'volume', label: 'Volume / Edition', placeholder: 'e.g. Vol. 2, 3rd Edition' },
      { key: 'header', label: 'Header Text', placeholder: 'e.g. Chapter name or Publisher name' },
      { key: 'footer', label: 'Footer Text', placeholder: 'e.g. © 2024 Publisher Name' },
      { key: 'website_url', label: 'Publisher Website', placeholder: 'https://yourpublisher.com' },
      { key: 'isbn', label: 'ISBN', placeholder: 'e.g. 978-3-16-148410-0' },
    ],
  },
  {
    id: 'thesis', label: 'Thesis', icon: '🎓',
    desc: 'Academic thesis with university formatting standards',
    fields: [
      { key: 'title', label: 'Thesis Title', placeholder: 'e.g. Impact of AI on Education' },
      { key: 'author', label: 'Student Name', placeholder: 'e.g. Priya Sharma' },
      { key: 'university', label: 'University Name', placeholder: 'e.g. IIT Delhi' },
      { key: 'department', label: 'Department', placeholder: 'e.g. Computer Science' },
      { key: 'supervisor', label: 'Supervisor Name', placeholder: 'e.g. Prof. A.K. Singh' },
      { key: 'year', label: 'Submission Year', placeholder: 'e.g. 2024' },
      { key: 'header', label: 'Header Text', placeholder: 'e.g. University name' },
      { key: 'footer', label: 'Footer Text', placeholder: 'e.g. Confidential' },
    ],
  },
  {
    id: 'research', label: 'Research Paper', icon: '🔬',
    desc: 'Journal-ready research paper with citations & abstract layout',
    fields: [
      { key: 'title', label: 'Paper Title', placeholder: 'e.g. Neural Networks in Climate' },
      { key: 'author', label: 'Author(s)', placeholder: 'e.g. Kumar A., Singh B.' },
      { key: 'journal', label: 'Journal / Conference', placeholder: 'e.g. IEEE Transactions on AI' },
      { key: 'volume', label: 'Volume & Issue', placeholder: 'e.g. Vol. 12, Issue 3' },
      { key: 'doi', label: 'DOI / URL', placeholder: 'e.g. 10.1109/tai.2024.001' },
      { key: 'keywords', label: 'Keywords', placeholder: 'e.g. AI, Machine Learning' },
      { key: 'header', label: 'Header Text', placeholder: 'e.g. Journal name' },
      { key: 'footer', label: 'Footer Text', placeholder: 'e.g. Copyright notice' },
    ],
  },
  {
    id: 'letter', label: 'Letter / Notice', icon: '✉️',
    desc: 'Formal letters, office memos and official notices',
    fields: [
      { key: 'org_name', label: 'Organization Name', placeholder: 'e.g. Ministry of Education' },
      { key: 'ref_no', label: 'Reference Number', placeholder: 'e.g. MOE/2024/001' },
      { key: 'date', label: 'Date', placeholder: 'e.g. 28 April 2024' },
      { key: 'subject', label: 'Subject', placeholder: 'e.g. Annual Report Submission' },
      { key: 'header', label: 'Header Text', placeholder: 'e.g. Government of India' },
      { key: 'footer', label: 'Footer Text', placeholder: 'e.g. Address, Phone, Website' },
      { key: 'website_url', label: 'Website URL', placeholder: 'https://yourorg.gov.in' },
    ],
  },
];

const ENGLISH_FONTS = [
  { value: 'Calibri', label: 'Calibri — Modern & Clean' },
  { value: 'Times New Roman', label: 'Times New Roman — Classic' },
  { value: 'Arial', label: 'Arial — Simple & Clear' },
  { value: 'Georgia', label: 'Georgia — Editorial' },
  { value: 'Garamond', label: 'Garamond — Publishing' },
  { value: 'Cambria', label: 'Cambria — Academic' },
  { value: 'Bookman Old Style', label: 'Bookman Old Style — Traditional' },
];

const HINDI_FONTS = [
  { value: 'Krutidev010', label: 'KrutiDev 010 — Classic Hindi' },
  { value: 'Krutidev011', label: 'KrutiDev 011 — Alternate' },
  { value: 'Mangal', label: 'Mangal — Standard Unicode' },
  { value: 'Kokila', label: 'Kokila — Elegant' },
  { value: 'Utsaah', label: 'Utsaah — Modern' },
  { value: 'Aparajita', label: 'Aparajita — Traditional' },
  { value: 'Nirmala UI', label: 'Nirmala UI — Clean UI' },
];

const FONT_SIZES = [10, 11, 12, 14, 16, 18, 20, 22, 24];
const LINE_SPACINGS = [
  { label: '1.0 — Single', value: 1.0 },
  { label: '1.15 — Normal', value: 1.15 },
  { label: '1.5 — Wide', value: 1.5 },
  { label: '2.0 — Double', value: 2.0 },
];

const PAGE_SIZES = [
  { value: 'A4', label: 'A4', desc: '210×297mm' },
  { value: 'A5', label: 'A5', desc: '148×210mm' },
  { value: 'A3', label: 'A3', desc: '297×420mm' },
  { value: 'Letter', label: 'Letter', desc: '216×279mm' },
  { value: 'Legal', label: 'Legal', desc: '216×356mm' },
];

const PAGE_NUM_POSITIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [downloadUrl, setDownloadUrl] = useState(null);

  // Auth & page state
  const [modal, setModal] = useState(null); // 'login' | 'signup' | 'licence' | null
  const [user, setUser] = useState(null); // { name, email }
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const openModal = (m) => { setModal(m); setAuthError(''); setAuthForm({ name: '', email: '', password: '' }); };
  const closeModal = () => setModal(null);

  const handleLogin = () => {
    if (!authForm.email || !authForm.password) { setAuthError('Email aur password daalein.'); return; }
    setUser({ name: authForm.email.split('@')[0], email: authForm.email });
    closeModal();
  };

  const handleSignup = () => {
    if (!authForm.name || !authForm.email || !authForm.password) { setAuthError('Sabhi fields bharein.'); return; }
    setUser({ name: authForm.name, email: authForm.email });
    closeModal();
  };

  const handleLogout = () => { setUser(null); };

  const currentType = DOC_TYPES.find(t => t.id === selectedType);
  const handleTypeSelect = (id) => { setSelectedType(id); setFormData({}); setStep(2); };
  const handleFieldChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const handleToggle = (key) => setFormData(prev => ({ ...prev, [key]: !prev[key] }));

  const onDrop = useCallback((files) => setFile(files[0]), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('uploading');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('docType', selectedType);
    fd.append('options', JSON.stringify(formData));
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/format`, fd, { responseType: 'blob' });
      setDownloadUrl(URL.createObjectURL(new Blob([res.data])));
      setStatus('done');
    } catch { setStatus('error'); }
  };

  const handleReset = () => {
    setStep(1); setSelectedType(null); setFormData({});
    setFile(null); setStatus('idle'); setDownloadUrl(null);
  };

  const fontList = formData.font_script === 'hindi' ? HINDI_FONTS
    : formData.font_script === 'english' ? ENGLISH_FONTS : [];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: '100vh', width: '100%', background: 'var(--bg-base)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

        :root {
          --bg-base: #EEF2F7;
          --bg-subtle: #F5F7FA;
          --glass-bg: rgba(255,255,255,0.72);
          --glass-border: rgba(255,255,255,0.9);
          --glass-shadow: 0 8px 32px rgba(99,120,180,0.12);
          --glass-heavy: rgba(255,255,255,0.88);
          --accent: #4361EE;
          --accent-light: #EEF1FF;
          --accent-hover: #3451D4;
          --teal: #0D9488;
          --teal-light: #F0FDFA;
          --purple: #7C3AED;
          --purple-light: #F5F0FF;
          --green: #059669;
          --green-light: #ECFDF5;
          --orange: #D97706;
          --orange-light: #FFFBEB;
          --text-primary: #0F172A;
          --text-secondary: #475569;
          --text-muted: #94A3B8;
          --border: rgba(148,163,184,0.25);
          --border-strong: rgba(148,163,184,0.4);
          --step-done: #22C55E;
          --radius-sm: 8px;
          --radius-md: 14px;
          --radius-lg: 20px;
          --radius-xl: 28px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; background: var(--bg-base); }

        /* ── Animated bg blobs ── */
        .bg-blob {
          position: fixed; border-radius: 50%; filter: blur(80px);
          pointer-events: none; z-index: 0; opacity: 0.35;
        }
        .bg-blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #C7D7FF 0%, transparent 70%);
          top: -100px; right: -100px;
          animation: blobFloat1 14s ease-in-out infinite;
        }
        .bg-blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #D1FAE5 0%, transparent 70%);
          bottom: 0; left: -80px;
          animation: blobFloat2 18s ease-in-out infinite;
        }
        @keyframes blobFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,20px) scale(1.05)} }
        @keyframes blobFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-30px) scale(1.08)} }

        /* ── Nav ── */
        .topnav {
          width: 100%; height: 58px;
          background: var(--glass-heavy);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          padding: 0 20px;
          display: flex; align-items: center; gap: 10px;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 1px 20px rgba(67,97,238,0.07);
        }
        .nav-logo {
          width: 30px; height: 30px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--accent), #6381F5);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(67,97,238,0.3);
        }
        .nav-brand {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; color: var(--text-primary); font-weight: 600;
        }
        .nav-badge {
          margin-left: 4px;
          background: linear-gradient(135deg, var(--accent-light), #E0E7FF);
          color: var(--accent); font-size: .62rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          padding: 2px 8px; border-radius: 20px;
          border: 1px solid rgba(67,97,238,0.2);
        }

        /* ── Main ── */
        .main-content {
          position: relative; z-index: 1;
          width: 100%; padding: 28px 16px 72px;
          max-width: 1100px; margin: 0 auto;
        }

        /* ── Page header ── */
        .page-header { margin-bottom: 32px; animation: fadeUp .5s ease both; }
        .page-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem; color: var(--text-primary);
          letter-spacing: -.02em; line-height: 1.2; margin-bottom: 6px;
        }
        .page-header h1 em { font-style: italic; color: var(--accent); }
        .page-header p { font-size: .875rem; color: var(--text-secondary); font-weight: 400; }

        /* ── Steps bar — FIXED: centered, no left-shift ── */
        .steps-bar {
          display: flex;
          align-items: center;
          justify-content: center;   /* centers on desktop */
          margin: 0 0 32px;
          background: var(--glass-bg);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: 14px 20px;
          box-shadow: var(--glass-shadow);
          gap: 0;
          animation: fadeUp .5s .1s ease both;
        }

        /* mobile: allow scroll but keep items centered when they fit */
        @media (max-width: 400px) {
          .steps-bar {
            justify-content: flex-start;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .steps-bar::-webkit-scrollbar { display: none; }
        }

        .step-node {
          display: flex; align-items: center; gap: 8px;
          font-size: .8rem; font-weight: 500;
          color: var(--text-muted); white-space: nowrap;
          transition: color .3s;
        }
        .step-node.active { color: var(--accent); }
        .step-node.done  { color: var(--step-done); }

        .step-circle {
          width: 26px; height: 26px; border-radius: 50%;
          border: 2px solid var(--border-strong);
          display: flex; align-items: center; justify-content: center;
          font-size: .68rem; font-weight: 700;
          background: var(--glass-bg); flex-shrink: 0;
          transition: all .3s cubic-bezier(.34,1.56,.64,1);
        }
        .step-node.active .step-circle {
          border-color: var(--accent);
          background: var(--accent); color: #fff;
          box-shadow: 0 0 0 4px rgba(67,97,238,0.15);
          transform: scale(1.1);
        }
        .step-node.done .step-circle {
          border-color: var(--step-done);
          background: var(--step-done); color: #fff;
        }

        .step-label { font-size: .78rem; }

        .step-connector {
          width: 40px; height: 2px; flex-shrink: 0;
          background: var(--border-strong); margin: 0 10px; border-radius: 2px;
          transition: background .4s;
          position: relative; overflow: hidden;
        }
        .step-connector.done-line { background: var(--step-done); }
        .step-connector.done-line::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
          animation: shimmer 1.5s ease infinite;
        }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }

        /* ── Cards ── */
        .content-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: 22px 18px;
          box-shadow: var(--glass-shadow);
          animation: fadeUp .4s ease both;
        }
        .content-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
        .card-icon-wrap {
          width: 38px; height: 38px; flex-shrink: 0;
          background: var(--accent-light);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
          border: 1px solid rgba(67,97,238,0.15);
        }
        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem; color: var(--text-primary); letter-spacing: -.02em;
        }
        .card-subtitle {
          font-size: .82rem; color: var(--text-secondary);
          margin-bottom: 22px; margin-left: 50px;
        }

        /* ── Section label ── */
        .section-label {
          font-size: .7rem; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px;
        }

        /* ── Type grid ── */
        .type-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }

        .type-card {
          background: var(--glass-bg);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border: 1.5px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 16px; cursor: pointer;
          transition: all .22s cubic-bezier(.34,1.56,.64,1);
          position: relative; display: flex; flex-direction: column; gap: 7px;
          box-shadow: 0 2px 12px rgba(99,120,180,0.07);
          animation: fadeUp .4s ease both;
        }
        .type-card:nth-child(1) { animation-delay: .05s; }
        .type-card:nth-child(2) { animation-delay: .1s; }
        .type-card:nth-child(3) { animation-delay: .15s; }
        .type-card:nth-child(4) { animation-delay: .2s; }

        .type-card:hover {
          border-color: var(--accent);
          box-shadow: 0 8px 30px rgba(67,97,238,0.15);
          transform: translateY(-3px);
          background: rgba(255,255,255,0.9);
        }
        .type-card:active { transform: scale(.98); }
        .type-card-top { display: flex; align-items: center; gap: 10px; }
        .type-icon-wrap {
          width: 40px; height: 40px; flex-shrink: 0;
          background: var(--accent-light);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
          transition: transform .2s;
        }
        .type-card:hover .type-icon-wrap { transform: scale(1.1) rotate(-3deg); }
        .type-label { font-size: .92rem; font-weight: 600; color: var(--text-primary); }
        .type-desc  { font-size: .78rem; color: var(--text-secondary); line-height: 1.5; }
        .type-arrow { display: none; }

        /* ── Format sections ── */
        .format-section {
          border-radius: var(--radius-md); padding: 16px; margin-bottom: 14px;
          border: 1.5px solid transparent;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .format-section.blue   { background: rgba(238,241,255,0.7); border-color: rgba(99,129,245,0.2); }
        .format-section.purple { background: rgba(245,240,255,0.7); border-color: rgba(124,58,237,0.2); }
        .format-section.green  { background: rgba(236,253,245,0.7); border-color: rgba(5,150,105,0.2); }
        .format-section.orange { background: rgba(255,251,235,0.7); border-color: rgba(217,119,6,0.2); }
        .format-section.teal   { background: rgba(240,253,250,0.7); border-color: rgba(13,148,136,0.2); }

        .format-section-title {
          font-size: .72rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .format-section.blue   .format-section-title { color: var(--accent); }
        .format-section.purple .format-section-title { color: var(--purple); }
        .format-section.green  .format-section-title { color: var(--green); }
        .format-section.orange .format-section-title { color: var(--orange); }
        .format-section.teal   .format-section-title { color: var(--teal); }

        /* ── Form elements ── */
        .two-col   { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .three-col { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .fields-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 24px; }
        .field-group  { display: flex; flex-direction: column; gap: 6px; }

        .field-label {
          font-size: .77rem; font-weight: 600; color: var(--text-secondary);
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
        }
        .optional-tag { font-size: .7rem; font-weight: 400; color: var(--text-muted); }

        .field-input {
          background: rgba(255,255,255,0.75);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--radius-sm); padding: 11px 13px;
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif; font-size: 16px;
          outline: none; transition: all .2s; width: 100%;
          backdrop-filter: blur(4px);
        }
        .field-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(67,97,238,0.1);
          background: rgba(255,255,255,0.95);
        }
        .field-input::placeholder { color: #C4C9D4; }
        select.field-input { cursor: pointer; appearance: auto; }
        select.field-input:disabled { opacity: .45; cursor: not-allowed; background: rgba(243,244,246,0.7); }

        /* ── Sel cards ── */
        .page-size-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
        .align-grid     { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }

        .sel-card {
          border: 1.5px solid var(--border-strong); border-radius: var(--radius-sm);
          padding: 10px 8px; cursor: pointer; text-align: center;
          transition: all .18s cubic-bezier(.34,1.56,.64,1);
          background: rgba(255,255,255,0.65);
          -webkit-tap-highlight-color: transparent;
        }
        .sel-card:hover { transform: translateY(-2px); }
        .sel-card-label { font-size: .85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
        .sel-card-desc  { font-size: .65rem; color: var(--text-muted); line-height: 1.4; }

        .sel-card.purple.selected { border-color: var(--purple); background: rgba(124,58,237,0.07); }
        .sel-card.purple.selected .sel-card-label { color: var(--purple); }
        .sel-card.green.selected  { border-color: var(--green); background: rgba(5,150,105,0.07); }
        .sel-card.green.selected  .sel-card-label { color: var(--green); }
        .sel-card.orange.selected { border-color: var(--orange); background: rgba(217,119,6,0.07); }
        .sel-card.orange.selected .sel-card-label { color: var(--orange); }
        .sel-card.teal.selected   { border-color: var(--teal); background: rgba(13,148,136,0.07); }
        .sel-card.teal.selected   .sel-card-label { color: var(--teal); }

        /* ── Toggle ── */
        .toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px; gap: 12px;
        }
        .toggle-label { font-size: .88rem; font-weight: 500; color: var(--text-primary); }
        .toggle-sub   { font-size: .74rem; color: var(--text-muted); margin-top: 2px; }

        .toggle { position: relative; width: 44px; height: 24px; cursor: pointer; flex-shrink: 0; }
        .toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
        .toggle-slider {
          position: absolute; inset: 0;
          background: var(--border-strong); border-radius: 24px; transition: .25s;
        }
        .toggle-slider::before {
          content: ''; position: absolute;
          width: 18px; height: 18px; left: 3px; top: 3px;
          background: #fff; border-radius: 50%; transition: .25s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .toggle input:checked + .toggle-slider { background: var(--teal); }
        .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

        /* ── Font preview ── */
        .font-preview {
          margin-top: 10px; padding: 10px 12px;
          background: rgba(255,255,255,0.8); border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: .82rem; color: #374151;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }

        /* ── Divider / Buttons ── */
        .divider { height: 1px; background: var(--border); margin: 20px 0; }
        .btn-row  { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent), #6381F5);
          color: #fff; border: none;
          padding: 13px 26px;
          font-family: 'Outfit', sans-serif; font-size: .9rem; font-weight: 600;
          cursor: pointer; border-radius: var(--radius-sm);
          transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
          min-height: 44px; -webkit-tap-highlight-color: transparent;
          box-shadow: 0 4px 16px rgba(67,97,238,0.3);
        }
        .btn-primary:hover  { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(67,97,238,0.4); }
        .btn-primary:active { transform: scale(.97); }
        .btn-primary:disabled { opacity: .4; cursor: not-allowed; transform: none; box-shadow: none; }

        .btn-secondary {
          background: rgba(255,255,255,0.8); color: var(--text-secondary);
          border: 1.5px solid var(--border-strong);
          padding: 12px 22px;
          font-family: 'Outfit', sans-serif; font-size: .875rem; font-weight: 500;
          cursor: pointer; border-radius: var(--radius-sm);
          transition: all .2s; min-height: 44px;
          -webkit-tap-highlight-color: transparent;
          backdrop-filter: blur(4px);
        }
        .btn-secondary:hover  { border-color: var(--text-muted); background: rgba(255,255,255,0.95); transform: translateY(-1px); }
        .btn-secondary:active { transform: scale(.98); }

        /* ── Back button ── */
        .back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: .82rem; font-weight: 500; color: var(--text-secondary);
          background: rgba(255,255,255,0.65); border: 1px solid var(--border);
          border-radius: var(--radius-sm); padding: 6px 14px;
          cursor: pointer; margin-bottom: 18px;
          transition: all .18s; font-family: 'Outfit', sans-serif;
          -webkit-tap-highlight-color: transparent;
          backdrop-filter: blur(8px);
        }
        .back-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.9); }

        /* ── Dropzone ── */
        .dropzone {
          border: 2px dashed var(--border-strong);
          border-radius: var(--radius-md); padding: 40px 24px; text-align: center;
          cursor: pointer; transition: all .25s;
          background: rgba(249,250,251,0.7); margin-bottom: 20px;
          -webkit-tap-highlight-color: transparent;
        }
        .dropzone:hover, .dropzone.active {
          border-color: var(--accent);
          background: rgba(238,241,255,0.7);
          box-shadow: 0 0 0 4px rgba(67,97,238,0.08);
        }
        .dropzone-icon-wrap {
          width: 56px; height: 56px; background: var(--accent-light);
          border-radius: 15px; display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; margin: 0 auto 14px;
          border: 1px solid rgba(67,97,238,0.15);
        }
        .dropzone-text { font-size: .9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
        .dropzone-sub  { font-size: .8rem; color: var(--text-muted); }

        /* ── File selected ── */
        .file-selected {
          display: flex; align-items: center; gap: 10px;
          background: rgba(236,253,245,0.8); border: 1.5px solid rgba(187,247,208,0.9);
          border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 18px;
        }
        .file-name { font-size: .82rem; font-weight: 500; color: #065F46; flex: 1; word-break: break-all; }
        .file-size { font-size: .75rem; color: var(--text-secondary); white-space: nowrap; }
        .file-remove {
          background: none; border: none; color: var(--text-muted); cursor: pointer;
          font-size: 1rem; padding: 4px 8px; border-radius: 4px;
          transition: all .15s; min-width: 32px; min-height: 32px;
          display: flex; align-items: center; justify-content: center;
        }
        .file-remove:hover { background: rgba(254,226,226,0.9); color: #EF4444; }

        /* ── Config summary ── */
        .config-summary {
          background: rgba(249,250,251,0.8); border: 1px solid var(--border);
          border-radius: var(--radius-sm); padding: 14px 16px; margin-bottom: 18px;
          backdrop-filter: blur(4px);
        }
        .config-summary-title {
          font-size: .7rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;
        }
        .config-row { display: flex; gap: 8px; font-size: .82rem; margin-bottom: 5px; flex-wrap: wrap; }
        .config-key { color: var(--text-muted); min-width: 120px; text-transform: capitalize; flex-shrink: 0; }
        .config-val { color: var(--text-primary); font-weight: 500; }

        /* ── Status ── */
        .status-center {
          text-align: center; padding: 64px 20px;
          background: var(--glass-bg);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--glass-shadow);
          animation: fadeUp .4s ease both;
        }
        .status-icon-wrap {
          width: 72px; height: 72px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; margin: 0 auto 20px;
        }
        .status-icon-wrap.green { background: rgba(236,253,245,0.9); box-shadow: 0 0 0 8px rgba(5,150,105,0.1); }
        .status-icon-wrap.red   { background: rgba(254,242,242,0.9); box-shadow: 0 0 0 8px rgba(239,68,68,0.1); }

        .spinner-ring {
          width: 48px; height: 48px;
          border: 3px solid var(--border-strong);
          border-top-color: var(--accent);
          border-radius: 50%; animation: spin .8s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .status-title {
          font-family: 'Playfair Display', serif; font-size: 1.5rem;
          color: var(--text-primary); letter-spacing: -.02em; margin-bottom: 8px;
        }
        .status-sub { font-size: .875rem; color: var(--text-secondary); margin-bottom: 28px; }
        .status-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        .btn-download {
          background: linear-gradient(135deg, var(--green), #10B981);
          color: #fff; border: none; padding: 13px 26px;
          font-family: 'Outfit', sans-serif; font-size: .875rem; font-weight: 600;
          cursor: pointer; border-radius: var(--radius-sm); transition: all .2s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          min-height: 44px; box-shadow: 0 4px 16px rgba(5,150,105,0.3);
        }
        .btn-download:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(5,150,105,0.4); }
        .btn-download:active { transform: scale(.97); }

        /* ── Misc ── */
        .hint { margin-top: 8px; font-size: .75rem; font-weight: 500; }
        .app-footer {
          border-top: 1px solid var(--border); background: var(--glass-heavy);
          backdrop-filter: blur(16px); padding: 14px 20px;
          text-align: center; font-size: .75rem; color: var(--text-muted);
        }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Nav buttons ── */
        .nav-spacer { flex: 1; }
        .nav-actions { display: flex; align-items: center; gap: 8px; }
        .nav-btn {
          font-family: 'Outfit', sans-serif;
          font-size: .78rem; font-weight: 600;
          padding: 7px 14px; border-radius: var(--radius-sm);
          cursor: pointer; border: 1.5px solid transparent;
          transition: all .18s; white-space: nowrap; min-height: 34px;
        }
        .nav-btn.ghost {
          background: transparent; border-color: var(--border-strong);
          color: var(--text-secondary);
        }
        .nav-btn.ghost:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
        .nav-btn.solid {
          background: var(--accent); color: #fff; border-color: var(--accent);
          box-shadow: 0 3px 10px rgba(67,97,238,0.3);
        }
        .nav-btn.solid:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 5px 15px rgba(67,97,238,0.4); }
        .nav-btn.licence {
          background: transparent; border-color: var(--purple);
          color: var(--purple);
        }
        .nav-btn.licence:hover { background: var(--purple-light); }
        .nav-user {
          display: flex; align-items: center; gap: 8px;
          font-size: .8rem; color: var(--text-secondary); font-weight: 500;
        }
        .nav-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--purple));
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: .72rem; font-weight: 700; flex-shrink: 0;
        }
        .nav-btn.logout {
          background: transparent; border-color: rgba(239,68,68,0.3);
          color: #EF4444; font-size: .75rem; padding: 5px 10px;
        }
        .nav-btn.logout:hover { background: rgba(254,242,242,0.9); border-color: #EF4444; }

        /* ── Modal overlay ── */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(15,23,42,0.5);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn .2s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .modal-card {
          background: var(--glass-heavy);
          border: 1.5px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: 28px 24px;
          width: 100%; max-width: 400px;
          box-shadow: 0 24px 80px rgba(15,23,42,0.2);
          animation: slideUp .25s cubic-bezier(.34,1.56,.64,1);
          position: relative;
        }
        .modal-card.wide { max-width: 560px; max-height: 85vh; overflow-y: auto; }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }

        .modal-close {
          position: absolute; top: 16px; right: 16px;
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--border); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: .85rem; color: var(--text-secondary);
          transition: all .15s;
        }
        .modal-close:hover { background: rgba(239,68,68,0.15); color: #EF4444; }

        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem; color: var(--text-primary);
          margin-bottom: 4px; letter-spacing: -.02em;
        }
        .modal-sub { font-size: .8rem; color: var(--text-secondary); margin-bottom: 22px; }

        .modal-field { margin-bottom: 14px; }
        .modal-label { font-size: .75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block; letter-spacing: .04em; text-transform: uppercase; }
        .modal-input {
          width: 100%; padding: 10px 14px;
          border: 1.5px solid var(--border-strong);
          border-radius: var(--radius-sm);
          font-family: 'Outfit', sans-serif; font-size: .875rem;
          background: rgba(255,255,255,0.8);
          color: var(--text-primary); outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .modal-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(67,97,238,0.1); }
        .modal-error { font-size: .78rem; color: #EF4444; margin-bottom: 10px; font-weight: 500; }
        .modal-submit {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, var(--accent), #6381F5);
          color: #fff; border: none; border-radius: var(--radius-sm);
          font-family: 'Outfit', sans-serif; font-size: .9rem; font-weight: 600;
          cursor: pointer; transition: all .2s; margin-top: 4px;
          box-shadow: 0 4px 16px rgba(67,97,238,0.3);
        }
        .modal-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(67,97,238,0.4); }
        .modal-switch { margin-top: 14px; font-size: .8rem; color: var(--text-secondary); text-align: center; }
        .modal-switch button { background: none; border: none; color: var(--accent); font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; }

        /* Licence page styles */
        .licence-hero {
          text-align: center; margin-bottom: 22px;
          padding-bottom: 18px; border-bottom: 1px solid var(--border);
        }
        .licence-img {
          width: 100%; max-height: 160px; object-fit: cover;
          border-radius: var(--radius-md); margin-bottom: 14px;
          background: var(--accent-light);
          border: 1.5px dashed var(--border-strong);
          min-height: 100px; display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); font-size: .8rem;
        }
        .licence-section-title {
          font-size: .7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: .1em; color: var(--accent); margin: 16px 0 8px;
        }
        .licence-text { font-size: .83rem; color: var(--text-secondary); line-height: 1.7; }
        .licence-badge {
          display: inline-block; background: var(--purple-light);
          color: var(--purple); font-size: .7rem; font-weight: 700;
          padding: 3px 10px; border-radius: 20px; margin-bottom: 8px;
          border: 1px solid rgba(124,58,237,0.2);
        }

        /* ── Desktop breakpoints ── */
        @media (max-width: 539px) {
          .type-grid { grid-template-columns: 1fr; }
          .topnav { padding: 0 12px; }
          .nav-brand { font-size: 0.9rem; }
          .nav-badge { display: none; }
          .nav-btn { padding: 6px 10px; font-size: 0.7rem; }
          .main-content { padding: 18px 12px 60px; }
          .page-header h1 { font-size: 1.5rem; }
          .content-card { padding: 16px 12px; }
          .card-title { font-size: 1.1rem; }
          .card-subtitle { margin-left: 0; text-align: center; }
          .content-card-header { justify-content: center; }
          .steps-bar { padding: 10px; gap: 4px; }
          .step-label { display: none; }
          .step-connector { width: 20px; margin: 0 4px; }
        }
        @media (min-width: 540px) {
          .type-grid    { grid-template-columns: repeat(2,1fr); gap: 14px; }
          .two-col      { grid-template-columns: repeat(2,1fr); }
          .fields-grid  { grid-template-columns: repeat(2,1fr); }
        }
        @media (min-width: 900px) {
          .main-content  { padding: 52px 48px 80px; }
          .topnav        { padding: 0 48px; height: 62px; }
          .page-header h1{ font-size: 2.4rem; }
          .type-grid     { grid-template-columns: repeat(4,1fr); gap: 16px; }
          .type-card     { padding: 22px; }
          .type-icon-wrap{ width: 44px; height: 44px; font-size: 1.3rem; }
          .type-label    { font-size: 1rem; }
          .type-arrow    { display: block; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); color: var(--border-strong); font-size: 1.1rem; }
          .type-card:hover .type-arrow { color: var(--accent); right: 16px; transition: right .15s; }
          .content-card  { padding: 36px; }
          .card-subtitle { margin-left: 52px; }
          .format-section{ padding: 22px 26px; }
          .fields-grid   { grid-template-columns: repeat(3,1fr); gap: 18px; }
          .page-size-grid{ grid-template-columns: repeat(5,1fr); }
          .align-grid    { grid-template-columns: repeat(4,1fr); }
        }
      `}</style>

      {/* background blobs */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />

      <nav className="topnav">
        <div className="nav-logo">


          <img
            src="https://media.licdn.com/dms/image/v2/D4D0BAQH-hS_fhKHclA/company-logo_200_200/B4DZkZxF_uH0AI-/0/1757073924667?e=2147483647&v=beta&t=veDHvjL43Wbi5l5M7RLDv7SIqkUhk_RaDxMtnO6nYVo"
            alt="Logo"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />




        </div>



        <span className="nav-brand">Format Studio</span>
        <span className="nav-badge">Pro</span>
        <div className="nav-spacer" />
        <div className="nav-actions">
          {user ? (
            <>
              <div className="nav-user">
                <div className="nav-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span style={{ display: 'none' }} className="nav-username">{user.name}</span>
              </div>
              <button className="nav-btn licence" onClick={() => openModal('licence')}>📜 Licence</button>
              <button className="nav-btn logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="nav-btn ghost" onClick={() => openModal('login')}>Login</button>
              <button className="nav-btn solid" onClick={() => openModal('signup')}>Sign Up</button>
              <button className="nav-btn licence" onClick={() => openModal('licence')}>📜 Licence</button>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header">
          <h1>Publishing <em>Format</em> Studio</h1>
          <p>Professional document formatting for print &amp; digital publishing</p>
        </div>

        {/* ── Steps bar — FIXED ── */}
        <div className="steps-bar">
          {[
            { n: 1, label: 'Select Type' },
            { n: 2, label: 'Configure' },
            { n: 3, label: 'Format & Export' },
          ].map(({ n, label }, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div className={`step-connector ${step > n - 1 ? 'done-line' : ''}`} />
              )}
              <div className={`step-node ${step === n ? 'active' : step > n ? 'done' : ''}`}>
                <div className="step-circle">{step > n ? '✓' : n}</div>
                <span className="step-label">{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <p className="section-label">Choose document type</p>
            <div className="type-grid">
              {DOC_TYPES.map(t => (
                <div key={t.id} className="type-card" onClick={() => handleTypeSelect(t.id)}>
                  <div className="type-card-top">
                    <div className="type-icon-wrap">{t.icon}</div>
                    <div className="type-label">{t.label}</div>
                  </div>
                  <div className="type-desc">{t.desc}</div>
                  <span className="type-arrow">→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && currentType && (
          <div>
            <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
            <div className="content-card">
              <div className="content-card-header">
                <div className="card-icon-wrap">{currentType.icon}</div>
                <div className="card-title">{currentType.label} Options</div>
              </div>
              <div className="card-subtitle">Fill in what you need — all fields are optional</div>

              {/* Font */}
              <div className="format-section blue">
                <div className="format-section-title">🖋 Font & Typography</div>
                <div className="two-col">
                  <div className="field-group">
                    <label className="field-label">Language <span className="optional-tag">Optional</span></label>
                    <select className="field-input" value={formData.font_script || ''} onChange={e => { handleFieldChange('font_script', e.target.value); handleFieldChange('font_style', ''); }}>
                      <option value="">Select language...</option>
                      <option value="english">English</option>
                      <option value="hindi">Hindi — KrutiDev / Unicode (हिन्दी)</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Font Family <span className="optional-tag">Optional</span></label>
                    <select className="field-input" value={formData.font_style || ''} onChange={e => handleFieldChange('font_style', e.target.value)} disabled={!formData.font_script}>
                      <option value="">{formData.font_script ? 'Select font...' : 'Select language first'}</option>
                      {fontList.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="two-col" style={{ marginTop: '14px' }}>
                  <div className="field-group">
                    <label className="field-label">Base Font Size <span className="optional-tag">Default: 12</span></label>
                    <select className="field-input" value={formData.font_size || '12'} onChange={e => handleFieldChange('font_size', e.target.value)}>
                      {FONT_SIZES.map(sz => <option key={sz} value={sz}>{sz} pt</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Line Spacing <span className="optional-tag">Default: 1.15</span></label>
                    <select className="field-input" value={formData.line_spacing || '1.15'} onChange={e => handleFieldChange('line_spacing', e.target.value)}>
                      {LINE_SPACINGS.map(ls => <option key={ls.value} value={ls.value}>{ls.label}</option>)}
                    </select>
                  </div>
                </div>

                {formData.font_style && (
                  <div className="font-preview">
                    <span>Preview:</span>
                    <span style={{ fontFamily: formData.font_style, fontSize: `${formData.font_size || 12}px`, color: '#111827' }}>
                      {formData.font_script === 'hindi' ? 'यह एक नमूना पाठ है। The quick brown fox.' : 'The quick brown fox jumps over the lazy dog.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Page Size */}
              <div className="format-section purple">
                <div className="format-section-title">📐 Page Size</div>
                <div className="page-size-grid">
                  {PAGE_SIZES.map(ps => (
                    <div key={ps.value} className={`sel-card purple ${formData.page_size === ps.value ? 'selected' : ''}`} onClick={() => handleFieldChange('page_size', ps.value)}>
                      <div className="sel-card-label">{ps.label}</div>
                      <div className="sel-card-desc">{ps.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="hint">
                  <span style={{ color: formData.page_size ? 'var(--purple)' : 'var(--text-muted)', fontWeight: 500 }}>
                    {formData.page_size ? `✓ Selected: ${formData.page_size}` : 'Default: A4 will be used if none selected'}
                  </span>
                </div>
              </div>

              {/* Page Numbers & Layout */}
              <div className="format-section teal">
                <div className="format-section-title">📄 Page Numbers & Layout</div>
                <div className="toggle-row">
                  <div>
                    <div className="toggle-label">Auto Page Numbers</div>
                    <div className="toggle-sub">Automatically add page X of Y in footer</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={!!formData.page_numbers} onChange={() => handleToggle('page_numbers')} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {formData.page_numbers && (
                  <div style={{ marginBottom: '16px' }}>
                    <div className="field-label" style={{ marginBottom: '8px' }}>Page Number Position</div>
                    <div className="three-col">
                      {PAGE_NUM_POSITIONS.map(p => (
                        <div key={p.value}
                          className={`sel-card teal ${formData.page_number_position === p.value ? 'selected' : ''}`}
                          onClick={() => handleFieldChange('page_number_position', p.value)}>
                          <div className="sel-card-label" style={{ color: formData.page_number_position === p.value ? 'var(--teal)' : 'var(--text-primary)' }}>{p.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <div className="field-label" style={{ marginBottom: '6px' }}>Start Page Number <span className="optional-tag">Default: 1</span></div>
                      <input className="field-input" type="number" min="1" max="999" placeholder="e.g. 1"
                        value={formData.start_page_number || ''} onChange={e => handleFieldChange('start_page_number', e.target.value)} style={{ width: '120px' }} />
                    </div>
                  </div>
                )}

                <div className="divider" style={{ margin: '14px 0' }} />
                <div className="two-col">
                  <div className="field-group">
                    <label className="field-label">Header Text <span className="optional-tag">Optional</span></label>
                    <input className="field-input" type="text" placeholder="e.g. Chapter title or Publisher" value={formData.header || ''} onChange={e => handleFieldChange('header', e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Footer Text <span className="optional-tag">Optional</span></label>
                    <input className="field-input" type="text" placeholder="e.g. © 2024 Publisher" value={formData.footer || ''} onChange={e => handleFieldChange('footer', e.target.value)} />
                  </div>
                </div>
              </div>



              {/* Document details */}
              <p className="section-label" style={{ marginTop: '8px' }}>Document details</p>
              <div className="fields-grid">
                {currentType.fields.filter(f => f.key !== 'header' && f.key !== 'footer').map(field => (
                  <div className="field-group" key={field.key}>
                    <label className="field-label">{field.label} <span className="optional-tag">Optional</span></label>
                    <input className="field-input" type="text" placeholder={field.placeholder}
                      value={formData[field.key] || ''} onChange={e => handleFieldChange(field.key, e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="divider" />
              <div className="btn-row">
                <button className="btn-primary" onClick={() => setStep(3)}>Continue to Upload →</button>
                <button className="btn-secondary" onClick={() => setStep(1)}>Change Type</button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && status === 'idle' && (
          <div>
            <button className="back-btn" onClick={() => setStep(2)}>← Back to Options</button>
            <div className="content-card">
              <div className="content-card-header">
                <div className="card-icon-wrap">📁</div>
                <div className="card-title">Upload Your Document</div>
              </div>
              <div className="card-subtitle">Upload your .docx file — we'll apply all formatting preferences</div>

              {!file ? (
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                  <input {...getInputProps()} />
                  <div className="dropzone-icon-wrap">📄</div>
                  <div className="dropzone-text">{isDragActive ? 'Drop your file here...' : 'Tap to select a .docx file'}</div>
                  <div className="dropzone-sub">or drag & drop here</div>
                </div>
              ) : (
                <div className="file-selected">
                  <span style={{ fontSize: '1.3rem' }}>📎</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  <button className="file-remove" onClick={() => setFile(null)}>✕</button>
                </div>
              )}

              {Object.keys(formData).filter(k => formData[k] !== undefined && formData[k] !== '' && formData[k] !== false).length > 0 && (
                <div className="config-summary">
                  <div className="config-summary-title">Configuration Summary</div>
                  {Object.entries(formData).filter(([, v]) => v !== undefined && v !== '' && v !== false).map(([k, v]) => (
                    <div key={k} className="config-row">
                      <span className="config-key">{k.replace(/_/g, ' ')}</span>
                      <span className="config-val">{v === true ? 'Yes' : v}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="divider" />
              <div className="btn-row">
                <button className="btn-primary" onClick={handleSubmit} disabled={!file}>Format Document</button>
                <button className="btn-secondary" onClick={handleReset}>Start Over</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Uploading ── */}
        {status === 'uploading' && (
          <div className="status-center">
            <div className="spinner-ring" />
            <div className="status-title">Formatting your document…</div>
            <div className="status-sub">This may take a few seconds.</div>
          </div>
        )}

        {/* ── Done ── */}
        {status === 'done' && (
          <div className="status-center">
            <div className="status-icon-wrap green">🎉</div>
            <div className="status-title">Document Formatted</div>
            <div className="status-sub">Your document is ready to download.</div>
            <div className="status-btns">
              <a href={downloadUrl} download="formatted_document.docx" className="btn-download">⬇ Download File</a>
              <button className="btn-secondary" onClick={handleReset}>Format Another</button>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {status === 'error' && (
          <div className="status-center">
            <div className="status-icon-wrap red">⚠️</div>
            <div className="status-title" style={{ color: '#DC2626' }}>Formatting Failed</div>
            <div className="status-sub">Something went wrong. Please check your file and try again.</div>
            <div className="status-btns">
              <button className="btn-primary" onClick={() => setStatus('idle')}>Try Again</button>
              <button className="btn-secondary" onClick={handleReset}>Start Over</button>
            </div>
          </div>
        )}

      </main>
      <footer className="app-footer">Publishing Format Studio · Professional document formatting</footer>









      {modal === 'login' && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-card">
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="modal-title">Welcome Back 👋</div>
            <div className="modal-sub">Sign in to your account</div>

            <div className="modal-field">
              <label className="modal-label">Email Address</label>
              <input className="modal-input" type="email" placeholder="you@example.com"
                value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} />
            </div>

            <div className="modal-field">
              <label className="modal-label">Password</label>
              <input className="modal-input" type="password" placeholder="••••••••"
                value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} />
            </div>

            {authError && <div className="modal-error">⚠ {authError}</div>}

            <button className="modal-submit" onClick={handleLogin}>Sign In →</button>

            <div className="modal-switch">
              Don't have an account? <button onClick={() => openModal('signup')}>Create Account</button>
            </div>
          </div>
        </div>
      )}










      {/* ── SIGNUP MODAL ── */}


      {modal === 'signup' && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-card">
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="modal-title">Create Account ✨</div>
            <div className="modal-sub">Join Format Studio</div>
            <div className="modal-field">
              <label className="modal-label">Full Name</label>
              <input className="modal-input" type="text" placeholder="Your full name"
                value={authForm.name} onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Email Address</label>
              <input className="modal-input" type="email" placeholder="you@example.com"
                value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Password</label>
              <input className="modal-input" type="password" placeholder="Minimum 8 characters"
                value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            {authError && <div className="modal-error">⚠ {authError}</div>}
            <button className="modal-submit" onClick={handleSignup}>Create Account →</button>
            <div className="modal-switch">
              Already have an account? <button onClick={() => openModal('login')}>Sign in</button>
            </div>
          </div>
        </div>
      )}







      {/* ── LICENCE / COPYRIGHT MODAL ── */}




      {modal === 'licence' && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-card wide">
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="licence-hero">
              {/* Fixed Image */}
              <img
                src={edwincover}
                alt="Edwin Incorporation Banner"
                className="licence-img"
                style={{ display: 'block', width: '100%', objectFit: 'cover' }}
              />
              <span className="licence-badge">© Edwin Incorporation</span>
              <div className="modal-title" style={{ marginBottom: 4 }}>License & Copyright Agreement</div>
              <div className="modal-sub" style={{ marginBottom: 0 }}>Edwin Incorporation — All Rights Reserved</div>
            </div>

            {/* Section 1: Company Policies */}
            <div className="licence-section-title">🏢 Company Policies & Employee Guidelines</div>
            <p className="licence-text">
              This software is the exclusive property of Edwin Incorporation. As an employee, you are granted a
              non-exclusive, non-transferable license to use this software solely for company-related activities.
              Any unauthorized use, distribution, or modification of this software is strictly prohibited and may
              result in disciplinary action including termination and legal proceedings.
            </p>

            {/* Section 2: Confidentiality Agreement */}
            <div className="licence-section-title">🤐 Confidentiality & Data Protection</div>
            <p className="licence-text">
              All data processed through this software, including but not limited to client information, business strategies,
              financial data, and proprietary algorithms, is strictly confidential. Employees must not share, copy, or
              distribute any information from this system to unauthorized parties. Violation of this policy will lead to
              immediate legal action as per the Information Technology Act and Company's Non-Disclosure Agreement (NDA).
            </p>

            {/* Section 3: Intellectual Property Rights */}
            <div className="licence-section-title">© Intellectual Property Ownership</div>
            <p className="licence-text">
              The software, including its source code, design, UI elements, trademarks, logos, and all associated intellectual
              property, is solely owned by Edwin Incorporation. Any work created, developed, or produced using this software
              remains the exclusive property of the company. Employees have no personal claim or ownership rights over any
              part of this software or its outputs.
            </p>

            {/* Section 4: Usage Restrictions */}
            <div className="licence-section-title">⚠️ Usage Restrictions & Compliance</div>
            <p className="licence-text">
              Employees must not: (a) Reverse engineer, decompile, or disassemble the software; (b) Use the software for any
              illegal, unauthorized, or personal purposes; (c) Remove any copyright or proprietary notices; (d) Share login
              credentials or access rights; (e) Install unauthorized plugins or modifications; (f) Use the software outside
              the scope of assigned duties. Regular audits will be conducted to ensure compliance.
            </p>

            {/* Section 5: Data Retention & Privacy */}
            <div className="licence-section-title">🔐 Data Retention & Privacy Policy</div>
            <p className="licence-text">
              Edwin Incorporation collects, processes, and stores user data in compliance with applicable privacy laws.
              Employee activity logs may be monitored to ensure security and compliance. No personal data will be sold or
              shared with third parties without legal requirement. Data retention period is 5 years as per company policy.
              Employees have the right to request access to their personal data as per GDPR/Company Privacy Framework.
            </p>

            {/* Section 6: Security Protocols */}
            <div className="licence-section-title">🛡️ Security & Access Control</div>
            <p className="licence-text">
              All employees must secure their accounts with strong passwords and enable two-factor authentication (2FA).
              Unauthorized access attempts must be reported immediately to the IT Security Team. Any security breach,
              intentional or accidental, must be disclosed within 24 hours. The company reserves the right to revoke access
              at any time without prior notice.
            </p>

            {/* Section 7: Liability & Disclaimer */}
            <div className="licence-section-title">⚖️ Limitation of Liability</div>
            <p className="licence-text">
              This software is provided "AS IS" without warranties of any kind. Edwin Incorporation shall not be liable for any
              direct, indirect, incidental, or consequential damages arising from the use or inability to use this software.
              Employees use this software at their own risk within the scope of their employment. The company does not guarantee
              uninterrupted or error-free operation of the software.
            </p>

            {/* Section 8: Termination of Access */}
            <div className="licence-section-title">🚪 Termination & Access Revocation</div>
            <p className="licence-text">
              Upon termination of employment (voluntary or involuntary), all access rights to this software will be immediately
              revoked. Employees must return or destroy any company data, credentials, or proprietary information in their
              possession within 24 hours of termination. Continued use of the software post-termination will result in legal
              action for unauthorized access under relevant cyber laws.
            </p>

            {/* Section 9: Compliance with Laws */}
            <div className="licence-section-title">🌐 Governing Law & Jurisdiction</div>
            <p className="licence-text">
              This agreement is governed by the laws of the jurisdiction where Edwin Incorporation is registered. Any disputes
              arising from the use of this software shall be subject to the exclusive jurisdiction of the courts in that location.
              Employees are responsible for understanding and complying with all applicable local, state, and federal laws while
              using this software.
            </p>

            {/* Section 10: Acknowledgment */}
            <div className="licence-section-title">✍️ Employee Acknowledgment</div>
            <p className="licence-text">
              By using this software, employees acknowledge that they have read, understood, and agreed to all the above policies,
              terms, and conditions. Ignorance of these policies does not exempt employees from compliance. The company reserves
              the right to update these policies at any time with or without prior notice. Continued use of the software constitutes
              acceptance of any changes.
            </p>

            {/* Footer */}
            <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', fontSize: '.78rem', color: 'var(--accent)', fontWeight: 600 }}>
              © {new Date().getFullYear()} Edwin Incorporation — Confidential & Proprietary. All rights reserved.
              <br />
              <span style={{ fontSize: '.7rem', fontWeight: 'normal', marginTop: 4, display: 'block' }}>
                Version 1.0 | Last Updated: {new Date().toLocaleDateString()} | For authorized employee use only
              </span>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}


