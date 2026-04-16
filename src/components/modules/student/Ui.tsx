import { avatarColors, gpaColor, initials } from "@/lib/utils";
import Image from "next/image";

// ─── Avatar ───────────────────────────────────────────────
export function Avatar({
  name,
  photo,
  size = 36,
}: {
  name?: string;
  photo?: string;
  size?: number;
}) {
  const [bg, fg] = avatarColors(name);
  if (photo)
    return (
      <Image
        src={photo}
        alt={name ?? ""}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-white/10 shrink-0"
        style={{ width: size, height: size }}
      />
    );
  return (
    <span
      className="rounded-full flex items-center justify-center font-bold shrink-0 ring-1 ring-white/10"
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.36,
      }}
    >
      {initials(name)}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    passed: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
    failed: "bg-red-500/15 text-red-400 ring-red-500/30",
    referred: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  };
  const cls =
    map[status?.toLowerCase()] ?? "bg-white/10 text-white/50 ring-white/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ring-1 ${cls}`}
    >
      {status}
    </span>
  );
}

// ─── Circle GPA ───────────────────────────────────────────
export function CircleGpa({
  value,
  label,
  size = 72,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const { stroke, text, label: grade } = gpaColor(value);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 4) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ gap: 1 }}
        >
          <span
            className="font-black tabular-nums leading-none"
            style={{ color: text, fontSize: size * 0.22 }}
          >
            {value.toFixed(2)}
          </span>
          <span
            className="font-bold uppercase tracking-widest"
            style={{ color: stroke, fontSize: size * 0.1, opacity: 0.8 }}
          >
            {grade}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-black">
        {label}
      </span>
    </div>
  );
}

// ─── Filter Select ────────────────────────────────────────
export function FilterSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: { id: number | string; name: string }[];
  placeholder: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-xl border border-white/10 bg-[#0f0f1a] px-3 py-2 pr-8 text-sm text-white outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer backdrop-blur-sm"
        >
          <option value="" className="bg-[#0f0f1a] text-white/70">
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.id} value={String(o.id)} className="bg-[#0f0f1a] text-white/70">
              {o.name}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────
export function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 ring-1 ring-indigo-500/30">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-white transition ml-0.5 opacity-60 hover:opacity-100"
      >
        <svg
          width="9"
          height="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}