import styles from "./Dashboard.module.css";

import { health } from "../../data/health";

import HealthTile from "./components/HealthTile";

export default function InfrastructureHealth() {
  return (
    <section className={styles.healthSection}>

      <h2>Infrastructure Health</h2>

      <p>
        Core services powering the HomeLab.
      </p>

      <div className={styles.healthGrid}>
        {health.map((item) => (
          <HealthTile
            key={item.name}
            {...item}
          />
        ))}
      </div>

    </section>
  );
}