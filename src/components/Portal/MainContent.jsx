import styles from "./PortalLayout.module.css";

export default function MainContent() {
  return (
    <main className={styles.mainContent}>

      <span className={styles.heroBadge}>
        ENTERPRISE SMART HOME PLATFORM
      </span>

      <h1 className={styles.heroTitle}>
        🏠 Makani's HomeAuto
      </h1>

      <p className={styles.heroSubtitle}>
        Engineering the Future of Smart Living
      </p>

      <p className={styles.heroDescription}>
        A production-inspired Smart Home platform built using
        Proxmox VE, Home Assistant, Frigate AI,
        Google Coral TPU and Enterprise Networking.
      </p>

      <div className={styles.quickActions}>

        <button>🏛 Architecture</button>

        <button>🧪 Lab Setup</button>

        <button>🏢 Production</button>

        <button>📚 Projects</button>

      </div>

    </main>
  );
}