"""JSON ファイルベースのシンプルな永続化ストレージ"""
import json
import os
from pathlib import Path
from typing import Any, Dict

DATA_DIR = Path(os.environ.get("DATA_DIR", Path(__file__).parent.parent / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _path(collection: str) -> Path:
    return DATA_DIR / f"{collection}.json"


def load(collection: str) -> Dict[str, Any]:
    p = _path(collection)
    if not p.exists():
        return {}
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)


def save(collection: str, data: Dict[str, Any]) -> None:
    with open(_path(collection), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
