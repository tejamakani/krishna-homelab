const sidebars = {
  tutorialSidebar: [
    'intro',

    {
      type: 'category',
      label: '📘 Part I — Engineering Foundation',
      collapsed: false,
      link: {
        type: 'generated-index',
        title: 'Part I — Engineering Foundation',
        description:
          'Learn the principles, standards, and engineering process behind the Makani Home Lab.',
        slug: '/engineering-foundation',
      },
      items: [
        'playbook/vision',
        'playbook/documentation-philosophy',
        'playbook/engineering-principles',
        'playbook/architecture-standards',
        'playbook/adr-framework',
        'playbook/writing-standards',
        'playbook/verification-standards',
        'playbook/engineering-journal',
        'playbook/release-management',
        'playbook/design-reviews',
        'playbook/engineers-corner',
      ],
    },

    {
      type: 'category',
      label: '💻 Part II — Platform',
      collapsed: false,
      link: {
        type: 'generated-index',
        title: 'Part II — Platform',
        description:
          'Build the operating-system, virtualization, networking, storage, and container foundation.',
        slug: '/platform',
      },
      items: [
        'platform/ubuntu-server',
        'hardware',
      ],
    },

    {
      type: 'category',
      label: '🏗️ Part III — Architecture',
      collapsed: true,
      link: {
        type: 'generated-index',
        title: 'Part III — Architecture',
        description:
          'Explore the end-to-end architecture, service relationships, networks, and data flows.',
        slug: '/architecture-overview',
      },
      items: [
        'architecture/overall-architecture',
        'network/topology',
      ],
    },

    {
      type: 'category',
      label: '🖥️ Proxmox',
      items: [
        'proxmox/install',
        'proxmox/networking',
        'proxmox/backup',
      ],
    },

    {
      type: 'category',
      label: '🎥 Frigate AI',
      items: [
        'frigate/installation',
        'frigate/object-detection',
        'frigate/coral-tpu',
      ],
    },

    {
      type: 'category',
      label: '🏡 Home Assistant',
      items: [
        'homeassistant/installation',
        'homeassistant/automations',
        'homeassistant/dashboards',
      ],
    },

    {
      type: 'category',
      label: '🌐 Networking',
      items: [
        'network/topology',
        'network/vlans',
        'network/firewall',
      ],
    },

    {
      type: 'category',
      label: '🛠️ Troubleshooting',
      items: [
        'troubleshooting/common-issues',
      ],
    },
  ],
};

export default sidebars;