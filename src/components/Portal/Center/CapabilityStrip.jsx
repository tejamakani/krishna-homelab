import {
  Server,
  Cctv,
  House,
  RadioTower,
  Network,
  ShieldCheck,
} from "lucide-react";

import styles from "../PortalLayout.module.css";

const capabilities = [
  {
    icon: Server,
    title: "Self Hosted",
    subtitle: "Linux · Docker · Proxmox",
  },
  {
    icon: Cctv,
    title: "AI Vision",
    subtitle: "Frigate · Detection · LPR",
  },
  {
    icon: House,
    title: "Automation",
    subtitle: "Home Assistant · Alexa",
  },
  {
    icon: RadioTower,
    title: "MQTT / IoT",
    subtitle: "Mosquitto · Messaging",
  },
  {
    icon: Network,
    title: "Networking",
    subtitle: "Secure Connectivity",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    subtitle: "Isolation · Remote Access",
  },
];

export default function CapabilityStrip() {
  return (
    <section className={styles.capabilitySection}>
      <div className={styles.sectionHeading}>
        <span>PLATFORM CAPABILITIES</span>
        <h2>Built as an integrated engineering platform</h2>
      </div>

      <div className={styles.capabilityStrip}>
        {capabilities.map((capability) => {
          const Icon = capability.icon;

          return (
            <div
              key={capability.title}
              className={styles.capabilityMiniCard}
            >
              <div className={styles.capabilityMiniIcon}>
                <Icon size={20} strokeWidth={1.8} />
              </div>

              <div>
                <strong>{capability.title}</strong>
                <span>{capability.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}