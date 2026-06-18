// Incoestructura isotype — isometric cube.
export function CubeMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden role="img">
      <path d="M 100 30 L 160 65 L 100 100 L 40 65 Z" fill="#EEE9DB" />
      <path d="M 40 65 L 100 100 L 100 170 L 40 135 Z" fill="#8FA88E" />
      <path d="M 100 100 L 160 65 L 160 135 L 100 170 Z" fill="#6B8068" />
    </svg>
  );
}
