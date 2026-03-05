const MarketingIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);

const FinanceIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const StrategyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const GeneralIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
  </svg>
);

const AGENT_MAP = {
  marketing: { label: "Marketing", Icon: MarketingIcon, cls: "tag-marketing" },
  finance:   { label: "Finance",   Icon: FinanceIcon,   cls: "tag-finance"   },
  strategy:  { label: "Strategy",  Icon: StrategyIcon,  cls: "tag-strategy"  },
};

export default function AgentBadge({ type }) {
  const a = AGENT_MAP[type] || { label: type, Icon: GeneralIcon, cls: "tag-general" };
  return (
    <span className={a.cls} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", fontSize: 11, fontWeight: 500,
      letterSpacing: "0.05em", textTransform: "uppercase"
    }}>
      <a.Icon /> {a.label}
    </span>
  );
}