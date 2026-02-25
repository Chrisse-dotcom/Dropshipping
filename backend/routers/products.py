from fastapi import APIRouter, Query
from services.aliexpress import search_products as ali_search
from services.amazon import search_products as amz_search, get_bestsellers

router = APIRouter()


@router.get("/aliexpress")
async def search_aliexpress(
    keyword: str = Query(..., description="Suchbegriff"),
    page: int = Query(1, ge=1, le=10),
    sort_by: str = Query("default", description="Sortierung: default, price_asc, price_desc, orders"),
):
    return await ali_search(keyword, page, sort_by)


@router.get("/amazon")
async def search_amazon(
    keyword: str = Query(..., description="Suchbegriff"),
    page: int = Query(1, ge=1, le=5),
):
    return await amz_search(keyword, page)


@router.get("/amazon/bestsellers")
async def amazon_bestsellers():
    return await get_bestsellers()
