from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import trends, products, tiktok

app = FastAPI(title="Dropshipping Research Tool", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trends.router, prefix="/api/trends", tags=["Trends"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(tiktok.router, prefix="/api/tiktok", tags=["TikTok"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
