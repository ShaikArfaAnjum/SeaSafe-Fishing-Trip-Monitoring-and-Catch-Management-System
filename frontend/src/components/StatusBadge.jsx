
// Displays color-coded pills for trip and alert statuses.

export default function StatusBadge({ status }) {
  const norm = (status || '').toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`status-badge ${norm}`}>
      {status || 'Unknown'}
    </span>
  );
}

