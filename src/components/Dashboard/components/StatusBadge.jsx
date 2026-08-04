import styles from "../Dashboard.module.css";

export default function StatusBadge({ status, color = "#22c55e" }) {
  return (
    <div className={styles.statusBadge}>
      <span
        className={styles.statusDot}
        style={{ background: color }}
      />

      <span>{status}</span>
    </div>
  );
}