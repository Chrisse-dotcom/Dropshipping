import { useState } from "react";
import { Search, Star, ExternalLink, ShoppingBag, Package } from "lucide-react";
import { apiFetch } from "../api";

const SORT_OPTIONS = [
  { value: "default", label: "Standard" },
  { value: "price_asc", label: "Preis aufsteigend" },
  { value: "price_desc", label: "Preis absteigend" },
  { value: "orders", label: "Meiste Bestellungen" },
];

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-1 text-yellow-400 text-xs">
      <Star size={12} fill="currentColor" />
      {Number(rating).toFixed(1)}
    </span>
  );
}

function ProductCard({ product, source }) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card hover:border-gray-600 transition-all flex flex-col group"
    >
      <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3 relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <Package size={32} />
          </div>
        )}
        {product.badge && (
          <span className="absolute top-2 left-2 badge bg-orange-500 text-white text-xs">
            {product.badge}
          </span>
        )}
        {product.prime && (
          <span className="absolute top-2 right-2 badge bg-blue-600 text-white text-xs">Prime</span>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm text-gray-300 line-clamp-2 leading-snug">{product.title}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-white font-bold text-base">{product.price}</span>
          {(product.rating > 0) && <StarRating rating={product.rating} />}
        </div>
        {product.orders && (
          <p className="text-xs text-gray-500">{product.orders}</p>
        )}
        {product.reviews && (
          <p className="text-xs text-gray-500">{product.reviews} Bewertungen</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
        <span className={`badge text-xs ${source === "aliexpress" ? "bg-orange-500/20 text-orange-400" : "bg-yellow-500/20 text-yellow-400"}`}>
          {source === "aliexpress" ? "AliExpress" : "Amazon"}
        </span>
        <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>
    </a>
  );
}

export default function ProductsPage() {
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [aliData, setAliData] = useState(null);
  const [amzData, setAmzData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSource, setActiveSource] = useState("both");

  async function search() {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setAliData(null);
    setAmzData(null);

    try {
      const [ali, amz] = await Promise.all([
        apiFetch(`/api/products/aliexpress?keyword=${encodeURIComponent(keyword)}&sort_by=${sortBy}`),
        apiFetch(`/api/products/amazon?keyword=${encodeURIComponent(keyword)}`),
      ]);
      setAliData(ali);
      setAmzData(amz);
    } catch (e) {
      setError("Fehler beim Laden der Produktdaten.");
    } finally {
      setLoading(false);
    }
  }

  const aliProducts = aliData?.products || [];
  const amzProducts = amzData?.products || [];

  const showAli = activeSource === "both" || activeSource === "aliexpress";
  const showAmz = activeSource === "both" || activeSource === "amazon";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Produkt-Recherche</h2>
        <p className="text-gray-400 text-sm mt-1">Vergleiche Preise auf AliExpress und Amazon</p>
      </div>

      {/* Search bar */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input flex-1"
            placeholder="Produktname eingeben z.B. 'LED Strip Lights'..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn-primary flex items-center gap-2" onClick={search} disabled={loading}>
            <Search size={16} />
            {loading ? "Suchen..." : "Suchen"}
          </button>
        </div>
      </div>

      {error && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      {(aliData || amzData) && (
        <>
          {/* Source filter */}
          <div className="flex gap-2">
            {["both", "aliexpress", "amazon"].map((s) => (
              <button
                key={s}
                onClick={() => setActiveSource(s)}
                className={`btn-secondary text-sm ${activeSource === s ? "bg-brand-500 text-white hover:bg-brand-600" : ""}`}
              >
                {s === "both" ? `Alle (${aliProducts.length + amzProducts.length})` :
                 s === "aliexpress" ? `AliExpress (${aliProducts.length})` :
                 `Amazon (${amzProducts.length})`}
              </button>
            ))}
          </div>

          {/* Products grid */}
          <div className="space-y-8">
            {showAli && aliProducts.length > 0 && (
              <div>
                <h3 className="font-semibold text-orange-400 mb-4 flex items-center gap-2">
                  <ShoppingBag size={18} /> AliExpress ({aliProducts.length} Ergebnisse)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {aliProducts.map((p, i) => (
                    <ProductCard key={p.id || i} product={p} source="aliexpress" />
                  ))}
                </div>
              </div>
            )}

            {showAmz && amzProducts.length > 0 && (
              <div>
                <h3 className="font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                  <ShoppingBag size={18} /> Amazon ({amzProducts.length} Ergebnisse)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {amzProducts.map((p, i) => (
                    <ProductCard key={p.id || i} product={p} source="amazon" />
                  ))}
                </div>
              </div>
            )}

            {showAli && aliProducts.length === 0 && aliData && (
              <p className="text-gray-500 text-sm">Keine AliExpress-Produkte gefunden.</p>
            )}
            {showAmz && amzProducts.length === 0 && amzData && (
              <p className="text-gray-500 text-sm">Keine Amazon-Produkte gefunden.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
