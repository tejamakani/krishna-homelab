const sidebars = {
  tutorialSidebar: [
    'intro',

    {
      type: 'category',
      label: '🏠 HomeLab',
      items: [
        'architecture',
        'hardware',
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
      label: '🏡 Home Assistant',
      items: [
        'homeassistant/installation',
        'homeassistant/automations',
        'homeassistant/dashboards',
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