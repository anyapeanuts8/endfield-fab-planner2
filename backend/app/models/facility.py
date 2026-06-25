from pydantic import BaseModel
from typing import List
from enum import Enum


class PortDirection(str, Enum):
    input = "input"
    output = "output"


class Port(BaseModel):
    id: str
    transport_type_id: str
    direction: PortDirection
    # 設備グリッド上の外周マス座標 (回転0°基準)
    x: int
    y: int
    # 外周から垂直に出る向き: "up" | "down" | "left" | "right"
    facing: str


class FacilityMaster(BaseModel):
    id: str
    name: str
    width: int
    height: int
    ports: List[Port] = []


class FacilityMasterCreate(BaseModel):
    name: str
    width: int
    height: int
    ports: List[Port] = []


class FacilityMasterUpdate(BaseModel):
    name: str | None = None
    width: int | None = None
    height: int | None = None
    ports: List[Port] | None = None
