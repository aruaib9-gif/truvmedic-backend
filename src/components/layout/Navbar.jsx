import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, ChevronDown, AlertTriangle, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useAuth } from "@/lib/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { 
    label: "Services", path: "/services",
    children: [
      { label: "Medical Outsourcing", path: "/services#outsourcing" },
      { label: "Offshore Medics", path: "/services#offshore" },
      { label: "Clinic Setup", path: "/services#clinic" },
      { label: "Telemedicine", path: "/services#telemedicine" },
      { label: "Emergency Support", path: "/services#emergency" },
      { label: "Occupational Health", path: "/services#occupational" },
    ]
  },
  { label: "Industries", path: "/industries" },
  { label: "Technology", path: "/technology" },
  { label: "Careers", path: "/careers" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const location = useLocation();
  const { config } = useSiteConfig();
  const { isAuthenticated, logout, navigateToLogin, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Emergency Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-1.5 px-4 text-sm font-medium relative z-50">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>24/7 Emergency Medical Support:</span>
          <a href={`tel:${config.emergency_phone || "+2348000000000"}`} className="font-bold underline">{config.emergency_phone || "+234 800 000 0000"}</a>
          <span className="hidden sm:inline">|</span>
          <Link to="/emergency" className="font-bold underline hidden sm:inline">Request Emergency Support →</Link>
        </div>
      </div>

      <nav className={`sticky top-0 z-40 w-full transition-all duration-500 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-border" 
          : "bg-white/80 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img 
                src={config.logo_url || "/logo.png"} 
                alt={config.company_name || "TRUV Medical Services"} 
                className="h-12 lg:h-14 object-contain"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div 
                  key={link.path} 
                  className="relative"
                  onMouseEnter={() => link.children && setHoveredMenu(link.label)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <Link
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                      isActive(link.path)
                        ? "text-primary bg-primary/5"
                        : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {link.label}
                    {link.children && <ChevronDown className="w-3.5 h-3.5" />}
                  </Link>
                  
                  <AnimatePresence>
                    {link.children && hoveredMenu === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-border p-2 z-50"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className="block px-4 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <a href={`tel:${config.emergency_phone || "+2348000000000"}`} className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Call Us</span>
                </a>
              </Button>
              {user && ["admin", "recruiter", "manager", "viewer"].includes(user.role) && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />Dashboard
                  </Link>
                </Button>
              )}
              {user && user.role === "user" && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/applicant-dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />My Dashboard
                  </Link>
                </Button>
              )}
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={() => logout()} className="flex items-center gap-2 text-muted-foreground">
                  <LogOut className="w-4 h-4" />Sign Out
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={navigateToLogin} className="flex items-center gap-2 text-muted-foreground">
                  <LogIn className="w-4 h-4" />Staff Login
                </Button>
              )}
              <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" asChild>
                <Link to="/contact">Request Consultation</Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm p-0 flex flex-col">
                <div className="p-5 border-b shrink-0">
                  <img 
                    src={config.logo_url || "/logo.png"} 
                    alt={config.company_name || "TRUV Medical"} 
                    className="h-10 object-contain"
                  />
                </div>
                <div className="flex-1 overflow-y-auto py-2 px-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.path)
                          ? "text-primary bg-primary/5"
                          : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {user && ["admin", "recruiter", "manager", "viewer"].includes(user.role) && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors mt-1 border-t border-border pt-3"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                  {user && user.role === "user" && (
                    <Link
                      to="/applicant-dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors mt-1 border-t border-border pt-3"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>
                  )}
                </div>
                <div className="p-4 border-t space-y-2.5 shrink-0 bg-background">
                  <Button className="w-full" asChild>
                    <Link to="/contact" onClick={() => setMobileOpen(false)}>Request Consultation</Link>
                  </Button>
                  <Button variant="outline" className="w-full border-red-500 text-red-600" asChild>
                    <Link to="/emergency" onClick={() => setMobileOpen(false)}>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Emergency Support
                    </Link>
                  </Button>
                  {isAuthenticated ? (
                    <Button variant="outline" className="w-full" onClick={() => { logout(); setMobileOpen(false); }}>
                      <LogOut className="w-4 h-4 mr-2" />Sign Out
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => { navigateToLogin(); setMobileOpen(false); }}>
                      <LogIn className="w-4 h-4 mr-2" />Staff Login
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  );
}