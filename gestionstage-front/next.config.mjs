import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'http',  hostname: 'localhost', port: '8000' },
      { protocol: 'https', hostname: 'localhost', port: '8000' },
    ],
  },
  webpack(config) {
    config.externals = config.externals || [];
    return config;
  },
};

export default withPWA(nextConfig);
