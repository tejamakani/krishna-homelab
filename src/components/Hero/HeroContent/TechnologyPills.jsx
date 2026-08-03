import styles from "../Hero.module.css";

export default function TechnologyPills() {
  return (
    <div className={styles.technologyPills}>
      <span>Proxmox VE</span>
      <span>Home Assistant</span>
      <span>Frigate AI</span>
      <span>Coral TPU</span>
      <span>Grafana</span>
      <span>InfluxDB</span>
      <span>Docker</span>
      <span>MQTT</span>
      <span>Cisco</span>
    </div>
  );
}