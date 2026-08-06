import Link from "@docusaurus/Link";
import styles from "../PortalLayout.module.css";

export default function ActionButtons() {
  return (
    <div className={styles.portalActions}>
      <Link
        className={styles.primaryPortalAction}
        to="/docs"
      >
        🚀 Start Exploring
      </Link>

      <Link
        className={styles.secondaryPortalAction}
        to="/docs"
      >
        🏛 View Architecture
      </Link>
    </div>
  );
}