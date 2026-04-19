import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PawPrint, Home, Search, Plus, User, Shield, Menu, X, LogOut, Coins, Navigation } from "lucide-react";
import FlashAlertBanner from "@/components/flash/FlashAlertBanner";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LanguageProvider, useLang } from "@/components/i18n/LanguageContext";
import UserCreditsWidget from "@/components/pricing/UserCreditsWidget";

function LanguageSwitcher() {
  const { lang, switchLang } = useLang();
  return (
    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
      {[{ code: "en", label: "EN" }, { code: "fr", label: "FR" }, { code: "he", label: "עב" }].map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLang(code)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            lang === code ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AppLayout({ children, currentPageName }) {
  const { t, isRTL, lang } = useLang();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {}
    );
  }, []);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setIsAdmin(u?.role === "admin");
    }).catch(() => {});
  }, []);

  const navItems = [
    { labelKey: "home", page: "Home", icon: Home },
    { labelKey: "ads", page: "Ads", icon: Search },
    { labelKey: "publish", page: "CreateAd", icon: Plus },
    { labelKey: "myAds", page: "MyAds", icon: User },
    { labelKey: "pricing", page: "Pricing", icon: Coins },
    { labelKey: "liveTracking", page: "LiveTracking", icon: Navigation },
  ];

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 hidden sm:block">
              Pet<span className="text-orange-500">Mate</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.page} to={createPageUrl(item.page)}>
                <Button
                  variant="ghost"
                  className={`rounded-xl text-sm font-medium transition-all ${
                    currentPageName === item.page
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {t(item.labelKey)}
                </Button>
              </Link>
            ))}
            {isAdmin && (
              <Link to={createPageUrl("BackOffice")}>
                <Button
                  variant="ghost"
                  className={`rounded-xl text-sm font-medium ${
                    currentPageName === "BackOffice"
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t("admin")}
                </Button>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user && <UserCreditsWidget userEmail={user.email} lang={lang} />}

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => base44.auth.logout()}
                  className="rounded-xl text-slate-400 hover:text-slate-600"
                  title={t("logout")}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => base44.auth.redirectToLogin()}
                className="hidden md:flex bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm h-9"
              >
                {t("login")}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 space-y-1">
              {navItems.map(item => (
                <Link key={item.page} to={createPageUrl(item.page)} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl text-sm h-12 ${
                      currentPageName === item.page ? "bg-orange-50 text-orange-600" : "text-slate-600"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {t(item.labelKey)}
                  </Button>
                </Link>
              ))}
              {isAdmin && (
                <Link to={createPageUrl("BackOffice")} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-xl text-sm h-12 text-slate-600">
                    <Shield className="w-4 h-4 mr-3" /> {t("admin")}
                  </Button>
                </Link>
              )}
              <div className="border-t border-slate-100 pt-3 mt-3">
                {user ? (
                  <Button variant="ghost" className="w-full justify-start rounded-xl text-sm h-12 text-red-500" onClick={() => base44.auth.logout()}>
                    <LogOut className="w-4 h-4 mr-3" /> {t("logout")}
                  </Button>
                ) : (
                  <Button className="w-full bg-slate-900 rounded-xl h-12" onClick={() => base44.auth.redirectToLogin()}>
                    {t("login")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>
      <FlashAlertBanner userCoords={userCoords} />

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Pet<span className="text-orange-400">Mate</span></span>
          </div>
          <p className="text-slate-400 text-sm max-w-md">{t("footerDesc")}</p>
          <div className="border-t border-slate-800 mt-8 pt-6 text-sm text-slate-500">
            © 2026 PetMate. {t("footerRights")}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <AppLayout currentPageName={currentPageName}>{children}</AppLayout>
    </LanguageProvider>
  );
}