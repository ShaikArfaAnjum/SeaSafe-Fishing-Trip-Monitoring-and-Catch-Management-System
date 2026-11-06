
// Standard statistic card matching the SeaSafe reference design.

export default function StatCard({ title, value, icon, iconBg = '#e0f2fe' }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <div className="stat-card-info">
        <h3>{title}</h3>
        <div className="stat-card-value">{value}</div>
      </div>
    </div>
  );
}

