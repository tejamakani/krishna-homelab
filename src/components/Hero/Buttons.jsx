import Link from "@docusaurus/Link";
import styles from "../Hero.module.css";

export default function HeroButtons() {
  return (
    <div className={styles.heroButtons}>

      <Link
        className={`${styles.primaryButton} button button--lg`}
        to="/docs/intro"
      >
        📖 Documentation
      </Link>

      <Link
        className={`${styles.secondaryButton} button button--lg`}
        to="/docs/architecture"
      >
        🗺️ Architecture
      </Link>

    </div>
  );
}