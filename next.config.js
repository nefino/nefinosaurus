/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/django/:path*",
        has: [
          {
            type: "host",
            value: "docs.nefino.cc",
          },
        ],
        destination: "https://django.docs.nefino.cc/:path*",
      },
      {
        source: "/react/:path*",
        has: [
          {
            type: "host",
            value: "docs.nefino.cc",
          },
        ],
        destination: "https://react.docs.nefino.cc/:path*",
      },
      {
        source: "/airflow/:path*",
        has: [
          {
            type: "host",
            value: "docs.nefino.cc",
          },
        ],
        destination: "https://airflow.docs.nefino.cc/:path*",
      },
      {
        source: "/(.*)",
        destination: "/index.html",
      },
    ]
  },
}

module.exports = nextConfig
