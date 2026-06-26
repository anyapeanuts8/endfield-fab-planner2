import { useEffect, useState } from "react";
import { facilitiesApi } from "../api/facilities";
import { useMasterStore } from "../store/masterStore";
import { PortEditor } from "../components/facility/PortEditor";
import { RotationPreview } from "../components/facility/RotationPreview";
import type { FacilityMaster, Port } from "../types";

type EditState = {
  id: string | null;
  name: string;
  width: number;
  height: number;
  ports: Port[];
};

const EMPTY: EditState = { id: null, name: "", width: 3, height: 3, ports: [] };

export function FacilityMasterPage() {
  const { facilities, transportTypes, load } = useMasterStore();
  const [edit, setEdit] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, [load]);

  const startCreate = () => setEdit({ ...EMPTY });

  const startEdit = (f: FacilityMaster) =>
    setEdit({ id: f.id, name: f.name, width: f.width, height: f.height, ports: structuredClone(f.ports) });

  const handleDelete = async (id: string) => {
    if (!confirm("この設備を削除しますか？")) return;
    await facilitiesApi.delete(id);
    await load();
  };

  const handleSave = async () => {
    if (!edit) return;
    setError(null);
    if (!edit.name.trim()) { setError("設備名を入力してください"); return; }
    if (edit.width < 1 || edit.height < 1) { setError("サイズは1以上にしてください"); return; }
    setSaving(true);
    try {
      if (edit.id) {
        await facilitiesApi.update(edit.id, { name: edit.name, width: edit.width, height: edit.height, ports: edit.ports });
      } else {
        await facilitiesApi.create({ name: edit.name, width: edit.width, height: edit.height, ports: edit.ports });
      }
      await load();
      setEdit(null);
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "#e2e8f0" }}>
      {/* 左: 設備一覧 */}
      <div style={{ width: 300, borderRight: "1px solid #334155", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "bold" }}>設備マスタ</span>
          <button onClick={startCreate} style={btnStyle("#22c55e")}>+ 新規</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {facilities.length === 0 && (
            <div style={{ padding: 16, color: "#64748b", fontSize: 13 }}>設備がありません</div>
          )}
          {facilities.map((f) => (
            <div
              key={f.id}
              onClick={() => startEdit(f)}
              style={{
                padding: "10px 16px",
                borderBottom: "1px solid #1e293b",
                cursor: "pointer",
                background: edit?.id === f.id ? "#1e3a5f" : "transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: "bold" }}>{f.name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  {f.width}×{f.height} / ポート {f.ports.length}本
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
                style={{ ...btnStyle("#ef4444"), fontSize: 11, padding: "2px 8px" }}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 右: 編集パネル */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {!edit ? (
          <div style={{ color: "#64748b", fontSize: 14, marginTop: 40, textAlign: "center" }}>
            左のリストから設備を選ぶか、「+ 新規」で作成してください
          </div>
        ) : (
          <div style={{ maxWidth: 720 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 16 }}>
              {edit.id ? "設備を編集" : "新規設備を作成"}
            </h2>

            <Section title="基本情報">
              <Field label="設備名">
                <input
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  style={inputStyle}
                  placeholder="例: 精錬炉"
                />
              </Field>
              <div style={{ display: "flex", gap: 16 }}>
                <Field label="幅 (マス)">
                  <input
                    type="number" min={1} max={20}
                    value={edit.width}
                    onChange={(e) => setEdit({ ...edit, width: Number(e.target.value), ports: [] })}
                    style={{ ...inputStyle, width: 80 }}
                  />
                </Field>
                <Field label="高さ (マス)">
                  <input
                    type="number" min={1} max={20}
                    value={edit.height}
                    onChange={(e) => setEdit({ ...edit, height: Number(e.target.value), ports: [] })}
                    style={{ ...inputStyle, width: 80 }}
                  />
                </Field>
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                ※サイズを変更するとポート定義がリセットされます
              </div>
            </Section>

            <Section title="ポート定義">
              <PortEditor
                width={edit.width}
                height={edit.height}
                ports={edit.ports}
                transportTypes={transportTypes}
                onChange={(ports) => setEdit({ ...edit, ports })}
              />
            </Section>

            {edit.ports.length > 0 && (
              <Section title="回転プレビュー">
                <RotationPreview
                  width={edit.width}
                  height={edit.height}
                  ports={edit.ports}
                  transportTypes={transportTypes}
                />
              </Section>
            )}

            {error && (
              <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 12 }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={handleSave} disabled={saving} style={btnStyle("#22c55e")}>
                {saving ? "保存中..." : "💾 保存"}
              </button>
              <button onClick={() => setEdit(null)} style={btnStyle("#475569")}>
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10, borderBottom: "1px solid #334155", paddingBottom: 4 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "6px 10px", borderRadius: 4,
  border: "1px solid #475569", background: "#1e293b",
  color: "#e2e8f0", fontSize: 13, width: 240,
};

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: "6px 16px", borderRadius: 4,
    border: `1px solid ${color}`, background: "transparent",
    color, cursor: "pointer", fontSize: 13,
  };
}
