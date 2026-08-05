import Link from "@docusaurus/Link";
import styles from "../Hero.module.css";

export default function HeroButtons() {
  return (
    <div className={styles.heroButtons}>
      <Link
        className={`button button--lg ${styles.primaryButton}`}
        to="/docs/engineering-foundation"
      >
        📖 Documentation
      </Link>

      <Link
        className={`button button--lg ${styles.secondaryButton}`}
        to="/docs/architecture"
      >
        🏗 Architecture
      </Link>
    </div>
  );
}