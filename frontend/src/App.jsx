import { useState } from "react";
import { TrendingUp, ShoppingBag, Music2, BarChart2 } from "lucide-react";
import TrendsPage from "./pages/TrendsPage";
import ProductsPage from "./pages/ProductsPage";
import TikTokPage from "./pages/TikTokPage";
import DashboardPage from "./pages/DashboardPage";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
  { id: "trends", label: "Google Trends", icon: TrendingUp },
  { id: "products", label: "Produkte", icon: ShoppingBag },
  { id: "tiktok", label: "TikTok", icon: Music2 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <TrendingUp size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Dropshipping<span className="text-brand-500">Research</span>
              </span>
            </div>
            <nav className="flex gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === id
                      ? "bg-brand-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:block">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && <DashboardPage onNavigate={setActiveTab} />}
        {activeTab === "trends" && <TrendsPage />}
        {activeTab === "products" && <ProductsPage />}
        {activeTab === "tiktok" && <TikTokPage />}
      </main>

      <footer className="border-t border-gray-800 text-center text-xs text-gray-600 py-4">
        Dropshipping Research Tool &mdash; Daten von Google Trends, AliExpress, Amazon, TikTok
      </footer>
    </div>
  );
}
