import httpx
from bs4 import BeautifulSoup
import re
from cachetools import TTLCache

cache = TTLCache(maxsize=200, ttl=1800)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "de-DE,de;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate",
}


async def search_products(keyword: str, page: int = 1):
    cache_key = f"amz:{keyword}:{page}"
    if cache_key in cache:
        return cache[cache_key]

    url = f"https://www.amazon.de/s?k={keyword.replace(' ', '+')}&page={page}"

    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=15, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")

            products = []
            items = soup.select('[data-component-type="s-search-result"]')

            for item in items[:20]:
                title_el = item.select_one("h2 a span")
                price_whole = item.select_one(".a-price-whole")
                price_frac = item.select_one(".a-price-fraction")
                rating_el = item.select_one(".a-icon-alt")
                reviews_el = item.select_one('[aria-label*="Bewertungen"], [aria-label*="reviews"]')
                img_el = item.select_one(".s-image")
                link_el = item.select_one("h2 a")
                badge_el = item.select_one(".a-badge-text")
                prime_el = item.select_one(".s-prime")

                if not title_el:
                    continue

                price = ""
                if price_whole:
                    price = price_whole.get_text(strip=True).replace(".", "").replace(",", ".")
                    if price_frac:
                        price += f".{price_frac.get_text(strip=True)}"
                    price = f"€{price}"

                rating = 0
                if rating_el:
                    match = re.search(r"[\d,\.]+", rating_el.get_text())
                    if match:
                        rating = float(match.group().replace(",", "."))

                reviews = ""
                if reviews_el:
                    reviews = reviews_el.get("aria-label", "").split(" ")[0]

                asin = item.get("data-asin", "")
                products.append({
                    "id": asin,
                    "title": title_el.get_text(strip=True),
                    "price": price or "N/A",
                    "image": img_el.get("src", "") if img_el else "",
                    "rating": rating,
                    "reviews": reviews,
                    "badge": badge_el.get_text(strip=True) if badge_el else "",
                    "prime": prime_el is not None,
                    "url": f"https://www.amazon.de{link_el.get('href', '')}" if link_el else "",
                    "source": "amazon",
                })

            result = {"keyword": keyword, "page": page, "products": products, "source": "amazon"}
            cache[cache_key] = result
            return result

    except Exception as e:
        return {"keyword": keyword, "page": page, "products": [], "source": "amazon", "error": str(e)}


async def get_bestsellers(category_url: str = "https://www.amazon.de/gp/bestsellers/"):
    cache_key = f"amz_bestsellers:{category_url}"
    if cache_key in cache:
        return cache[cache_key]

    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=15, follow_redirects=True) as client:
            resp = await client.get(category_url)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")

            products = []
            items = soup.select("#gridItemRoot, .zg-grid-general-faceout")

            for i, item in enumerate(items[:20], 1):
                title_el = item.select_one(".p13n-sc-truncate, ._cDEzb_p13n-sc-css-line-clamp-3")
                price_el = item.select_one(".p13n-sc-price")
                img_el = item.select_one("img")
                link_el = item.select_one("a.a-link-normal")
                rating_el = item.select_one(".a-icon-alt")

                if not title_el:
                    continue

                rating = 0
                if rating_el:
                    match = re.search(r"[\d,\.]+", rating_el.get_text())
                    if match:
                        rating = float(match.group().replace(",", "."))

                products.append({
                    "rank": i,
                    "title": title_el.get_text(strip=True),
                    "price": price_el.get_text(strip=True) if price_el else "N/A",
                    "image": img_el.get("src", "") if img_el else "",
                    "rating": rating,
                    "url": f"https://www.amazon.de{link_el.get('href', '')}" if link_el else "",
                    "source": "amazon_bestseller",
                })

            result = {"products": products, "source": "amazon_bestsellers"}
            cache[cache_key] = result
            return result

    except Exception as e:
        return {"products": [], "source": "amazon_bestsellers", "error": str(e)}
