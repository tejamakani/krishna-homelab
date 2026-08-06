import {
  Server,
  Cctv,
  House,
  Network,
} from "lucide-react";

import styles from "../PortalLayout.module.css";
import CapabilityCard from "./CapabilityCard";

const capabilities = [
  {
    icon: Server,
    title: "Self-Hosted",
    description: "Full control over your data and infrastructure.",
    accentClass: "accentBlue",
  },
  {
    icon: Cctv,
    title: "AI Surveillance",
    description: "Frigate AI and Coral TPU for intelligent detection.",
    accentClass: "accentPurple",
  },
  {
    icon: House,
    title: "Home Automation",
    description: "Home Assistant for intelligent automation and control.",
    accentClass: "accentGreen",
  },
  {
    icon: Network,
    title: "Enterprise Ready",
    description: "Scalable architecture with security and reliability.",
    accentClass: "accentCyan",
  },
];

export default function CapabilityGrid() {
  return (
    <div className={styles.capabilityGrid}>
      {capabilities.map((capability) => (
        <CapabilityCard
          key={capability.title}
          {...capability}
        />
      ))}
    </div>
  );
}