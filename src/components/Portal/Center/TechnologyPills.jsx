import styles from "../PortalLayout.module.css";

const technologies = [
  "Proxmox VE",
  "Docker",
  "Home Assistant",
  "Frigate AI",
  "Coral TPU",
  "MQTT",
  "Grafana",
  "InfluxDB",
  "Tailscale",
  "And More",
];

export default function TechnologyPills() {
  return (
    <div className={styles.technologyPills}>
      {technologies.map((technology) => (
        <span key={technology}>{technology}</span>
      ))}
    </div>
  );
}