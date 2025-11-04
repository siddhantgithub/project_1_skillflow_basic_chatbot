export const SkillFlowLogo = ({ size = 32 }: { size?: number }) => (
  <svg
    height={size}
    viewBox="0 0 200 200"
    width={size}
    style={{ color: "currentcolor" }}
  >
    <defs>
      <linearGradient id="skillflow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Outer circle */}
    <circle
      cx="100"
      cy="100"
      r="90"
      fill="none"
      stroke="url(#skillflow-gradient)"
      strokeWidth="4"
    />
    
    {/* Flow arrows - representing skill progression */}
    <path
      d="M 60 80 L 90 80 L 85 75 M 90 80 L 85 85"
      stroke="url(#skillflow-gradient)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    <path
      d="M 110 100 L 140 100 L 135 95 M 140 100 L 135 105"
      stroke="url(#skillflow-gradient)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    <path
      d="M 60 120 L 90 120 L 85 115 M 90 120 L 85 125"
      stroke="url(#skillflow-gradient)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Central "SF" letters */}
    <text
      x="100"
      y="110"
      fontSize="48"
      fontWeight="bold"
      textAnchor="middle"
      fill="url(#skillflow-gradient)"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      SF
    </text>
  </svg>
);

export const SkillFlowIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    height={size}
    viewBox="0 0 100 100"
    width={size}
    style={{ color: "currentcolor" }}
  >
    <defs>
      <linearGradient id="skillflow-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Simplified icon - just the SF letters in a circle */}
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="url(#skillflow-icon-gradient)"
    />
    
    <text
      x="50"
      y="62"
      fontSize="32"
      fontWeight="bold"
      textAnchor="middle"
      fill="white"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      SF
    </text>
  </svg>
);

export const SkillFlowWordmark = ({ height = 32 }: { height?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
    <SkillFlowIcon size={height} />
    <span
      style={{
        fontSize: `${height * 0.6}px`,
        fontWeight: 700,
        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      SkillFlow-AI Client
    </span>
  </div>
);

