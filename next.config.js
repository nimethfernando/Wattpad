/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'wattpad-sigma.vercel.app',
          },
        ],
        destination: 'https://www.avoralibrary.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'avoralibrary.vercel.app',
          },
        ],
        destination: 'https://www.avoralibrary.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
