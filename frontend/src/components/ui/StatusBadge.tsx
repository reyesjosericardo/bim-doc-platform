import type { DocumentStatus } from '@/types/oir';

// Outline chips tuned for the dark Incoestructura header.
const config: Record<DocumentStatus, { label: string; color: string }> = {
  borrador:    { label: 'Borrador',    color: '#8A968A' },
  en_revision: { label: 'En revisión', color: '#C9A86A' },
  aprobado:    { label: 'Aprobado',    color: '#9CBE93' },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, color } = config[status] ?? config.borrador;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] font-code text-[10.5px] tracking-wide uppercase border"
      style={{ color, borderColor: `${color}55`, background: `${color}14` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
