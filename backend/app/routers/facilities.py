import uuid
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.facility import FacilityMaster, FacilityMasterCreate, FacilityMasterUpdate
from app import storage

router = APIRouter()
COLLECTION = "facilities"


@router.get("/", response_model=List[FacilityMaster])
def list_facilities():
    data = storage.load(COLLECTION)
    return list(data.values())


@router.get("/{facility_id}", response_model=FacilityMaster)
def get_facility(facility_id: str):
    data = storage.load(COLLECTION)
    if facility_id not in data:
        raise HTTPException(status_code=404, detail="Facility not found")
    return data[facility_id]


@router.post("/", response_model=FacilityMaster, status_code=201)
def create_facility(body: FacilityMasterCreate):
    data = storage.load(COLLECTION)
    facility_id = str(uuid.uuid4())
    facility = FacilityMaster(id=facility_id, **body.model_dump())
    data[facility_id] = facility.model_dump()
    storage.save(COLLECTION, data)
    return facility


@router.patch("/{facility_id}", response_model=FacilityMaster)
def update_facility(facility_id: str, body: FacilityMasterUpdate):
    data = storage.load(COLLECTION)
    if facility_id not in data:
        raise HTTPException(status_code=404, detail="Facility not found")
    current = FacilityMaster(**data[facility_id])
    updated = current.model_copy(update=body.model_dump(exclude_none=True))
    data[facility_id] = updated.model_dump()
    storage.save(COLLECTION, data)
    return updated


@router.delete("/{facility_id}")
def delete_facility(facility_id: str):
    data = storage.load(COLLECTION)
    if facility_id not in data:
        raise HTTPException(status_code=404, detail="Facility not found")
    del data[facility_id]
    storage.save(COLLECTION, data)
    return {"ok": True}
