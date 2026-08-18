import Link from "@docusaurus/Link";
import {
  BookOpen,
  FlaskConical,
  Server,
  ArrowRight,
} from "lucide-react";

import styles from "../PortalLayout.module.css";

export default function DocumentationCard() {
  return (
    <article className={styles.primaryPortalCard}>
      <div className={styles.primaryCardHeader}>
        <div className={styles.primaryCardIcon}>
          <BookOpen size={24} strokeWidth={1.8} />
        </div>

        <div>
          <span className={styles.primaryCardEyebrow}>
            ENGINEERING KNOWLEDGE BASE
          </span>

          <h2>Documentation</h2>
        </div>
      </div>

      <p className={styles.primaryCardDescription}>
        Follow the architecture, implementation journey, validation
        process, and engineering challenges across both HomeLab and
        Production environments.
      </p>

      <div className={styles.documentationEnvironments}>
        <div className={styles.documentationEnvironment}>
          <div className={styles.documentationEnvironmentTitle}>
            <FlaskConical size={18} strokeWidth={1.8} />
            <strong>Lab Setup</strong>
          </div>

          <Link to="/docs/homelab/purpose">
            Purpose
          </Link>

          <Link to="/docs/homelab/architecture">
            Architecture
          </Link>

          <Link to="/docs/homelab/implementation/overview">
            Implementation
          </Link>

          <Link to="/docs/homelab/challenges">
            Challenges Faced
          </Link>
        </div>

        <div className={styles.documentationEnvironment}>
          <div className={styles.documentationEnvironmentTitle}>
            <Server size={18} strokeWidth={1.8} />
            <strong>Production</strong>
          </div>

          <Link to="/docs/production/purpose">
            Purpose
          </Link>

          <Link to="/docs/production/architecture">
            Architecture
          </Link>

          <Link to="/docs/production/implementation/overview">
            Implementation
          </Link>

          <Link to="/docs/production/challenges">
            Challenges Faced
          </Link>
        </div>
      </div>

      <Link
        className={styles.primaryCardAction}
        to="/docs"
      >
        Explore Documentation
        <ArrowRight size={17} strokeWidth={1.8} />
      </Link>
    </article>
  );
}