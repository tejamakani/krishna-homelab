import React from "react";
import styles from "./Hero.module.css";

import AnimatedBackground from "./AnimatedBackground";
import HeroButtons from "./HeroContent/HeroButtons";
import TechnologyPills from "./HeroContent/TechnologyPills";
import HeroHealthPanel from "./HeroHealthPanel";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <AnimatedBackground />

      <div className={styles.container}>
        {/* LEFT COLUMN */}
        <div className={styles.left}>
          <div className={styles.badge}>
            SELF-HOSTED ENGINEERING LAB
          </div>

          <h1 className={styles.title}>
            🏠 Makani's HomeAuto
          </h1>

          <h2 className={styles.subtitle}>
            Engineering the Future of Smart Living.
          </h2>

          <p className={styles.description}>
            A production-inspired HomeLab built using
            <strong> Proxmox VE</strong>,
            <strong> Home Assistant</strong>,
            <strong> Frigate AI</strong>,
            <strong> Coral TPU</strong>, and
            <strong> Enterprise Networking</strong>.
          </p>

          <HeroButtons />
          <TechnologyPills />
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.right}>
          <HeroHealthPanel />
        </div>
      </div>
    </section>
  );
}