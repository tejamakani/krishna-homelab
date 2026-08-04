import styles from "../Dashboard.module.css";

export default function CameraTile({
  name,
  status,
  color,
}) {
  return (
    <div className={styles.cameraTile}>

      <div>
        <strong>{name}</strong>
      </div>

      <span
        className={styles.cameraStatus}
        style={{ color }}
      >
        {status}
      </span>

    </div>
  );
}