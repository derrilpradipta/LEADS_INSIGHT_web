import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: "postgresql://neondb_owner:npg_2rcVDjs9PKBQ@ep-wild-mouse-aoxdjpeh-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  },
}

export default nextConfig