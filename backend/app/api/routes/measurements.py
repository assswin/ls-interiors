
import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_shop
from app.db.dependencies import get_db
from app.models.measurement import Measurement
from app.models.project import Project
from app.models.shop import Shop
from app.schemas.measurement import (
    MeasurementCreate,
    MeasurementResponse,
)


router = APIRouter(
    prefix="/projects/{project_id}/measurements",
    tags=["Measurements"],
)


UNIT_FACTORS = {
    "in": Decimal("25.4"),
    "cm": Decimal("10"),
    "mm": Decimal("1"),
}


def convert_to_mm(
    value: Decimal | None,
    unit: str,
) -> Decimal | None:
    if value is None:
        return None

    return value * UNIT_FACTORS[unit]


def get_active_project(
    project_id: uuid.UUID,
    db: Session,
    shop: Shop,
) -> Project:
    statement = select(Project).where(
        Project.id == project_id,
        Project.shop_id == shop.id,
        Project.status == "active",
    )

    project = db.scalar(statement)

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active project not found.",
        )

    return project


# CREATE MEASUREMENT
@router.post(
    "/",
    response_model=MeasurementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_measurement(
    project_id: uuid.UUID,
    measurement_data: MeasurementCreate,
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    project = get_active_project(project_id, db, shop)

    input_unit = measurement_data.input_unit or project.input_unit

    measurement = Measurement(
        shop_id=shop.id,
        project_id=project.id,
        row_order=measurement_data.row_order,

        height=measurement_data.height,
        width=measurement_data.width,

        input_unit=input_unit,
        height_mm=convert_to_mm(
            measurement_data.height,
            input_unit,
        ),
        width_mm=convert_to_mm(
            measurement_data.width,
            input_unit,
        ),

        model_id=measurement_data.model_id,
        glass_type=measurement_data.glass_type,

        # Use project defaults when values are not provided
        tolerance_mm=(
            measurement_data.tolerance_mm
            if measurement_data.tolerance_mm is not None
            else project.default_tolerance_mm
        ),

        apply_tolerance=(
            measurement_data.apply_tolerance
            if measurement_data.apply_tolerance is not None
            else project.default_apply_tolerance
        ),

        height_additional_mm=measurement_data.height_additional_mm,
        width_additional_mm=measurement_data.width_additional_mm,
        identification_color=measurement_data.identification_color,
    )

    db.add(measurement)
    db.commit()
    db.refresh(measurement)

    return measurement


# GET ALL MEASUREMENTS
@router.get("/", response_model=list[MeasurementResponse])
def get_measurements(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    project = get_active_project(project_id, db, shop)

    statement = (
        select(Measurement)
        .where(
            Measurement.project_id == project.id,
            Measurement.shop_id == shop.id,
        )
        .order_by(Measurement.row_order.asc())
    )

    return db.scalars(statement).all()


# GET SINGLE MEASUREMENT
@router.get(
    "/{measurement_id}",
    response_model=MeasurementResponse,
)
def get_measurement(
    project_id: uuid.UUID,
    measurement_id: uuid.UUID,
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    project = get_active_project(project_id, db, shop)

    statement = select(Measurement).where(
        Measurement.id == measurement_id,
        Measurement.project_id == project.id,
        Measurement.shop_id == shop.id,
    )

    measurement = db.scalar(statement)

    if measurement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement not found.",
        )

    return measurement


# UPDATE MEASUREMENT
@router.put(
    "/{measurement_id}",
    response_model=MeasurementResponse,
)
def update_measurement(
    project_id: uuid.UUID,
    measurement_id: uuid.UUID,
    measurement_data: MeasurementCreate,
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    project = get_active_project(project_id, db, shop)

    statement = select(Measurement).where(
        Measurement.id == measurement_id,
        Measurement.project_id == project.id,
        Measurement.shop_id == shop.id,
    )

    measurement = db.scalar(statement)

    if measurement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement not found.",
        )

    input_unit = measurement_data.input_unit or measurement.input_unit

    measurement.row_order = measurement_data.row_order

    measurement.height = measurement_data.height
    measurement.width = measurement_data.width

    measurement.input_unit = input_unit

    measurement.height_mm = convert_to_mm(
        measurement_data.height,
        input_unit,
    )

    measurement.width_mm = convert_to_mm(
        measurement_data.width,
        input_unit,
    )

    measurement.model_id = measurement_data.model_id
    measurement.glass_type = measurement_data.glass_type

    # Preserve existing tolerance settings when not provided
    if measurement_data.tolerance_mm is not None:
        measurement.tolerance_mm = measurement_data.tolerance_mm

    if measurement_data.apply_tolerance is not None:
        measurement.apply_tolerance = measurement_data.apply_tolerance

    measurement.height_additional_mm = measurement_data.height_additional_mm
    measurement.width_additional_mm = measurement_data.width_additional_mm
    measurement.identification_color = measurement_data.identification_color

    db.commit()
    db.refresh(measurement)

    return measurement


# DELETE MEASUREMENT
@router.delete("/{measurement_id}")
def delete_measurement(
    project_id: uuid.UUID,
    measurement_id: uuid.UUID,
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    project = get_active_project(project_id, db, shop)

    statement = select(Measurement).where(
        Measurement.id == measurement_id,
        Measurement.project_id == project.id,
        Measurement.shop_id == shop.id,
    )

    measurement = db.scalar(statement)

    if measurement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement not found.",
        )

    db.delete(measurement)
    db.commit()

    return {
        "message": "Measurement deleted successfully."
    }
