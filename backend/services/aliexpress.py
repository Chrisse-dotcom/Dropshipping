import httpx
from bs4 import BeautifulSoup
import json
import re
from cachetools import TTLCache

cache = TTLCache(maxsize=200, ttl=1800)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


async def search_products(keyword: str, page: int = 1, sort_by: str = "default"):
    cache_key = f"ali:{keyword}:{page}:{sort_by}"
    if cache_key in cache:
        return cache[cache_key]

    sort_map = {
        "default": "",
        "price_asc": "SORT_PRICE_ASC",
        "price_desc": "SORT_PRICE_DESC",
        "orders": "SORT_ORDER_COUNT_DESC",
    }
    sort_param = sort_map.get(sort_by, "")

    url = (
        f"https://www.aliexpress.com/wholesale"
        f"?SearchText={keyword.replace(' ', '+')}"
        f"&page={page}"
        f"&SortType={sort_param}"
    )

    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=15, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")

            # Extract JSON data embedded in page
            script_tag = soup.find("script", string=re.compile("window._dida_config_"))
            products = []

            if script_tag:
                match = re.search(r"mods\s*:\s*(\{.*?\})\s*,\s*\n", script_tag.string or "", re.DOTALL)
                if match:
                    try:
                        data = json.loads(match.group(1))
                        items = data.get("itemList", {}).get("content", [])
                        for item in items[:20]:
                            prices = item.get("prices", {})
                            sale = prices.get("salePrice", {})
                            products.append({
                                "id": str(item.get("productId", "")),
                                "title": item.get("title", {}).get("displayTitle", ""),
                                "price": sale.get("formattedPrice", "N/A"),
                                "price_min": sale.get("minPrice", 0),
                                "price_max": sale.get("maxPrice", 0),
                                "image": item.get("image", {}).get("imgUrl", ""),
                                "orders": item.get("trade", {}).get("tradeDesc", "0 orders"),
                                "rating": item.get("evaluation", {}).get("starRating", 0),
                                "url": f"https://de.aliexpress.com/item/{item.get('productId')}.html",
                                "store": item.get("store", {}).get("storeName", ""),
                                "shipping": item.get("logistics", {}).get("logisticsDesc", ""),
                            })
                    except (json.JSONDecodeError, KeyError):
                        pass

            # Fallback: parse product cards directly
            if not products:
                cards = soup.select(".product-container, .list--gallery--C2f2tvm, [class*='manhattan']")
                for card in cards[:20]:
                    title_el = card.select_one("[class*='title']")
                    price_el = card.select_one("[class*='price']")
                    img_el = card.select_one("img")
                    link_el = card.select_one("a[href]")
                    if title_el and price_el:
                        products.append({
                            "id": "",
                            "title": title_el.get_text(strip=True),
                            "price": price_el.get_text(strip=True),
                            "price_min": 0,
                            "price_max": 0,
                            "image": img_el.get("src", "") if img_el else "",
                            "orders": "",
                            "rating": 0,
                            "url": link_el.get("href", "") if link_el else "",
                            "store": "",
                            "shipping": "",
                        })

            result = {"keyword": keyword, "page": page, "products": products, "source": "aliexpress"}
            cache[cache_key] = result
            return result

    except Exception as e:
        return {"keyword": keyword, "page": page, "products": [], "source": "aliexpress", "error": str(e)}
