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
      label: '🖥 Proxmox',
      items: [
        'proxmox/install',
        'proxmox/networking',
      ],
    },
    {
      type: 'category',
      label: '🏡 Home Assistant',
      items: [
        'homeassistant/install',
      ],
    },
    {
      type: 'category',
      label: '🎥 Frigate AI',
      items: [
        'frigate/install',
      ],
    },
    {
      type: 'category',
      label: '🌐 Networking',
      items: [
        'network/design',
      ],
    },
  ],
};

export default sidebars;