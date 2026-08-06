import styles from "../PortalLayout.module.css";

export default function HeroSection() {
  return (
    <header className={styles.centerHero}>
      <h1 className={styles.centerHeroTitle}>
        Makani&apos;s <span>HomeAuto</span>
      </h1>

      <p className={styles.centerHeroDescription}>
        A production-inspired HomeLab for automation, AI surveillance,
        and enterprise networking — designed, built, and documented
        using practical engineering standards.
      </p>
    </header>
  );
}