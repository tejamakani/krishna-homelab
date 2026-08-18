import styles from "../PortalLayout.module.css";

export default function HeroSection() {
  return (
    <header className={styles.centerHero}>
      <div className={styles.heroStatusRow}>
        <span className={styles.heroEyebrow}>
          ENGINEERING SMART HOME INFRASTRUCTURE
        </span>

        <span className={styles.heroOperational}>
          <span className={styles.heroStatusDot} />
          Platform Operational
        </span>
      </div>

      <h1 className={styles.centerHeroTitle}>
        Makani&apos;s <span>HomeAuto</span>
      </h1>

      <p className={styles.centerHeroDescription}>
        A self-hosted engineering platform for smart-home automation,
        AI surveillance, containerized services, messaging, and
        production-inspired infrastructure.
      </p>

      <div className={styles.heroMeta}>
        <span>HomeLab</span>
        <span>Production</span>
        <span>AI Surveillance</span>
        <span>Automation</span>
        <span>Infrastructure</span>
      </div>
    </header>
  );
}