import { C } from '../../constants/paleta';

export default function Inp({ label, value, onChange, type = "text", placeholder, style, disabled, suffix }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, ...style }}>
      {label && (
        <label style={{ color: C.silver, fontSize: 11.5, fontWeight: 500, letterSpacing: "0.3px" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          disabled={disabled}
          type={type}
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: C.inputBg,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: `9px ${suffix ? "38px" : "13px"} 9px 13px`,
            color: C.text,
            fontSize: 13.5,
            outline: "none",
            transition: "border-color .2s, box-shadow .2s",
            opacity: disabled ? 0.45 : 1,
          }}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 11, color: C.muted, fontSize: 12 }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
