import { C } from '../../constants/paleta';

export default function Badge({ label, color }) {
  return (
    <span style={{
      background: color + "18",
      color,
      border: `1px solid ${color}35`,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 10.5,
      fontWeight: 600,
      letterSpacing: "0.4px",
      textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
}
