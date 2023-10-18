// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github")
const darkCodeTheme = require("prism-react-renderer/themes/dracula")
const execSync = require("child_process").execSync

const isProd = process.env.VERCEL_ENV === "production"
const usesPydoc = process.env.USES_PYDOC === "true"

// Automatically fetch the git repo name: on Vercel there is an env
// available, locally it will be extracted from git command
const currentRepoName =
  process.env.CI === undefined
    ? execSync("cd .. && basename `git rev-parse --show-toplevel`")
        .toString()
        .trim()
    : process.env.VERCEL_GIT_REPO_SLUG

// Add new repos to this object and keep the desired order
const allDocsRepos = [
  { name: "nefino_li", displayName: "Get Started" },
  { name: "django", displayName: "Django" },
  { name: "react", displayName: "React" },
  { name: "airflow", displayName: "Airflow" },
]

// We will add the items to the navbar conditionally
const navbarItems = allDocsRepos.reduce((items, repo) => {
  // always add the current repo to the sidebar for local development and preview deployments
  if (repo.name === currentRepoName) {
    items.push({
      to: "/",
      position: "left",
      label: repo.displayName,
    })
  }
  // if not the current repo and is production environment on Vercel, add portal links
  if (isProd && repo.name !== currentRepoName) {
    items.push({
      to: `https://docs.nefino.cc${
        repo.name !== "nefino_li" ? `/${repo.name}` : ""
      }`,
      target: "_self",
      label: repo.displayName,
      position: "left",
    })
  }
  return items
}, [])

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Nefino",
  tagline: "Developer Documentation",
  url: "https://docs.nefino.cc",
  noIndex: true,
  // as nefino_li repo is the base portal repo, change it only in prod for all other repos
  // but also keep it for them if it is not prod for making preview deployments work
  baseUrl:
    isProd && currentRepoName !== "nefino_li" ? `/${currentRepoName}/` : "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "nefino", // Usually your GitHub org/user name.
  projectName: currentRepoName, // Usually your repo name.
  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "../.docs/get-started",
          // Use docs-only mode
          // https://docusaurus.io/docs/docs-introduction#docs-only-mode
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          ...(isProd && {
            editUrl: ({ versionDocsDirPath, docPath }) =>
              `https://github/nefino/${currentRepoName}/src/master/.docs/${versionDocsDirPath}/${docPath}?mode=edit&at=master`,
          }),
          exclude: [
            // we need to exclude underscore files if using pydocs for including private api files
            ...(!usesPydoc ? ["**/_*.{js,jsx,ts,tsx,md,mdx}", "**/_*/**"] : []),
            // exclude double underscore prefixed files from sidebar
            "**/__*.{js,jsx,ts,tsx,md,mdx}",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__tests__/**",
            "**/static/**",
          ],
          // we use an autogenerated sidebar as defined in sidebar.js
          // as adding the generated sidebar.json from pydoc here would result in conflicts
          // we just rename the autogenerated reference folder to "API Documentation"
          sidebarItemsGenerator: async function ({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args)
            const objIndex = sidebarItems.findIndex(
              (obj) => obj.label === "reference"
            )
            if (objIndex !== -1) {
              sidebarItems[objIndex].label = "API Documentation"
            }
            return sidebarItems
          },
          remarkPlugins: [require('mdx-mermaid')],
        },
        theme: {
        customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],
  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: "django",
        path: "../.docs/django",
        // Use docs-only mode
        // https://docusaurus.io/docs/docs-introduction#docs-only-mode
        routeBasePath: "/django",
        sidebarPath: require.resolve("./sidebars.js"),
        // Please change this to your repo.
        ...(isProd && {
          editUrl: ({ versionDocsDirPath, docPath }) =>
            `https://github/nefino/${currentRepoName}/src/master/.docs/${versionDocsDirPath}/${docPath}?mode=edit&at=master`,
        }),
        exclude: [
          // we need to exclude underscore files if using pydocs for including private api files
          ...(!usesPydoc ? ["**/_*.{js,jsx,ts,tsx,md,mdx}", "**/_*/**"] : []),
          // exclude double underscore prefixed files from sidebar
          "**/__*.{js,jsx,ts,tsx,md,mdx}",
          "**/*.test.{js,jsx,ts,tsx}",
          "**/__tests__/**",
          "**/static/**",
        ],
        // we use an autogenerated sidebar as defined in sidebar.js
        // as adding the generated sidebar.json from pydoc here would result in conflicts
        // we just rename the autogenerated reference folder to "API Documentation"
        sidebarItemsGenerator: async function ({
          defaultSidebarItemsGenerator,
          ...args
        }) {
          const sidebarItems = await defaultSidebarItemsGenerator(args)
          const objIndex = sidebarItems.findIndex(
            (obj) => obj.label === "reference"
          )
          if (objIndex !== -1) {
            sidebarItems[objIndex].label = "API Documentation"
          }
          return sidebarItems
        },
        remarkPlugins: [require('mdx-mermaid')],
      }),
    ],
  ],
  
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark'},
      navbar: {
        hideOnScroll: true,
        title: "Nefino",
        logo: {
          alt: "Nefino Logo",
          src: "img/logo.svg",
          href: isProd ? "https://docs.nefino.cc" : "/",
          target: "_self",
        },
        items: [
          ...navbarItems,
          {
            href: "https://github.com/nefino",
            position: "right",
            className: "navbar-item-github",
            "aria-label": "GitHub repository",
          },
        ],
      },
      prism: {
        defaultLanguage: 'js',
        additionalLanguages: ['dart'],
        plugins: ['line-numbers', 'show-language'],
        theme: require('@kiwicopple/prism-react-renderer/themes/vsDark'),
        darkTheme: require('@kiwicopple/prism-react-renderer/themes/vsDark'),
      },
      footer: {
        copyright: `Copyright © ${new Date().getFullYear()} Nefino. Built with Docusaurus.`,
      },
    }),
}

module.exports = config
