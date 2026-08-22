const HEALTHY = "#22c55e";
const WARNING = "#f59e0b";
const OFFLINE = "#ef4444";
const UNKNOWN = "#94a3b8";

function normalizeStatus(status) {
  return String(status || "unknown").toLowerCase();
}

function statusColor(status) {
  const normalized = normalizeStatus(status);

  if (
    normalized === "healthy" ||
    normalized === "running" ||
    normalized === "online" ||
    normalized === "connected"
  ) {
    return HEALTHY;
  }

  if (
    normalized === "degraded" ||
    normalized === "stale"
  ) {
    return WARNING;
  }

  if (
    normalized === "offline" ||
    normalized === "failed"
  ) {
    return OFFLINE;
  }

  return UNKNOWN;
}

function displayStatus(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "healthy") {
    return "Healthy";
  }

  if (normalized === "running") {
    return "Running";
  }

  if (normalized === "online") {
    return "Online";
  }

  if (normalized === "connected") {
    return "Connected";
  }

  if (normalized === "degraded") {
    return "Degraded";
  }

  if (normalized === "offline") {
    return "Offline";
  }

  return "Unknown";
}

function formatUptime(seconds = 0) {
  const total = Number(seconds);

  if (!Number.isFinite(total) || total <= 0) {
    return "Unknown";
  }

  const days = Math.floor(total / 86400);

  const hours = Math.floor(
    (total % 86400) / 3600
  );

  const minutes = Math.floor(
    (total % 3600) / 60
  );

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function roundMetric(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(number * 10) / 10;
}

export function buildLabMetrics(telemetry) {
  if (!telemetry) {
    return [];
  }

  const host = telemetry.host || {};
  const docker = telemetry.docker || {};
  const services = telemetry.services || {};

  const homeassistant =
    services.homeassistant || {};

  const frigate =
    services.frigate || {};

  const mqtt =
    services.mqtt || {};

  const portainer =
    services.portainer || {};

  const dozzle =
    services.dozzle || {};

  const running =
    Number(docker.running || 0);

  const total =
    Number(docker.total || 0);

  const stopped =
    Math.max(total - running, 0);

  return [
    {
      id: "lab-ubuntu",

      environment: "LAB ENVIRONMENT",

      title: "Ubuntu VM",

      subtitle:
        host.name || "Ubuntu-Frigate",

      summary: "Running",

      status: displayStatus(host.status),

      statusColor:
        statusColor(host.status),

      telemetry: true,

      freshness:
        telemetry.freshness,

      ageSeconds:
        telemetry.age_seconds,

      sections: [
        {
          title: "RESOURCE UTILIZATION",

          type: "progress",

          items: [
            {
              label: "CPU",
              value: roundMetric(
                host.cpu_percent
              ),
            },

            {
              label: "Memory",
              value: roundMetric(
                host.memory_percent
              ),
            },

            {
              label: "Storage",
              value: roundMetric(
                host.disk_percent
              ),
            },
          ],
        },

        {
          title: "SYSTEM",

          type: "metrics",

          items: [
            {
              label: "Hostname",
              value:
                host.name ||
                "Ubuntu-Frigate",
            },

            {
              label: "Docker",
              value:
                `${running} / ${total} Running`,
            },

            {
              label: "Uptime",
              value:
                formatUptime(
                  host.uptime_seconds
                ),
            },
          ],
        },

        {
          title: "SERVICES",

          type: "status",

          items: [
            {
              label: "Docker Engine",
              value:
                displayStatus(
                  docker.status
                ),

              color:
                statusColor(
                  docker.status
                ),
            },

            {
              label: "Portainer",
              value:
                displayStatus(
                  portainer.status
                ),

              color:
                statusColor(
                  portainer.status
                ),
            },

            {
              label: "Dozzle",
              value:
                displayStatus(
                  dozzle.status
                ),

              color:
                statusColor(
                  dozzle.status
                ),
            },

            {
              label: "MQTT",
              value:
                displayStatus(
                  mqtt.status
                ),

              color:
                statusColor(
                  mqtt.status
                ),
            },
          ],
        },
      ],
    },

    {
      id: "lab-docker",

      environment: "LAB ENVIRONMENT",

      title: "Docker",

      summary:
        `${running} / ${total} Running`,

      status:
        displayStatus(
          docker.status
        ),

      statusColor:
        statusColor(
          docker.status
        ),

      telemetry: true,

      freshness:
        telemetry.freshness,

      ageSeconds:
        telemetry.age_seconds,

      sections: [
        {
          title: "DETAILS",

          type: "metrics",

          items: [
            {
              label: "Running",
              value: running,
            },

            {
              label: "Total",
              value: total,
            },

            {
              label: "Stopped",
              value: stopped,
            },
          ],
        },
      ],
    },

    {
      id: "lab-homeassistant",

      environment: "LAB ENVIRONMENT",

      title: "Home Assistant",

      summary:
        normalizeStatus(
          homeassistant.status
        ) === "healthy"
          ? "Online"
          : displayStatus(
              homeassistant.status
            ),

      status:
        displayStatus(
          homeassistant.status
        ),

      statusColor:
        statusColor(
          homeassistant.status
        ),

      telemetry: true,

      freshness:
        telemetry.freshness,

      ageSeconds:
        telemetry.age_seconds,

      sections: [
        {
          title: "SERVICE",

          type: "status",

          items: [
            {
              label: "Home Assistant",
              value:
                displayStatus(
                  homeassistant.status
                ),

              color:
                statusColor(
                  homeassistant.status
                ),
            },
          ],
        },
      ],
    },

    {
      id: "lab-frigate",

      environment: "LAB ENVIRONMENT",

      title: "Frigate",

      summary:
        `${Number(
          frigate.cameras || 0
        )} ${
          Number(
            frigate.cameras || 0
          ) === 1
            ? "Camera"
            : "Cameras"
        }`,

      status:
        displayStatus(
          frigate.status
        ),

      statusColor:
        statusColor(
          frigate.status
        ),

      telemetry: true,

      freshness:
        telemetry.freshness,

      ageSeconds:
        telemetry.age_seconds,

      sections: [
        {
          title: "DETAILS",

          type: "metrics",

          items: [
            {
              label: "Cameras",
              value:
                Number(
                  frigate.cameras || 0
                ),
            },
          ],
        },

        {
          title: "SERVICE",

          type: "status",

          items: [
            {
              label: "Frigate",
              value:
                displayStatus(
                  frigate.status
                ),

              color:
                statusColor(
                  frigate.status
                ),
            },
          ],
        },
      ],
    },

    {
      id: "lab-mqtt",

      environment: "LAB ENVIRONMENT",

      title: "MQTT",

      summary:
        normalizeStatus(
          mqtt.status
        ) === "healthy"
          ? "Connected"
          : displayStatus(
              mqtt.status
            ),

      status:
        displayStatus(
          mqtt.status
        ),

      statusColor:
        statusColor(
          mqtt.status
        ),

      telemetry: true,

      freshness:
        telemetry.freshness,

      ageSeconds:
        telemetry.age_seconds,

      sections: [
        {
          title: "SERVICE",

          type: "status",

          items: [
            {
              label: "Mosquitto MQTT",
              value:
                displayStatus(
                  mqtt.status
                ),

              color:
                statusColor(
                  mqtt.status
                ),
            },
          ],
        },
      ],
    },

    {
      id: "lab-resources",

      environment: "LAB ENVIRONMENT",

      title: "Host Resources",

      summary:
        `CPU ${roundMetric(
          host.cpu_percent
        )}%`,

      status:
        displayStatus(
          host.status
        ),

      statusColor:
        statusColor(
          host.status
        ),

      telemetry: true,

      freshness:
        telemetry.freshness,

      ageSeconds:
        telemetry.age_seconds,

      sections: [
        {
          title: "RESOURCE UTILIZATION",

          type: "progress",

          items: [
            {
              label: "CPU",
              value:
                roundMetric(
                  host.cpu_percent
                ),
            },

            {
              label: "Memory",
              value:
                roundMetric(
                  host.memory_percent
                ),
            },

            {
              label: "Storage",
              value:
                roundMetric(
                  host.disk_percent
                ),
            },
          ],
        },

        {
          title: "SYSTEM",

          type: "metrics",

          items: [
            {
              label: "Uptime",
              value:
                formatUptime(
                  host.uptime_seconds
                ),
            },

            {
              label: "Containers",
              value:
                `${running} / ${total}`,
            },
          ],
        },
      ],
    },
  ];
}