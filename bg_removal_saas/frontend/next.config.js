/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 'your-supabase-id.supabase.co', 'images.unsplash.com'],
    },
    transpilePackages: ['@splinetool/react-spline'],
};

module.exports = nextConfig;
