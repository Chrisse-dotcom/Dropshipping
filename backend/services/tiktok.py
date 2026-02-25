import httpx
from bs4 import BeautifulSoup
import json
import re
from cachetools import TTLCache

cache = TTLCache(maxsize=100, ttl=900)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Accept-Language": "de-DE,de;q=0.9",
    "Referer": "https://www.tiktok.com/",
}


async def search_hashtag(keyword: str):
    cache_key = f"tiktok:{keyword}"
    if cache_key in cache:
        return cache[cache_key]

    # TikTok hashtag page
    tag = keyword.strip("#").replace(" ", "")
    url = f"https://www.tiktok.com/tag/{tag}"

    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=15, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")

            # Extract NEXT_DATA
            script = soup.find("script", id="__UNIVERSAL_DATA_FOR_REHYDRATION__")
            videos = []
            hashtag_info = {}

            if script:
                try:
                    data = json.loads(script.string or "{}")
                    # Navigate to challenge info
                    default = data.get("__DEFAULT_SCOPE__", {})
                    webapp = default.get("webapp.challenge-detail", {})
                    challenge = webapp.get("challengeInfo", {}).get("challenge", {})
                    stats = webapp.get("challengeInfo", {}).get("stats", {})

                    hashtag_info = {
                        "title": challenge.get("title", tag),
                        "desc": challenge.get("desc", ""),
                        "views": stats.get("viewCount", 0),
                        "video_count": stats.get("videoCount", 0),
                    }

                    item_list = webapp.get("itemList", [])
                    for item in item_list[:15]:
                        author = item.get("author", {})
                        stats_item = item.get("stats", {})
                        video = item.get("video", {})
                        videos.append({
                            "id": item.get("id", ""),
                            "desc": item.get("desc", ""),
                            "author": author.get("nickname", ""),
                            "author_url": f"https://www.tiktok.com/@{author.get('uniqueId', '')}",
                            "likes": stats_item.get("diggCount", 0),
                            "comments": stats_item.get("commentCount", 0),
                            "shares": stats_item.get("shareCount", 0),
                            "plays": stats_item.get("playCount", 0),
                            "cover": video.get("cover", ""),
                            "url": f"https://www.tiktok.com/@{author.get('uniqueId', '')}/video/{item.get('id', '')}",
                        })
                except (json.JSONDecodeError, KeyError):
                    pass

            result = {
                "keyword": keyword,
                "hashtag_info": hashtag_info,
                "videos": videos,
                "source": "tiktok",
            }
            cache[cache_key] = result
            return result

    except Exception as e:
        return {"keyword": keyword, "hashtag_info": {}, "videos": [], "source": "tiktok", "error": str(e)}


async def get_trending_products():
    """Scrape TikTok Shop trending products via public API."""
    cache_key = "tiktok_trending"
    if cache_key in cache:
        return cache[cache_key]

    # TikTok creative center trends
    url = "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/de"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
    }

    try:
        async with httpx.AsyncClient(headers=headers, timeout=15, follow_redirects=True) as client:
            resp = await client.get(url)
            soup = BeautifulSoup(resp.text, "lxml")

            script = soup.find("script", id="__NEXT_DATA__")
            trends = []
            if script:
                try:
                    data = json.loads(script.string or "{}")
                    hashtags = (
                        data.get("props", {})
                        .get("pageProps", {})
                        .get("hashtags", [])
                    )
                    for tag in hashtags[:20]:
                        trends.append({
                            "hashtag": tag.get("hashtag_name", ""),
                            "views": tag.get("publish_cnt", 0),
                            "trend": tag.get("trend", ""),
                            "rank": tag.get("rank", 0),
                        })
                except (json.JSONDecodeError, KeyError):
                    pass

            result = {"trends": trends, "source": "tiktok_creative_center"}
            cache[cache_key] = result
            return result

    except Exception as e:
        return {"trends": [], "source": "tiktok_creative_center", "error": str(e)}
