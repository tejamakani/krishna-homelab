import styles from "./PortalRightPanel.module.css";

function MetricSection({ section }) {
  return (
    <section className={styles.drawerSection}>
      <h4>{section.title}</h4>

      <div className={styles.drawerMetricList}>
        {section.items.map((item) => (
          <div
            key={item.label}
            className={styles.drawerMetricRow}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProgressSection({ section }) {
  return (
    <section className={styles.drawerSection}>
      <h4>{section.title}</h4>

      <div className={styles.resourceList}>
        {section.items.map((item) => (
          <div
            key={item.label}
            className={styles.resourceItem}
          >
            <div className={styles.resourceHeader}>
              <span>{item.label}</span>
              <strong>{item.value}%</strong>
            </div>

            <div className={styles.resourceTrack}>
              <div
                className={styles.resourceProgress}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusSection({ section }) {
  return (
    <section className={styles.drawerSection}>
      <h4>{section.title}</h4>

      <div className={styles.drawerServiceList}>
        {section.items.map((item) => (
          <div
            key={item.label}
            className={styles.drawerServiceRow}
          >
            <span>{item.label}</span>

            <strong
              className={styles.drawerServiceStatus}
              style={{ color: item.color }}
            >
              <span
                className={styles.drawerStatusDot}
                style={{ backgroundColor: item.color }}
              />

              {item.value}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DetailPanel({ widget, onClose }) {
  if (!widget) {
    return null;
  }

  /*
   * Compatibility with the existing widgets.
   * They still use widget.details.
   */
  const legacySections =
    !widget.sections && widget.details
      ? [
          {
            title: "DETAILS",
            type: "metrics",
            items: widget.details,
          },
        ]
      : [];

  const sections = widget.sections || legacySections;

  return (
    <div
      className={styles.detailOverlay}
      onClick={onClose}
    >
      <aside
        className={styles.detailDrawer}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.detailHeader}>
          <div>
            <span className={styles.drawerEnvironment}>
              {widget.environment || "PLATFORM DETAILS"}
            </span>

            <h3>{widget.title}</h3>

            {widget.subtitle && (
              <p className={styles.drawerSubtitle}>
                {widget.subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        <div className={styles.drawerHealth}>
          <div>
            <span>STATUS</span>
            <strong>{widget.summary}</strong>
          </div>

          <div
            className={styles.drawerHealthStatus}
            style={{ color: widget.statusColor }}
          >
            <span
              className={styles.drawerStatusDot}
              style={{
                backgroundColor: widget.statusColor,
              }}
            />

            {widget.status}
          </div>
        </div>

        <div className={styles.drawerSections}>
          {sections.map((section) => {
            if (section.type === "progress") {
              return (
                <ProgressSection
                  key={section.title}
                  section={section}
                />
              );
            }

            if (section.type === "status") {
              return (
                <StatusSection
                  key={section.title}
                  section={section}
                />
              );
            }

            return (
              <MetricSection
                key={section.title}
                section={section}
              />
            );
          })}
        </div>

        <div className={styles.demoNotice}>
          <span>DEMO DATA</span>
          Live telemetry integration will be added in a later phase.
        </div>
      </aside>
    </div>
  );
}