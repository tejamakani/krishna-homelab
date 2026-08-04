import styles from "./Hero.module.css";
import { health } from "../../data/health";

export default function HeroHealthPanel() {
  const onlineCount = health.length;

  return (
    <aside className={styles.heroHealthPanel}>
      <div className={styles.heroHealthHeader}>
        <div>
          <span className={styles.heroHealthEyebrow}>
            LIVE PLATFORM STATUS
          </span>

          <h3>Infrastructure Health</h3>
        </div>

        <span className={styles.heroHealthSummary}>
          {onlineCount}/{onlineCount} Online
        </span>
      </div>

      <p className={styles.heroHealthDescription}>
        Real-time operational state of the core services powering the HomeLab.
      </p>

      <div className={styles.heroHealthList}>
        {health.map((service) => (
          <div
            className={styles.heroHealthRow}
            key={service.name}
          >
            <div className={styles.heroHealthService}>
              <span
                className={styles.heroHealthDot}
                style={{ backgroundColor: service.color }}
              />

              <span>{service.name}</span>
            </div>

            <strong style={{ color: service.color }}>
              {service.status}
            </strong>
          </div>
        ))}
      </div>

      <div className={styles.heroHealthFooter}>
        <div>
          <span>Availability</span>
          <strong>99.98%</strong>
        </div>

        <div>
          <span>Core Services</span>
          <strong>{onlineCount}</strong>
        </div>
      </div>
    </aside>
  );
  
}
