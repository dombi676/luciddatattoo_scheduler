/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // Environment variables for client-side
    TIMEZONE: process.env.TIMEZONE || 'America/Argentina/Jujuy',
    JWT_SECRET: process.env.JWT_SECRET,
  },
  
  async redirects() {
    return [
      // Redirect old booking paths to new structure
      {
        source: '/book/:id',
        destination: '/turnos/:id',
        permanent: true,
      },
    ]
  },
  
  async rewrites() {
    return [
      // Rewrite /turnos to booking pages (cleaner URLs for clients)
      {
        source: '/turnos/:id',
        destination: '/book/:id',
      },
    ]
  },
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
