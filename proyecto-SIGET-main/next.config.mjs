/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:4000'}/:path*`,
      },
    ]
  }
}

export default nextConfig
