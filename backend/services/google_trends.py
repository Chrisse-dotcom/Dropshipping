from pytrends.request import TrendReq
from cachetools import TTLCache
from fastapi import HTTPException

cache = TTLCache(maxsize=100, ttl=3600)

def get_trend_data(keyword: str, timeframe: str = "today 3-m", geo: str = "DE"):
    cache_key = f"{keyword}:{timeframe}:{geo}"
    if cache_key in cache:
        return cache[cache_key]

    try:
        pytrends = TrendReq(hl="de-DE", tz=60)
        pytrends.build_payload([keyword], timeframe=timeframe, geo=geo)

        interest_over_time = pytrends.interest_over_time()
        related_queries = pytrends.related_queries()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Google Trends ist gerade nicht erreichbar (Server-IP blockiert oder Rate-Limit). Bitte später versuchen. ({e})"
        )

    timeline = []
    if not interest_over_time.empty and keyword in interest_over_time.columns:
        for date, row in interest_over_time[keyword].items():
            timeline.append({"date": str(date.date()), "value": int(row)})

    top_queries = []
    rising_queries = []
    if keyword in related_queries:
        top_df = related_queries[keyword].get("top")
        rising_df = related_queries[keyword].get("rising")
        if top_df is not None and not top_df.empty:
            top_queries = top_df.head(10).to_dict("records")
        if rising_df is not None and not rising_df.empty:
            rising_queries = rising_df.head(10).to_dict("records")

    result = {
        "keyword": keyword,
        "geo": geo,
        "timeframe": timeframe,
        "timeline": timeline,
        "top_queries": top_queries,
        "rising_queries": rising_queries,
    }
    cache[cache_key] = result
    return result


def get_trending_searches(geo: str = "germany"):
    try:
        pytrends = TrendReq(hl="de-DE", tz=60)
        trending = pytrends.trending_searches(pn=geo)
        return trending[0].tolist()[:20]
    except Exception:
        return []
