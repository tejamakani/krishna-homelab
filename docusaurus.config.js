// @ts-check

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Makani's Home-Lab",
  tagline: 'Engineering a Smarter Home, One Service at a Time.',

  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://tejamakani.github.io',
  baseUrl: '/krishna-homelab/',

  organizationName: 'tejamakani',
  projectName: 'krishna-homelab',

  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
  defaultLocale: 'en',
  locales: ['en'],
  },

// Enable Mermaid diagrams
  markdown: {
    mermaid: true,
  },

// Load Mermaid theme
themes: ['@docusaurus/theme-mermaid'],

presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/tejamakani/krishna-homelab/edit/main/',
        },

        blog: false,

        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',

    colorMode: {
      respectPrefersColorScheme: true,
    },

    // Mermaid automatically follows the website color mode.
    mermaid: {
      theme: {
        light: 'neutral',
      dark: 'dark',
    },
  },
    navbar: {
      title: "Makani's Home-Lab",

      logo: {
        alt: "Makani's Home-Lab",
        src: 'img/logo.svg',
      },

      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          label: 'Documentation',
          position: 'left',
        },

        {
          to: '/docs/architecture',
          label: 'Architecture',
          position: 'left',
        },

        {
          href: 'https://github.com/tejamakani/krishna-homelab',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'dark',

      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'HomeLab Guide',
              to: '/docs',
            },
          ],
        },

        {
          title: 'Technologies',
          items: [
            {
              label: 'Proxmox',
              to: '/docs/proxmox/install',
            },
            {
              label: 'Home Assistant',
              to: '/docs/homeassistant/installation',
            },
            {
              label: 'Frigate AI',
              to: '/docs/frigate/installation',
            },
          ],
        },

        {
          title: 'Source Code',
          items: [
            {
              label: 'GitHub Repository',
              href: 'https://github.com/tejamakani/krishna-homelab',
            },
          ],
        },
      ],

      copyright: `© ${new Date().getFullYear()} Makani's Home-Lab`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;