/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Empêche le clickjacking (iframes externes)
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le MIME-sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Contrôle les infos envoyées dans le Referer
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive les APIs sensibles inutiles
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Force HTTPS (activé en prod via Vercel, ignoré en HTTP local)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer", "twilio", "canvas"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
