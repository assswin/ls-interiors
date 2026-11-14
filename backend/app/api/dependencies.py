
from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.shop import Shop


def get_current_shop(
    db: Session = Depends(get_db),
) -> Shop:
    statement = select(Shop).where(
        Shop.slug == "ls-interiors",
        Shop.is_active.is_(True),
    )

    shop = db.scalar(statement)

    if shop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="LS Interiors shop was not found or is inactive.",
        )

    return shop
