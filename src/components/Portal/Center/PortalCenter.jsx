import styles from "../PortalLayout.module.css";

import HeroSection from "./HeroSection";
import PrimaryWorkspace from "./PrimaryWorkspace";
import CapabilityStrip from "./CapabilityStrip";
import ProjectOverview from "./ProjectOverview";

export default function PortalCenter() {
  return (
    <section className={styles.portalCenter}>
      <HeroSection />

      <PrimaryWorkspace />

      <CapabilityStrip />

      <ProjectOverview />
    </section>
  );
}