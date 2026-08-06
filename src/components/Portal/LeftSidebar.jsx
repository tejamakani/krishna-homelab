import styles from "./PortalLayout.module.css";

export default function LeftSidebar() {
  return (
    <aside className={styles.leftSidebar}>
      <div className={styles.sidebarHeader}>
        <h3>Documentation</h3>
      </div>

      <nav>
        <div className={styles.navSection}>
          <h4>Getting Started</h4>
          <a href="#">About HomeAuto</a>
        </div>

        <div className={styles.navSection}>
          <h4>Part I — Architecture</h4>
          <a href="#">Solution Overview</a>
          <a href="#">Physical Architecture</a>
          <a href="#">Logical Architecture</a>
          <a href="#">Network Topology</a>
          <a href="#">Data Flow</a>
        </div>

        <div className={styles.navSection}>
          <h4>Part II — Implementation</h4>
          <a href="#">Lab Setup</a>
          <a href="#">Production Setup</a>
        </div>

        <div className={styles.navSection}>
          <h4>Resources</h4>
          <a href="#">Projects</a>
          <a href="#">Appendix</a>
        </div>
      </nav>
    </aside>
  );
}