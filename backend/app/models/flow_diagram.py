from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class NodeType(str, Enum):
    facility = "facility"
    branch = "branch"
    merge = "merge"


class FlowNode(BaseModel):
    id: str
    type: NodeType
    # facility の場合
    facility_master_id: Optional[str] = None
    # branch / merge の場合
    transport_type_id: Optional[str] = None
    # フロー図上の表示座標 (最適化には使用しない)
    display_x: float = 0
    display_y: float = 0
    # ピン留め (最適化時にグリッド座標を固定する)
    pinned: bool = False
    pinned_grid_x: Optional[int] = None
    pinned_grid_y: Optional[int] = None
    pinned_rotation: Optional[int] = None  # 0 | 90 | 180 | 270


class FlowEdge(BaseModel):
    id: str
    transport_type_id: str
    from_node_id: str
    to_node_id: str


class FlowDiagram(BaseModel):
    id: str
    name: str
    nodes: List[FlowNode] = []
    edges: List[FlowEdge] = []


class FlowDiagramCreate(BaseModel):
    name: str
    nodes: List[FlowNode] = []
    edges: List[FlowEdge] = []


class FlowDiagramUpdate(BaseModel):
    name: Optional[str] = None
    nodes: Optional[List[FlowNode]] = None
    edges: Optional[List[FlowEdge]] = None
