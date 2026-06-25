"""初期データ投入スクリプト。data/ が空の場合のみ実行される。"""
from app import storage


TRANSPORT_TYPES = {
    "conveyor": {
        "id": "conveyor",
        "name": "コンベア",
        "layer_id": "conveyor",
        "occupies_layers": [],
        "can_coexist_with": ["pipe"],
        "display_order": 1,
        "color": "#f59e0b",
        "line_style": "solid",
    },
    "pipe": {
        "id": "pipe",
        "name": "パイプ",
        "layer_id": "pipe",
        "occupies_layers": ["conveyor"],
        "can_coexist_with": ["conveyor"],
        "display_order": 3,
        "color": "#3b82f6",
        "line_style": "solid",
    },
}

# 標準設備 3×3: 上辺コンベア入力、下辺コンベア出力、左辺パイプ入力、右辺パイプ出力
PRESET_FACILITY_ID = "preset-standard-3x3"
FACILITIES = {
    PRESET_FACILITY_ID: {
        "id": PRESET_FACILITY_ID,
        "name": "標準設備",
        "width": 3,
        "height": 3,
        "ports": [
            # 上辺中央 (x=1, y=0) コンベア入力 → facing: up
            {"id": "p1", "transport_type_id": "conveyor", "direction": "input",  "x": 1, "y": 0, "facing": "up"},
            # 下辺中央 (x=1, y=2) コンベア出力 → facing: down
            {"id": "p2", "transport_type_id": "conveyor", "direction": "output", "x": 1, "y": 2, "facing": "down"},
            # 左辺中央 (x=0, y=1) パイプ入力 → facing: left
            {"id": "p3", "transport_type_id": "pipe",     "direction": "input",  "x": 0, "y": 1, "facing": "left"},
            # 右辺中央 (x=2, y=1) パイプ出力 → facing: right
            {"id": "p4", "transport_type_id": "pipe",     "direction": "output", "x": 2, "y": 1, "facing": "right"},
        ],
    }
}


def seed():
    tt_data = storage.load("transport_types")
    if not tt_data:
        storage.save("transport_types", TRANSPORT_TYPES)
        print("Seeded transport_types")

    fac_data = storage.load("facilities")
    if not fac_data:
        storage.save("facilities", FACILITIES)
        print("Seeded facilities")
