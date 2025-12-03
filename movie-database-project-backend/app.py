from fastapi import FastAPI
from movies_data_router import router as movies_data_router
from keywords_router import router as keywords_router
from db import create_db_and_tables
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(movies_data_router)
app.include_router(keywords_router)
