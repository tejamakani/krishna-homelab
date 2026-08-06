import styles from "./PortalLayout.module.css";

export default function RightSidebar() {
  return (
    <aside className={styles.rightSidebar}>
      <h3>System Overview</h3>

      <div className={styles.rightPanel}>
        <span>Home Assistant</span>
        <strong>Online</strong>
      </div>

      <div className={styles.rightPanel}>
        <span>Frigate AI</span>
        <strong>Running</strong>
      </div>

      <div className={styles.rightPanel}>
        <span>MQTT</span>
        <strong>Connected</strong>
      </div>
    </aside>
  );
}