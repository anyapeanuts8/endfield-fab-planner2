import uuid
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.flow_diagram import FlowDiagram, FlowDiagramCreate, FlowDiagramUpdate
from app import storage

router = APIRouter()
COLLECTION = "flow_diagrams"


@router.get("/", response_model=List[FlowDiagram])
def list_flow_diagrams():
    data = storage.load(COLLECTION)
    return list(data.values())


@router.get("/{diagram_id}", response_model=FlowDiagram)
def get_flow_diagram(diagram_id: str):
    data = storage.load(COLLECTION)
    if diagram_id not in data:
        raise HTTPException(status_code=404, detail="Flow diagram not found")
    return data[diagram_id]


@router.post("/", response_model=FlowDiagram, status_code=201)
def create_flow_diagram(body: FlowDiagramCreate):
    data = storage.load(COLLECTION)
    diagram_id = str(uuid.uuid4())
    diagram = FlowDiagram(id=diagram_id, **body.model_dump())
    data[diagram_id] = diagram.model_dump()
    storage.save(COLLECTION, data)
    return diagram


@router.put("/{diagram_id}", response_model=FlowDiagram)
def update_flow_diagram(diagram_id: str, body: FlowDiagramUpdate):
    data = storage.load(COLLECTION)
    if diagram_id not in data:
        raise HTTPException(status_code=404, detail="Flow diagram not found")
    current = FlowDiagram(**data[diagram_id])
    updated = current.model_copy(update=body.model_dump(exclude_none=True))
    data[diagram_id] = updated.model_dump()
    storage.save(COLLECTION, data)
    return updated


@router.delete("/{diagram_id}")
def delete_flow_diagram(diagram_id: str):
    data = storage.load(COLLECTION)
    if diagram_id not in data:
        raise HTTPException(status_code=404, detail="Flow diagram not found")
    del data[diagram_id]
    storage.save(COLLECTION, data)
    return {"ok": True}
