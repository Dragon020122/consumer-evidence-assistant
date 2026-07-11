import type { NextConfig } from "next";
import { contentSecurityPolicy } from "./src/lib/csp";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  async headers() {
    const noStore=[{key:"Cache-Control",value:"private, no-store, max-age=0"}];
    return [{ source: "/(.*)", headers: [
      { key: "Content-Security-Policy", value: contentSecurityPolicy(process.env.NODE_ENV) },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" }
    ] },{source:"/dashboard",headers:noStore},{source:"/cases/:path*",headers:noStore},{source:"/review/:path*",headers:noStore},{source:"/admin/:path*",headers:noStore}];
  }
};

export default nextConfig;
