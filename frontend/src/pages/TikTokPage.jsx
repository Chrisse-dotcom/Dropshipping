import { useState } from "react";
import { apiFetch } from "../api";
import { Search, Heart, MessageCircle, Share2, Play, Music2, TrendingUp, ExternalLink } from "lucide-react";

function formatCount(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function VideoCard({ video }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card hover:border-gray-600 transition-all group flex flex-col"
    >
      <div className="aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden mb-3 relative">
        {video.cover ? (
          <img
            src={video.cover}
            alt={video.desc}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <Music2 size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-xs line-clamp-2 leading-snug">{video.desc}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-brand-500 font-medium">@{video.author}</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Play size={11} className="text-gray-500" />
            {formatCount(video.plays)}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={11} className="text-red-400" />
            {formatCount(video.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={11} className="text-blue-400" />
            {formatCount(video.comments)}
          </span>
          <span className="flex items-center gap-1">
            <Share2 size={11} className="text-green-400" />
            {formatCount(video.shares)}
          </span>
        </div>
      </div>
    </a>
  );
}

function TrendingHashtags({ trends }) {
  if (!trends?.length) return null;
  return (
    <div className="card">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp size={18} className="text-pink-400" />
        Trending Hashtags (TikTok Creative Center)
      </h3>
      <div className="space-y-3">
        {trends.map((t, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 w-5 text-right">{t.rank || i + 1}</span>
              <a
                href={`https://www.tiktok.com/tag/${t.hashtag}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 font-medium"
              >
                #{t.hashtag}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{formatCount(t.views)} Videos</span>
              {t.trend && (
                <span className={`badge text-xs ${
                  t.trend === "up" ? "bg-green-400/20 text-green-400" : "bg-red-400/20 text-red-400"
                }`}>
                  {t.trend === "up" ? "↑" : "↓"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TikTokPage() {
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const json = await apiFetch(`/api/tiktok/search?keyword=${encodeURIComponent(keyword)}`);
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e.message || "Fehler beim Laden der TikTok-Daten.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTrending() {
    setLoadingTrends(true);
    try {
      const json = await apiFetch("/api/tiktok/trending");
      setTrends(json);
    } catch {}
    finally { setLoadingTrends(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">TikTok Trends</h2>
        <p className="text-gray-400 text-sm mt-1">Entdecke virale Produkte und Hashtags</p>
      </div>

      {/* Search */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input flex-1"
            placeholder="Hashtag oder Produkt z.B. 'cleaninghacks'..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button className="btn-primary flex items-center gap-2" onClick={search} disabled={loading}>
            <Search size={16} />
            {loading ? "Laden..." : "Suchen"}
          </button>
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={loadTrending}
            disabled={loadingTrends}
          >
            <TrendingUp size={16} />
            {loadingTrends ? "Laden..." : "Trending laden"}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Tipp: Suche ohne # — z.B. "gadgets", "viral", "cleaninghacks"
        </p>
      </div>

      {error && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      {/* Trending hashtags */}
      {trends && <TrendingHashtags trends={trends.trends} />}

      {/* Hashtag results */}
      {data && (
        <div className="space-y-6">
          {data.hashtag_info?.title && (
            <div className="card border-pink-500/30 bg-pink-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-xl">#{data.hashtag_info.title}</h3>
                  {data.hashtag_info.desc && (
                    <p className="text-gray-400 text-sm mt-1">{data.hashtag_info.desc}</p>
                  )}
                </div>
                <a
                  href={`https://www.tiktok.com/tag/${data.hashtag_info.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
              <div className="flex gap-6 mt-3 text-sm">
                <div>
                  <p className="text-gray-500">Aufrufe</p>
                  <p className="text-white font-bold">{formatCount(data.hashtag_info.views)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Videos</p>
                  <p className="text-white font-bold">{formatCount(data.hashtag_info.video_count)}</p>
                </div>
              </div>
            </div>
          )}

          {data.videos?.length > 0 ? (
            <div>
              <h3 className="font-semibold text-white mb-4">Videos ({data.videos.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data.videos.map((v) => <VideoCard key={v.id} video={v} />)}
              </div>
            </div>
          ) : (
            <div className="card text-center py-10">
              <Music2 size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">Keine Videos gefunden.</p>
              <p className="text-gray-600 text-sm mt-1">TikTok schränkt manchmal den Zugriff ein.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
