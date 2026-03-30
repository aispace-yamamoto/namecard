import withSerwistInit from "@serwist/next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "namecard";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: !isProd,
});

export default withSerwist({
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
});
