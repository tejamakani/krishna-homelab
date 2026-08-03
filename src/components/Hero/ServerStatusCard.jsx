import styles from "./Hero.module.css";
import StatusTile from "./StatusTile";

export default function ServerStatusCard() {

  const services = [
    {
      icon: "🖥",
      title: "Proxmox VE",
      value: 22,
      color: "#38bdf8",
    },
    {
      icon: "🏠",
      title: "Home Assistant",
      value: 31,
      color: "#22c55e",
    },
    {
      icon: "🎥",
      title: "Frigate AI",
      value: 58,
      color: "#f59e0b",
    },
    {
      icon: "🧠",
      title: "Coral TPU",
      value: 81,
      color: "#8b5cf6",
    },
  ];

  return (
    <div className={styles.statusCard}>

      <h3>⚡ LIVE HOMELAB</h3>

      <p className={styles.statusSubtitle}>
        All Services Operational
      </p>

      {services.map((service) => (
        <StatusTile
          key={service.title}
          {...service}
        />
      ))}

    </div>
  );
}