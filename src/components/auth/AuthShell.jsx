import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

/** Shared chrome for the sign-in, register, invite and reset screens. */
export default function AuthShell({ title, subtitle, children, footer }) {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Brand panel */}
      <div className="lg:w-5/12 bg-[#0A1628] text-white px-8 py-12 lg:px-14 lg:py-16 flex flex-col justify-between">
        <Link to="/" className="inline-flex items-center gap-3">
          {config.logo_url ? (
            <img src={config.logo_url} alt={config.company_name} className="h-10 object-contain" />
          ) : (
            <span className="font-heading text-xl font-bold">{config.company_name}</span>
          )}
        </Link>

        <div className="hidden lg:block max-w-sm py-16">
          <h2 className="font-heading text-3xl font-bold leading-tight">
            Occupational &amp; offshore healthcare, managed end to end.
          </h2>
          <p className="text-white/60 mt-4 text-sm leading-relaxed">
            Sign in to track your applications, or to manage leads, candidates and
            emergency requests from the admin portal.
          </p>
        </div>

        <p className="text-white/40 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Secured connection · {config.company_name}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
