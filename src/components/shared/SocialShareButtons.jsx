import React from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Twitter, Facebook, Linkedin, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function SocialShareButtons({ title, url }) {
  const { config } = useSiteConfig();
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title || "");

  const links = [
    {
      label: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:bg-sky-500 hover:text-white",
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-600 hover:text-white",
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      color: "hover:bg-blue-700 hover:text-white",
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground font-medium mr-1">Share:</span>
      {links.map(({ label, icon: Icon, href, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${label}`}
          className={`p-2 rounded-lg border border-border transition-colors ${color}`}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
      <button
        onClick={handleNativeShare}
        className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
        title="Share / Copy link"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}