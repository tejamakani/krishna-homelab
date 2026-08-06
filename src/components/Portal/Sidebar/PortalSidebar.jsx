import Link from "@docusaurus/Link";
import {
  House,
  FlaskConical,
  Server,
  Blocks,
  Box,
  FileCode2,
  ExternalLink,
  ChevronRight,
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
        <summary>Part I — Architecture</summary>

        <div className={styles.architectureLinks}>
          <Link to="/docs/architecture">
            01 · Solution Overview
          </Link>

          <Link to="/docs">
            02 · Physical Architecture
          </Link>

          <Link to="/docs">
            03 · Logical Architecture
          </Link>

          <Link to="/docs">
            04 · Network Topology
          </Link>

          <Link to="/docs">
            05 · Service Communication
          </Link>

          <Link to="/docs">
            06 · Data Flow
          </Link>

          <Link to="/docs">
            07 · Security Architecture
          </Link>

          <Link to="/docs">
            08 · Future Roadmap
          </Link>
        </div>
      </details>

      <details className={styles.sidebarGroup} open>
        <summary>Part II — Implementation</summary>

        <div className={styles.majorNavigation}>
          <Link
            className={`${styles.majorNavItem} ${styles.purpleNavItem}`}
            to="/docs"
          >
            <FlaskConical size={20} strokeWidth={1.8} />

            <span>A. Lab Setup</span>

            <ChevronRight
              className={styles.majorNavArrow}
              size={18}
            />
          </Link>

          <Link
            className={`${styles.majorNavItem} ${styles.purpleNavItem}`}
            to="/docs"
          >
            <Server size={20} strokeWidth={1.8} />

            <span>B. Production Setup</span>

            <ChevronRight
              className={styles.majorNavArrow}
              size={18}
            />
          </Link>
        </div>
      </details>

      <nav className={styles.resourceNavigation}>
        <Link
          className={`${styles.majorNavItem} ${styles.greenNavItem}`}
          to="/docs"
        >
          <Blocks size={20} strokeWidth={1.8} />

          <span>Integrations</span>

          <ChevronRight
            className={styles.majorNavArrow}
            size={18}
          />
        </Link>

        <Link
          className={`${styles.majorNavItem} ${styles.cyanNavItem}`}
          to="/docs"
        >
          <Box size={20} strokeWidth={1.8} />

          <span>Projects</span>

          <ChevronRight
            className={styles.majorNavArrow}
            size={18}
          />
        </Link>

        <Link
          className={`${styles.majorNavItem} ${styles.amberNavItem}`}
          to="/docs"
        >
          <FileCode2 size={20} strokeWidth={1.8} />

          <span>Appendix</span>

          <ChevronRight
            className={styles.majorNavArrow}
            size={18}
          />
        </Link>
      </nav>

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