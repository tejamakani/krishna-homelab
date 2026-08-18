import Link from "@docusaurus/Link";
import {
  House,
  FlaskConical,
  Server,
  ChevronRight,
  ExternalLink,
  Code2,
} from "lucide-react";

import styles from "../PortalLayout.module.css";

export default function PortalSidebar() {
  return (
    <aside className={styles.portalSidebar}>
      <Link className={styles.aboutCard} to="/docs">
        <House size={21} strokeWidth={1.8} />
        <span>About Makani HomeAuto</span>
      </Link>

      <details className={styles.sidebarGroup} open>
        <summary>
          <span className={styles.sidebarGroupTitle}>
            <FlaskConical size={18} strokeWidth={1.8} />
            Lab Setup
          </span>
        </summary>

        <div className={styles.architectureLinks}>
          <Link to="/docs/homelab/purpose">
            01 · Purpose
          </Link>

          <Link to="/docs/homelab/architecture">
            02 · Architecture
          </Link>

          <Link to="/docs/homelab/implementation/overview">
            03 · Implementation
          </Link>

          <Link to="/docs/homelab/challenges">
            04 · Challenges Faced
          </Link>
        </div>
      </details>

      <details className={styles.sidebarGroup} open>
        <summary>
          <span className={styles.sidebarGroupTitle}>
            <Server size={18} strokeWidth={1.8} />
            Production
          </span>
        </summary>

        <div className={styles.architectureLinks}>
          <Link to="/docs/production/purpose">
            01 · Purpose
          </Link>

          <Link to="/docs/production/architecture">
            02 · Architecture
          </Link>

          <Link to="/docs/production/implementation/overview">
            03 · Implementation
          </Link>

          <Link to="/docs/production/challenges">
            04 · Challenges Faced
          </Link>
        </div>
      </details>

      <a
        className={styles.githubCard}
        href="https://github.com/tejamakani/krishna-homelab"
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.githubIcon}>
          <Code2 size={21} strokeWidth={1.8} />
        </div>

        <div className={styles.githubContent}>
          <strong>GitHub Repository</strong>
          <span>tejamakani/krishna-homelab</span>
        </div>

        <ExternalLink
          className={styles.githubExternal}
          size={15}
        />
      </a>
    </aside>
  );
}