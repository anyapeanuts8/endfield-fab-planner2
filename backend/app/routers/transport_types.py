from fastapi import APIRouter, HTTPException
from typing import List
from app.models.transport_type import TransportType
from app import storage

router = APIRouter()
COLLECTION = "transport_types"


@router.get("/", response_model=List[TransportType])
def list_transport_types():
    data = storage.load(COLLECTION)
    return list(data.values())


@router.get("/{type_id}", response_model=TransportType)
def get_transport_type(type_id: str):
    data = storage.load(COLLECTION)
    if type_id not in data:
        raise HTTPException(status_code=404, detail="Transport type not found")
    return data[type_id]


@router.put("/{type_id}", response_model=TransportType)
def upsert_transport_type(type_id: str, body: TransportType):
    data = storage.load(COLLECTION)
    body.id = type_id
    data[type_id] = body.model_dump()
    storage.save(COLLECTION, data)
    return body


@router.delete("/{type_id}")
def delete_transport_type(type_id: str):
    data = storage.load(COLLECTION)
    if type_id not in data:
        raise HTTPException(status_code=404, detail="Transport type not found")
    del data[type_id]
    storage.save(COLLECTION, data)
    return {"ok": True}
