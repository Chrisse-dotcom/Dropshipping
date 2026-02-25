from fastapi import APIRouter, Query
from services.google_trends import get_trend_data, get_trending_searches

router = APIRouter()


@router.get("/search")
async def search_trends(
    keyword: str = Query(..., description="Suchbegriff"),
    timeframe: str = Query("today 3-m", description="Zeitraum: today 1-m, today 3-m, today 12-m, today 5-y"),
    geo: str = Query("DE", description="Ländercode: DE, AT, CH, US"),
):
    return get_trend_data(keyword, timeframe, geo)


@router.get("/trending")
async def trending_searches(geo: str = Query("germany", description="Land für Trending-Suchen")):
    searches = get_trending_searches(geo)
    return {"trending": searches, "geo": geo}
