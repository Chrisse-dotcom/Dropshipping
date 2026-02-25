from fastapi import APIRouter, Query
from services.tiktok import search_hashtag, get_trending_products

router = APIRouter()


@router.get("/search")
async def search_tiktok(keyword: str = Query(..., description="Hashtag oder Suchbegriff")):
    return await search_hashtag(keyword)


@router.get("/trending")
async def tiktok_trending():
    return await get_trending_products()
