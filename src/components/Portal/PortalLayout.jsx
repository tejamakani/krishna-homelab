import styles from "./PortalLayout.module.css";
import PortalCenter from "./Center/PortalCenter";

export default function PortalLayout() {
  return (
    <main className={styles.portal}>
      <PortalCenter />
    </main>
  );
}