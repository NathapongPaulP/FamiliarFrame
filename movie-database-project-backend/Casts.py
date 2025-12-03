from fastapi import APIRouter, Depends
from db import Person, get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select