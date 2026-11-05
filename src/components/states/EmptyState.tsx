import { useId } from 'react';

interface EmptyStateProps {
  title?: string;
  tip?: string;
  onEditSearch: () => void;
}

export default function EmptyState({
  title = 'Nenhuma cidade encontrada',
  tip = 'Confira a grafia ou tente buscar outra cidade.',
  onEditSearch,
}: EmptyStateProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-lg border border-white/10 bg-white/5 p-6 text-white backdrop-blur-md"
    >
      <h2 className="text-lg font-semibold" id={headingId}>
        {title}
      </h2>
      <p className="mt-2 text-sm text-white/65">{tip}</p>
      <button
        className="mt-4 min-h-11 rounded-md border border-white/15 bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
        onClick={onEditSearch}
        type="button"
      >
        Editar busca
      </button>
    </section>
  );
}
