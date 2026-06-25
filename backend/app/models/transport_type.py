from pydantic import BaseModel
from typing import List


class TransportType(BaseModel):
    id: str
    name: str
    layer_id: str
    # レイヤーID: 分岐・合流ノード配置時に追加占有するレイヤー
    occupies_layers: List[str] = []
    # 通常経路が共存可能な他種別ID
    can_coexist_with: List[str] = []
    display_order: int
    color: str
    line_style: str  # "solid" | "dashed" | "dotted"
