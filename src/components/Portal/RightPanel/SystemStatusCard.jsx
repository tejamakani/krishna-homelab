import {
  Home,
  Cctv,
  Server,
  Box,
  RadioTower,
} from "lucide-react";

import styles from "./PortalRightPanel.module.css";
import StatusBadge from "./StatusBadge";

const services = [
  {
    label: "Home Assistant",
    status: "Online",
    icon: Home,
    color: "#22c55e",
  },
  {
    label: "Frigate AI",
    status: "Running",
    icon: Cctv,
    color: "#22c55e",
  },
  {
    label: "Proxmox VE",
    status: "Healthy",
    icon: Server,
    color: "#22c55e",
  },
  {
    label: "Docker Services",
    status: "Running",
    icon: Box,
    color: "#22c55e",
  },
  {
    label: "MQTT Broker",
    status: "Connected",
    icon: RadioTower,
    color: "#22c55e",
  },
];

export default function SystemStatusCard() {
  return (
    <section className={styles.panelCard}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>
            LIVE PLATFORM
          </span>

          <h3>System Status</h3>
        </div>

        <span className={styles.operationalBadge}>
          All Systems Operational
        </span>
      </div>

      <div className={styles.statusList}>
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <div
              key={service.label}
              className={styles.statusService}
            >
              <div className={styles.statusIcon}>
                <Icon size={18} strokeWidth={1.8} />
              </div>

              <div className={styles.statusContent}>
                <StatusBadge
                  label={service.label}
                  status={service.status}
                  color={service.color}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}