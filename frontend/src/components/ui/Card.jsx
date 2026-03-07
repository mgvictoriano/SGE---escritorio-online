import { C } from '../../constants/paleta';

export default function Card({ children, style }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 22,
      boxShadow: `0 2px 12px ${C.shadow || "rgba(0,0,0,0.10)"}`,
      position: "relative",
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}
