import styles from "./Dashboard.module.css";

import { services } from "../../data/services";

import ServiceCard from "./components/ServiceCard";

export default function ServicePerformance() {
  return (
    <section className={styles.serviceSection}>

      <h2>Service Performance</h2>

      <p>
        Real-time operational status of core HomeLab services.
      </p>

      <div className={styles.serviceGrid}>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            {...service}
          />
        ))}
      </div>

    </section>
  );
}