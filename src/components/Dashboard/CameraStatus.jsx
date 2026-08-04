import styles from "./Dashboard.module.css";

import { cameras } from "../../data/cameras";

import CameraTile from "./components/CameraTile";

export default function CameraStatus() {
  return (
    <section className={styles.cameraSection}>

      <h2>Camera Status</h2>

      <p>
        Live status of Frigate AI monitored cameras.
      </p>

      <div className={styles.cameraGrid}>
        {cameras.map((camera) => (
          <CameraTile
            key={camera.name}
            {...camera}
          />
        ))}
      </div>

    </section>
  );
}