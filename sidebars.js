const sidebars = {
  tutorialSidebar: [
    "intro",

    // ==========================================
    // Part I — HomeLab
    // ==========================================
    {
      type: "category",
      label: "🧪 Lab Setup",
      collapsed: false,
      link: {
        type: "generated-index",
        title: "Part I — HomeLab",
        description:
          "Design, build, test, and validate the Makani HomeAuto development environment.",
        slug: "/homelab",
      },

      items: [
        {
          type: "doc",
          id: "homelab/purpose",
          label: "01 · Purpose",
        },

        {
          type: "doc",
          id: "homelab/architecture",
          label: "02 · Architecture",
        },

        {
          type: "category",
          label: "03 · Implementation",
          collapsed: false,

          items: [
            {
              type: "doc",
              id: "homelab/implementation/overview",
              label: "Overview",
            },

            {
              type: "doc",
              id: "homelab/implementation/windows-host",
              label: "Windows Host",
            },

            {
              type: "doc",
              id: "homelab/implementation/ubuntu-vm",
              label: "Ubuntu VM",
            },

            {
              type: "doc",
              id: "homelab/implementation/docker",
              label: "Docker",
            },

            {
              type: "doc",
              id: "homelab/implementation/service-management",
              label: "Service Management",
            },

            {
              type: "doc",
              id: "homelab/implementation/portainer",
              label: "Portainer",
            },

            {
              type: "doc",
              id: "homelab/implementation/dozzle",
              label: "Dozzle",
            },

            {
              type: "doc",
              id: "homelab/implementation/mqtt",
              label: "Mosquitto MQTT",
            },

            {
              type: "doc",
              id: "homelab/implementation/frigate",
              label: "Frigate AI",
            },

            {
              type: "doc",
              id: "homelab/implementation/cameras",
              label: "Camera Integration",
            },

            {
              type: "doc",
              id: "homelab/implementation/object-detection",
              label: "Object Detection",
            },

            {
              type: "doc",
              id: "homelab/implementation/face-recognition",
              label: "Face Recognition",
            },

            {
              type: "doc",
              id: "homelab/implementation/lpr",
              label: "License Plate Recognition",
            },

            {
              type: "doc",
              id: "homelab/implementation/home-assistant",
              label: "Home Assistant",
            },

            {
              type: "doc",
              id: "homelab/implementation/alexa-integration",
              label: "Alexa Integration",
            },
          ],
        },

        {
          type: "doc",
          id: "homelab/challenges",
          label: "04 · Challenges Faced",
        },
      ],
    },

    // ==========================================
    // Part II — Production
    // ==========================================
    {
      type: "category",
      label: "▣ Production",
      collapsed: false,
      link: {
        type: "generated-index",
        title: "Part II — Production",
        description:
          "Design and deploy the production Makani HomeAuto infrastructure.",
        slug: "/production",
      },

      items: [
        {
          type: "doc",
          id: "production/purpose",
          label: "01 · Purpose",
        },

        {
          type: "doc",
          id: "production/architecture",
          label: "02 · Architecture",
        },

        {
          type: "category",
          label: "03 · Implementation",
          collapsed: true,

          items: [
            {
              type: "doc",
              id: "production/implementation/overview",
              label: "Overview",
            },

            {
              type: "doc",
              id: "production/implementation/bare-metal",
              label: "Bare Metal",
            },

            {
              type: "doc",
              id: "production/implementation/proxmox",
              label: "Proxmox VE",
            },

            {
              type: "doc",
              id: "production/implementation/networking",
              label: "Networking",
            },

            {
              type: "doc",
              id: "production/implementation/storage",
              label: "Storage",
            },

            {
              type: "doc",
              id: "production/implementation/vm-provisioning",
              label: "VM Provisioning",
            },

            {
              type: "doc",
              id: "production/implementation/home-assistant",
              label: "Home Assistant",
            },

            {
              type: "doc",
              id: "production/implementation/mqtt",
              label: "Mosquitto MQTT",
            },

            {
              type: "doc",
              id: "production/implementation/frigate",
              label: "Frigate AI",
            },

            {
              type: "doc",
              id: "production/implementation/monitoring",
              label: "Monitoring",
            },

            {
              type: "doc",
              id: "production/implementation/backup",
              label: "Backup & Recovery",
            },

            {
              type: "doc",
              id: "production/implementation/remote-access",
              label: "Remote Access",
            },
          ],
        },

        {
          type: "doc",
          id: "production/challenges",
          label: "04 · Challenges Faced",
        },
      ],
    },
  ],
};

export default sidebars;