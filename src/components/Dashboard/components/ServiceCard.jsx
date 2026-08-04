import styles from "../Dashboard.module.css";

import StatusBadge from "./StatusBadge";
import InfoRow from "./InfoRow";
import ProgressBar from "./ProgressBar";
import ActionButton from "./ActionButton";

export default function ServiceCard({
  name,
  logo,
  status,
  version,
  host,
  ip,
  cpu,
  memory,
  memoryPercent,
  stats,
  links,
}) {
  return (
    <div className={styles.serviceCard}>

      <div className={styles.serviceHeader}>

        <div className={styles.serviceInfo}>

          <div className={styles.serviceLogo}>
            {logo}
        </div>

          <h3>{name}</h3>

        </div>

        <StatusBadge status={status} />

      </div>

      <InfoRow
        label="Version"
        value={version}
      />

      <InfoRow
        label="Host"
        value={host}
      />

      <InfoRow
        label="IP"
        value={ip}
      />

      <ProgressBar
        label="CPU"
        value={cpu}
        text={`${cpu}%`}
      />

      <ProgressBar
        label="Memory"
        value={memoryPercent}
        text={memory}
      />

      {stats.map((item) => (
        <InfoRow
          key={item.label}
          label={item.label}
          value={item.value}
        />
      ))}

      <div className={styles.actionButtons}>

        <ActionButton
          label="Dashboard"
          href={links.dashboard}
        />

        <ActionButton
          label="Documentation"
          href={links.docs}
        />

      </div>

    </div>
  );
}