import styles from "./Hero.module.css";

export default function StatusTile({ icon, title, value, color }) {
  return (
    <div className={styles.statusTile}>

      <div className={styles.tileHeader}>
        <span className={styles.tileTitle}>
          {icon} {title}
        </span>

        <span
          className={styles.tileValue}
          style={{ color }}
        >
          {value}%
        </span>
      </div>

      <div className={styles.tileBar}>
        <div
          className={styles.tileProgress}
          style={{
            width: `${value}%`,
            background: color,
          }}
        />
      </div>

    </div>
  );
}