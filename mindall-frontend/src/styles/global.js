// Injects Google Fonts and global CSS into the document head.
// Called once from main.jsx.

export const injectGlobalStyles = () => {
  // Google Fonts
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(fontLink);

  // Global CSS
  const style = document.createElement("style");
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; min-height: 100vh; }
    body { font-family: 'DM Sans', sans-serif; background: #FAFAF8; color: #1A1A1A; overflow-x: hidden; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #F0EDE8; }
    ::-webkit-scrollbar-thumb { background: #C9A96E; border-radius: 2px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }

    .fade-up { animation: fadeUp 0.6s ease both; }
    .fade-in { animation: fadeIn 0.4s ease both; }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    .delay-5 { animation-delay: 0.5s; }

    .btn-primary {
      background: #1A1A1A; color: #FAFAF8;
      border: none; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 14px;
      padding: 12px 28px; letter-spacing: 0.03em;
      transition: background 0.2s, transform 0.15s;
    }
    .btn-primary:hover  { background: #2D2D2D; transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    .btn-ghost {
      background: transparent; color: #1A1A1A;
      border: 1px solid #E0DBD4; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 400; font-size: 14px;
      padding: 11px 28px; letter-spacing: 0.03em;
      transition: border-color 0.2s, background 0.2s;
    }
    .btn-ghost:hover { border-color: #1A1A1A; background: #F5F2EE; }

    .card {
      background: #fff; border: 1px solid #E8E4DF;
      transition: box-shadow 0.25s, transform 0.25s;
    }
    .card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.06); transform: translateY(-2px); }

    .input-field {
      width: 100%; padding: 12px 16px;
      border: 1px solid #E0DBD4; background: #fff;
      font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1A1A1A;
      outline: none; transition: border-color 0.2s;
    }
    .input-field:focus { border-color: #C9A96E; }
    .input-field::placeholder { color: #B8B0A8; }

    .tag-marketing { background: #FFF3E8; color: #C97A2A; }
    .tag-finance   { background: #E8F5F0; color: #2A9A70; }
    .tag-strategy  { background: #EEF0FF; color: #4A5FBF; }
    .tag-general   { background: #F5F2EE; color: #6B6560; }

    @media (max-width: 768px) {
      .chat-header         { padding: 12px 16px !important; flex-wrap: wrap; gap: 8px; }
      .chat-header-badges  { display: none !important; }
      .chat-messages       { padding: 16px !important; }
      .chat-input-bar      { padding: 12px 16px 16px !important; }
      .chat-msg-inner      { max-width: 100% !important; }
      .chat-user-bubble    { max-width: 88% !important; }
      .suggestions-wrap    { padding: 0 16px 10px !important; }
      .dashboard-body      { padding: 24px 20px !important; }
      .projects-grid       { grid-template-columns: 1fr !important; }
    }
    @media (min-width: 769px) and (max-width: 1280px) {
      .dashboard-body  { padding: 48px 4% !important; }
      .projects-grid   { grid-template-columns: repeat(2, 1fr) !important; }
    }
  `;
  document.head.appendChild(style);
};