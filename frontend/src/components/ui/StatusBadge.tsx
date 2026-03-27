import type { DocumentStatus } from '@/types/oir';

const config: Record<DocumentStatus, { label: string; className: string }> = {
  borrador:    { label: 'Borrador',    className: 'bg-gray-100 text-gray-600' },
  en_revision: { label: 'En revisión', className: 'bg-yellow-100 text-yellow-700' },
  aprobado:    { label: 'Aprobado',    className: 'bg-green-100 text-green-700' },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, className } = config[status] ?? config.borrador;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
