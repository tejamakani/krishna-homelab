// @ts-check

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Makani's HomeAuto",

  tagline:
    'Enterprise Smart Home Infrastructure • AI Surveillance • Automation',

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

  markdown: {
    mermaid: true,
  },

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

    mermaid: {
      theme: {
        light: 'neutral',
        dark: 'dark',
      },
    },

    navbar: {
      title: '',

      logo: {
        alt: "Makani's HomeAuto",
        src: 'img/branding/homeauto-horizontal.png',
      },

      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          label: 'Docs',
          position: 'left',
        },
        {
          to: '/docs/architecture',
          label: 'Architecture',
          position: 'left',
        },
        {
          to: '/docs',
          label: 'Lab Setup',
          position: 'left',
        },
        {
          to: '/docs',
          label: 'Production Setup',
          position: 'left',
        },
        {
          to: '/docs',
          label: 'Integrations',
          position: 'left',
        },
        {
          to: '/docs',
          label: 'Projects',
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
              label: 'HomeAuto Guide',
              to: '/docs',
            },
          ],
        },
        {
          title: 'Technologies',
          items: [
            {
              label: 'Proxmox',
              to: '/docs',
            },
            {
              label: 'Home Assistant',
              to: '/docs',
            },
            {
              label: 'Frigate AI',
              to: '/docs',
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

      copyright: `© ${new Date().getFullYear()} Makani's HomeAuto`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;