
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_shop
from app.db.dependencies import get_db
from app.models.customer import Customer
from app.models.project import Project
from app.models.shop import Shop
from app.schemas.project import ProjectCreate, ProjectResponse


router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    customer_statement = select(Customer).where(
        Customer.id == project_data.customer_id,
        Customer.shop_id == shop.id,
        Customer.is_active.is_(True),
    )

    customer = db.scalar(customer_statement)

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active customer not found.",
        )

    project = Project(
        shop_id=shop.id,
        customer_id=customer.id,
        name=project_data.name.strip(),
        description=project_data.description,
        input_unit=project_data.input_unit,
        output_unit=project_data.output_unit,
        default_tolerance_mm=project_data.default_tolerance_mm,
        default_apply_tolerance=project_data.default_apply_tolerance,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


@router.get("/", response_model=list[ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    statement = (
        select(Project)
        .where(
            Project.shop_id == shop.id,
            Project.status == "active",
        )
        .order_by(Project.created_at.desc())
    )

    return db.scalars(statement).all()


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    statement = select(Project).where(
        Project.id == project_id,
        Project.shop_id == shop.id,
        Project.status == "active",
    )

    project = db.scalar(statement)

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    return project


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
def update_project(
    project_id: uuid.UUID,
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    statement = select(Project).where(
        Project.id == project_id,
        Project.shop_id == shop.id,
        Project.status == "active",
    )

    project = db.scalar(statement)

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    customer_statement = select(Customer).where(
        Customer.id == project_data.customer_id,
        Customer.shop_id == shop.id,
        Customer.is_active.is_(True),
    )

    customer = db.scalar(customer_statement)

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active customer not found.",
        )

    project.customer_id = customer.id
    project.name = project_data.name.strip()
    project.description = project_data.description
    project.input_unit = project_data.input_unit
    project.output_unit = project_data.output_unit
    project.default_tolerance_mm = project_data.default_tolerance_mm
    project.default_apply_tolerance = project_data.default_apply_tolerance

    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}")
def delete_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    statement = select(Project).where(
        Project.id == project_id,
        Project.shop_id == shop.id,
        Project.status == "active",
    )

    project = db.scalar(statement)

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    project.status = "inactive"

    db.commit()

    return {
        "message": "Project deactivated successfully."
    }
