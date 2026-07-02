import type { HistoricalSemantics } from "@/lib/types";

type TemporalModel = "valid_time" | "bitemporal" | "tritemporal_unknown";

type Props = {
  validIntervalEnd: "exclusive" | "inclusive";
  visibleIntervalEnd: "exclusive" | "inclusive";
  temporalModel: TemporalModel;
  onChangeValidIntervalEnd: (value: "exclusive" | "inclusive") => void;
  onChangeVisibleIntervalEnd: (value: "exclusive" | "inclusive") => void;
  onChangeTemporalModel: (value: TemporalModel) => void;
};

const chipBase: React.CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.28)",
  background: "rgba(15, 23, 42, 0.72)",
  color: "#cbd5e1",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const activeChip: React.CSSProperties = {
  background: "rgba(59, 130, 246, 0.18)",
  border: "1px solid rgba(96, 165, 250, 0.7)",
  color: "#bfdbfe",
};

function ToggleGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontSize: 12,
          color: "#94a3b8",
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              ...chipBase,
              ...(value === option.value ? activeChip : {}),
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AnalysisAssumptionsBar({
  validIntervalEnd,
  visibleIntervalEnd,
  temporalModel,
  onChangeValidIntervalEnd,
  onChangeVisibleIntervalEnd,
  onChangeTemporalModel,
}: Props) {
  return (
    <section
      style={{
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background: "rgba(2, 6, 23, 0.42)",
        borderRadius: 18,
        padding: 14,
        display: "flex",
        gap: 14,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#e2e8f0",
          fontWeight: 900,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Analysis assumptions
      </div>

      <ToggleGroup
        label="Valid end"
        value={validIntervalEnd}
        onChange={onChangeValidIntervalEnd}
        options={[
          { value: "exclusive", label: "Exclusive" },
          { value: "inclusive", label: "Inclusive" },
        ]}
      />

      <ToggleGroup
        label="Visible end"
        value={visibleIntervalEnd}
        onChange={onChangeVisibleIntervalEnd}
        options={[
          { value: "exclusive", label: "Exclusive" },
          { value: "inclusive", label: "Inclusive" },
        ]}
      />

      <ToggleGroup
        label="Temporal model"
        value={temporalModel}
        onChange={onChangeTemporalModel}
        options={[
          { value: "valid_time", label: "Valid-time" },
          { value: "bitemporal", label: "Bitemporal" },
          { value: "tritemporal_unknown", label: "Tri-temporal / Unknown" },
        ]}
      />
    </section>
  );
}