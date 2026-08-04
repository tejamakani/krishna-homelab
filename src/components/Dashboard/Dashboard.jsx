import styles from "./Dashboard.module.css";

import ServicesGrid from "./ServicesGrid";
import ServicePerformance from "./ServicePerformance";
import CameraStatus from "./CameraStatus";

export default function Dashboard() {
  return (
    <section className={styles.dashboard}>
      <div className={styles.container}>

        <div className={styles.header}>
          <span className={styles.badge}>
            INFRASTRUCTURE OVERVIEW
          </span>

          <h2>Your HomeLab at a Glance</h2>

          <p>
            Monitor infrastructure, virtualization, AI surveillance,
            automation and system health from a single dashboard.
          </p>
        </div>

        <ServicesGrid />

        <ServicePerformance />

        <CameraStatus />

      </div>
    </section>
  );
}