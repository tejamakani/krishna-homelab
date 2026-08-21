export const labMetrics = [
  {
    id: "lab-ubuntu",
    environment: "LAB ENVIRONMENT",
    title: "Ubuntu VM",
    subtitle: "Ubuntu 24.04 LTS",
    summary: "Running",
    status: "Healthy",
    statusColor: "#22c55e",

    sections: [
      {
        title: "SYSTEM",
        type: "metrics",
        items: [
          { label: "vCPU", value: "4" },
          { label: "Memory", value: "8 GB" },
          { label: "Storage", value: "80 GB" },
          { label: "Uptime", value: "2d 14h" },
        ],
      },

      {
        title: "RESOURCE UTILIZATION",
        type: "progress",
        items: [
          { label: "CPU", value: 24 },
          { label: "Memory", value: 46 },
          { label: "Storage", value: 38 },
        ],
      },

      {
        title: "SERVICES",
        type: "status",
        items: [
          {
            label: "Docker Engine",
            value: "Running",
            color: "#22c55e",
          },
          {
            label: "Portainer",
            value: "Online",
            color: "#22c55e",
          },
          {
            label: "Dozzle",
            value: "Online",
            color: "#22c55e",
          },
          {
            label: "MQTT",
            value: "Connected",
            color: "#22c55e",
          },
        ],
      },
    ],
  },

  {
    id: "lab-docker",
    title: "Docker",
    summary: "8 / 8 Running",
    status: "Healthy",
    statusColor: "#22c55e",
    details: [
      { label: "Containers", value: "8" },
      { label: "Healthy", value: "8" },
      { label: "Restarting", value: "0" },
      { label: "Images", value: "14" },
    ],
  },

  {
    id: "lab-homeassistant",
    title: "Home Assistant",
    summary: "Online",
    status: "Healthy",
    statusColor: "#22c55e",
    details: [
      { label: "Automations", value: "32" },
      { label: "Devices", value: "18" },
      { label: "Entities", value: "240" },
      { label: "Uptime", value: "2d 13h" },
    ],
  },

  {
    id: "lab-frigate",
    title: "Frigate",
    summary: "4 Cameras",
    status: "Running",
    statusColor: "#22c55e",
    details: [
      { label: "Cameras", value: "4" },
      { label: "Recording", value: "Active" },
      { label: "Detection", value: "Enabled" },
      { label: "Coral TPU", value: "Planned" },
    ],
  },

  {
    id: "lab-mqtt",
    title: "MQTT",
    summary: "Connected",
    status: "Healthy",
    statusColor: "#22c55e",
    details: [
      { label: "Broker", value: "Mosquitto" },
      { label: "Port", value: "1883" },
      { label: "WebSocket", value: "9001" },
      { label: "Clients", value: "6" },
    ],
  },
];