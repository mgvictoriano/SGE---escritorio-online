import { C } from '../../constants/paleta';

export default function Btn({ label, onClick, color, small, style, disabled }) {
  const bg = color || C.accent;
  const isGhost = bg === C.border || bg === C.subtle;
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        background: isGhost ? C.subtle : bg + "ee",
        color: isGhost ? C.text : "#fff",
        border: `1px solid ${isGhost ? C.border : bg + "88"}`,
        borderRadius: 20,
        padding: small ? "5px 14px" : "8px 20px",
        fontSize: small ? 12 : 13.5,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        letterSpacing: "0.2px",
        transition: "all .18s ease",
        boxShadow: isGhost ? "none" : `0 2px 12px ${bg}30`,
        ...style,
      }}
    >
      {label}
    </button>
  );
}
