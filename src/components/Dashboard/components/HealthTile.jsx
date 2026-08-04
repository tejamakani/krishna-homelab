import styles from "../Dashboard.module.css";

export default function HealthTile({
  name,
  status,
  color,
}) {
  return (
    <div className={styles.healthTile}>
      <div className={styles.healthLeft}>
        <span
          className={styles.healthDot}
          style={{ background: color }}
        />

        <span>{name}</span>
      </div>

      <span
        className={styles.healthStatus}
        style={{ color }}
      >
        {status}
      </span>
    </div>
  );
}