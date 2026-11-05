interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      aria-live="assertive"
      className="rounded-lg border border-red-300/20 bg-white/5 p-4 text-white backdrop-blur-md"
      role="alert"
    >
      <p>{message}</p>
      <button
        className="mt-3 min-h-11 rounded-md border border-white/15 bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}
