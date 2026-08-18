import styles from "../PortalLayout.module.css";

import DocumentationCard from "./DocumentationCard";
import MonitoringCard from "./MonitoringCard";

export default function PrimaryWorkspace() {
  return (
    <section className={styles.primaryWorkspace}>
      <DocumentationCard />
      <MonitoringCard />
    </section>
  );
}