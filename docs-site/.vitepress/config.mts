import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'VocaFlash',
  description: 'Premium English vocabulary learning with FSRS v5 spaced repetition',

  // Reads markdown from project-root/docs/ — no file duplication
  srcDir: '../docs',

  // Exclude pre-existing docs that are not part of this site
  srcExclude: ['HOOKS.md'],

  base: '/',

  markdown: {
    // Note: Mermaid renders in dev mode. For production build, diagrams
    // display as code blocks and can be enabled once mermaid SSR is stable.
    // mermaid: true,
  },


  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'User Guides', link: '/sop/index' },
      { text: 'Database', link: '/database' },
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Codebase Analysis', link: '/analysis' },
        ],
      },
      {
        text: 'Architecture & Technical',
        items: [
          { text: 'System Architecture', link: '/architecture' },
          { text: 'Database', link: '/database' },
          { text: 'Data Flow', link: '/data-flow' },
          { text: 'Deployment', link: '/deployment' },
        ],
      },
      {
        text: 'User Guides',
        items: [
          { text: 'Overview', link: '/sop/index' },
          { text: 'Getting Started', link: '/sop/getting-started' },
          { text: 'Study Session', link: '/sop/study-session' },
          { text: 'Review Arena', link: '/sop/review-arena' },
          { text: 'Mastery Vault', link: '/sop/mastery-vault' },
          { text: 'Progress & Analytics', link: '/sop/progress' },
          { text: 'Settings', link: '/sop/settings' },
          { text: 'Admin: Word Management', link: '/sop/admin-words' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Kyo93/voca-flash' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Built with DocKit',
      copyright: '© 2026 VocaFlash',
    },

    outline: {
      level: [2, 3],
    },
  },

  appearance: 'dark',

  head: [
    ['meta', { name: 'theme-color', content: '#5b6ee1' }],
    ['meta', { name: 'og:type', content: 'website' }],
  ],

  sitemap: {
    hostname: 'https://docs.voca-flash.com',
  },
})
