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

            <strong>
              {item.value}
            </strong>
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
        {section.items.map((item) => {
          const value =
            Number(item.value) || 0;

          const safeValue =
            Math.min(
              Math.max(value, 0),
              100
            );

          return (
            <div
              key={item.label}
              className={
                styles.resourceItem
              }
            >
              <div
                className={
                  styles.resourceHeader
                }
              >
                <span>
                  {item.label}
                </span>

                <strong>
                  {value}%
                </strong>
              </div>

              <div
                className={
                  styles.resourceTrack
                }
              >
                <div
                  className={
                    styles.resourceProgress
                  }
                  style={{
                    width:
                      `${safeValue}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusSection({ section }) {
  return (
    <section className={styles.drawerSection}>
      <h4>{section.title}</h4>

      <div
        className={
          styles.drawerServiceList
        }
      >
        {section.items.map((item) => (
          <div
            key={item.label}
            className={
              styles.drawerServiceRow
            }
          >
            <span>
              {item.label}
            </span>

            <strong
              className={
                styles.drawerServiceStatus
              }
              style={{
                color: item.color,
              }}
            >
              <span
                className={
                  styles.drawerStatusDot
                }
                style={{
                  backgroundColor:
                    item.color,
                }}
              />

              {item.value}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function TelemetryNotice({
  freshness,
  ageSeconds,
}) {
  const age =
    Number(ageSeconds) || 0;

  let label = "LIVE TELEMETRY";
  let description =
    `Updated ${age}s ago`;

  if (freshness === "stale") {
    label = "STALE TELEMETRY";

    description =
      `Last update ${age}s ago`;
  }

  if (freshness === "offline") {
    label = "TELEMETRY OFFLINE";

    description =
      `Last update ${age}s ago`;
  }

  return (
    <div className={styles.demoNotice}>
      <span>{label}</span>

      {description}
    </div>
  );
}

export default function DetailPanel({
  widget,
  onClose,
}) {
  if (!widget) {
    return null;
  }

  const legacySections =
    !widget.sections &&
    widget.details
      ? [
          {
            title: "DETAILS",
            type: "metrics",
            items: widget.details,
          },
        ]
      : [];

  const sections =
    widget.sections ||
    legacySections;

  return (
    <div
      className={styles.detailOverlay}
      onClick={onClose}
    >
      <aside
        className={styles.detailDrawer}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div
          className={
            styles.detailHeader
          }
        >
          <div>
            <span
              className={
                styles.drawerEnvironment
              }
            >
              {widget.environment ||
                "PLATFORM DETAILS"}
            </span>

            <h3>
              {widget.title}
            </h3>

            {widget.subtitle && (
              <p
                className={
                  styles.drawerSubtitle
                }
              >
                {widget.subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            className={
              styles.closeButton
            }
            onClick={onClose}
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        <div
          className={
            styles.drawerHealth
          }
        >
          <div>
            <span>STATUS</span>

            <strong>
              {widget.summary}
            </strong>
          </div>

          <div
            className={
              styles.drawerHealthStatus
            }
            style={{
              color:
                widget.statusColor,
            }}
          >
            <span
              className={
                styles.drawerStatusDot
              }
              style={{
                backgroundColor:
                  widget.statusColor,
              }}
            />

            {widget.status}
          </div>
        </div>

        <div
          className={
            styles.drawerSections
          }
        >
          {sections.map((section) => {
            if (
              section.type ===
              "progress"
            ) {
              return (
                <ProgressSection
                  key={section.title}
                  section={section}
                />
              );
            }

            if (
              section.type ===
              "status"
            ) {
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

        {widget.telemetry ? (
          <TelemetryNotice
            freshness={
              widget.freshness
            }
            ageSeconds={
              widget.ageSeconds
            }
          />
        ) : (
          <div
            className={
              styles.demoNotice
            }
          >
            <span>
              STATIC DATA
            </span>

            Production telemetry
            integration pending.
          </div>
        )}
      </aside>
    </div>
  );
}