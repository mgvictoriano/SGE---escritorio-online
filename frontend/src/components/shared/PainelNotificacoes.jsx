import { C } from '../../constants/paleta';

export default function PainelNotificacoes({ notifs, onMarcarLida, onMarcarTodas, onClose }) {
  const naoLidas = notifs.filter(n => !n.lida).length;
  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 380, background: C.card, borderLeft: `1px solid ${C.border}`, zIndex: 9998, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.4)" }} className="fadeUp">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>🔔 Notificações</div>
          {naoLidas > 0 && <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{naoLidas} não lida{naoLidas > 1 ? "s" : ""}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {naoLidas > 0 && <button onClick={onMarcarTodas} style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Marcar todas</button>}
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {notifs.length === 0 && <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhuma notificação</div>}
        {notifs.map(n => (
          <div
            key={n.id}
            onClick={() => onMarcarLida(n.id)}
            style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: n.lida ? "transparent" : C.accent + "08", transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.subtle}
            onMouseLeave={e => e.currentTarget.style.background = n.lida ? "transparent" : C.accent + "08"}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ color: n.lida ? C.muted : C.text, fontSize: 13, fontWeight: n.lida ? 400 : 600, lineHeight: 1.4 }}>{n.titulo}</div>
                  {!n.lida && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, flexShrink: 0, marginTop: 4 }} />}
                </div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{n.msg}</div>
                <div style={{ color: C.muted, fontSize: 10, marginTop: 4 }}>{n.data}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
