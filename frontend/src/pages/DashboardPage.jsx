import { TrendingUp, ShoppingBag, Music2, ArrowRight, Zap } from "lucide-react";

const QUICK_SEARCHES = [
  "Fidget Spinner", "LED Beleuchtung", "Wireless Earbuds", "Smartwatch",
  "Handytasche", "Yoga Matte", "Reise Organizer", "Mini Drucker",
];

const FEATURES = [
  {
    icon: TrendingUp,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    title: "Google Trends",
    desc: "Analysiere das Suchvolumen und den Trend-Verlauf für jedes Produkt über Zeit.",
    tab: "trends",
  },
  {
    icon: ShoppingBag,
    color: "text-green-400",
    bg: "bg-green-400/10",
    title: "Produkt-Recherche",
    desc: "Vergleiche Preise und Bewertungen auf AliExpress und Amazon gleichzeitig.",
    tab: "products",
  },
  {
    icon: Music2,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    title: "TikTok Trends",
    desc: "Entdecke viral gehende Produkte und Hashtags auf TikTok bevor sie explodieren.",
    tab: "tiktok",
  },
];

export default function DashboardPage({ onNavigate }) {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 badge bg-brand-500/20 text-brand-500 text-sm px-3 py-1">
          <Zap size={14} />
          Vollautomatische Produkt-Recherche
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Finde die nächsten{" "}
          <span className="text-brand-500">Winning Products</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Analysiere Trends, vergleiche Lieferanten und entdecke virale Produkte —
          alles in einem Tool.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, color, bg, title, desc, tab }) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            className="card text-left hover:border-gray-600 transition-all group"
          >
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={24} className={color} />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{desc}</p>
            <span className={`${color} text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all`}>
              Jetzt öffnen <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </div>

      {/* Quick Searches */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Schnell-Suchen</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => onNavigate("products")}
              className="badge bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors px-3 py-1.5 text-sm"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="card border-brand-500/30 bg-brand-500/5">
        <h2 className="text-lg font-semibold text-white mb-3">Workflow-Tipp</h2>
        <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
          <li>Starte mit <strong className="text-white">TikTok Trends</strong>, um virale Produkte zu entdecken</li>
          <li>Prüfe den <strong className="text-white">Google Trend-Verlauf</strong> — steigt oder fällt der Trend?</li>
          <li>Suche auf <strong className="text-white">AliExpress</strong> nach dem besten Lieferantenpreis</li>
          <li>Vergleiche mit <strong className="text-white">Amazon-Preisen</strong>, um deine Marge zu berechnen</li>
        </ol>
      </div>
    </div>
  );
}
