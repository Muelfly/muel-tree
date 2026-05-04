/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow Discord to frame this app
          { key: "X-Frame-Options", value: "ALLOWALL" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://discord.com https://canary.discord.com https://ptb.discord.com *",
          },
          // Skip ngrok browser interstitial warning page
          { key: "ngrok-skip-browser-warning", value: "true" },
        ],
      },
    ];
  },
};

export default nextConfig;
