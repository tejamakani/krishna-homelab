import styles from "../Dashboard.module.css";

export default function ProgressBar({
  label,
  value,
  text,
  color = "#38bdf8",
}) {
  return (
    <div className={styles.progressSection}>

      <div className={styles.metricHeader}>
        <span>{label}</span>

        <span>{text}</span>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{
            width: `${value}%`,
            background: color,
          }}
        />
      </div>

    </div>
  );
}