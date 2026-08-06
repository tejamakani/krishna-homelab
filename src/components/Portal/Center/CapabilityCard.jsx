import styles from "../PortalLayout.module.css";

export default function CapabilityCard({
  icon: Icon,
  title,
  description,
  accentClass,
}) {
  return (
    <article className={styles.capabilityCard}>
      <div className={`${styles.capabilityIcon} ${styles[accentClass]}`}>
        <Icon size={42} strokeWidth={1.8} />
      </div>

      <h3 className={styles[accentClass]}>
        {title}
      </h3>

      <p>{description}</p>
    </article>
  );
}