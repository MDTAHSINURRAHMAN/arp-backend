/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["space-star-aws-bucket.s3.eu-north-1.amazonaws.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "space-star-aws-bucket.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/products/**",
      },
    ],
  },
};

module.exports = nextConfig;
