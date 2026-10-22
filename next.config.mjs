/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  basePath: '/sagarjayswal.github.io',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: { cpus: 2 },
};
export default config;
