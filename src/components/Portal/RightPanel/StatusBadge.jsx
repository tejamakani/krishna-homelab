import styles from "./PortalRightPanel.module.css";

export default function StatusBadge({
  label,
  status = "Healthy",
  color = "#22c55e",
}) {
  return (
    <div className={styles.statusRow}>
      <div className={styles.statusName}>
        <span
          className={styles.statusDot}
          style={{ backgroundColor: color }}
        />
        <span>{label}</span>
      </div>

      <span
        className={styles.statusValue}
        style={{ color }}
      >
        {status}
      </span>
    </div>
  );
}