import styles from "../Dashboard.module.css";

export default function MetricCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon}>{icon}</div>

      <div className={styles.metricTitle}>{title}</div>

      <div className={styles.metricValue}>{value}</div>

      <div className={styles.metricSubtitle}>{subtitle}</div>
    </div>
  );
}