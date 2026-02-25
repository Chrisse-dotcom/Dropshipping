import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const TIMEFRAMES = [
  { value: "today 1-m", label: "1 Monat" },
  { value: "today 3-m", label: "3 Monate" },
  { value: "today 12-m", label: "12 Monate" },
  { value: "today 5-y", label: "5 Jahre" },
];

const GEO_OPTIONS = [
  { value: "DE", label: "Deutschland" },
  { value: "AT", label: "Österreich" },
  { value: "CH", label: "Schweiz" },
  { value: "", label: "Weltweit" },
];

function TrendIndicator({ timeline }) {
  if (!timeline || timeline.length < 2) return null;
  const first = timeline[0]?.value ?? 0;
  const last = timeline[timeline.length - 1]?.value ?? 0;
  const diff = last - first;
  if (diff > 5) return <span className="badge bg-green-400/20 text-green-400"><TrendingUp size={12} /> Steigend</span>;
  if (diff < -5) return <span className="badge bg-red-400/20 text-red-400"><TrendingDown size={12} /> Fallend</span>;
  return <span className="badge bg-gray-700 text-gray-400"><Minus size={12} /> Stabil</span>;
}

export default function TrendsPage() {
  const [keyword, setKeyword] = useState("");
  const [timeframe, setTimeframe] = useState("today 3-m");
  const [geo, setGeo] = useState("DE");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trending, setTrending] = useState([]);

  async function search() {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/trends/search?keyword=${encodeURIComponent(keyword)}&timeframe=${encodeURIComponent(timeframe)}&geo=${geo}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e.message || "Fehler beim Laden der Daten.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTrending() {
    try {
      const res = await fetch("/api/trends/trending");
      const json = await res.json();
      setTrending(json.trending || []);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Google Trends</h2>
        <p className="text-gray-400 text-sm mt-1">Analysiere Suchtrends für Produkte und Nischen</p>
      </div>

      {/* Search */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input flex-1"
            placeholder="Keyword eingeben z.B. 'Wireless Earbuds'..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <select className="input" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            {TIMEFRAMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="input" value={geo} onChange={(e) => setGeo(e.target.value)}>
            {GEO_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          <button className="btn-primary flex items-center gap-2" onClick={search} disabled={loading}>
            <Search size={16} />
            {loading ? "Laden..." : "Suchen"}
          </button>
        </div>

        <button className="text-sm text-brand-500 hover:underline" onClick={loadTrending}>
          Aktuelle Trending-Suchen laden
        </button>

        {trending.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {trending.map((t) => (
              <button
                key={t}
                onClick={() => { setKeyword(t); }}
                className="badge bg-gray-800 text-gray-300 hover:bg-gray-700 px-3 py-1 text-xs"
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-lg">{data.keyword}</h3>
                <p className="text-sm text-gray-400">{data.geo} &middot; {data.timeframe}</p>
              </div>
              <TrendIndicator timeline={data.timeline} />
            </div>
            {data.timeline?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#e5e7eb" }}
                    itemStyle={{ color: "#4361ee" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#4361ee" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">Keine Daten verfügbar</p>
            )}
          </div>

          {/* Related Queries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-white mb-3">Top Suchanfragen</h3>
              {data.top_queries?.length > 0 ? (
                <ul className="space-y-2">
                  {data.top_queries.map((q, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{q.query}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${q.value}%` }}
                          />
                        </div>
                        <span className="text-gray-500 w-8 text-right">{q.value}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500 text-sm">Keine Daten</p>}
            </div>
            <div className="card">
              <h3 className="font-semibold text-white mb-3">Aufsteigende Suchanfragen</h3>
              {data.rising_queries?.length > 0 ? (
                <ul className="space-y-2">
                  {data.rising_queries.map((q, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{q.query}</span>
                      <span className="badge bg-green-400/20 text-green-400">
                        {typeof q.value === "number" ? `+${q.value}%` : q.value}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500 text-sm">Keine Daten</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
