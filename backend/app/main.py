from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import facilities, transport_types, flow_diagrams
from app.seed import seed

seed()

app = FastAPI(title="Endfield Fab Planner", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(facilities.router, prefix="/api/facilities", tags=["facilities"])
app.include_router(transport_types.router, prefix="/api/transport-types", tags=["transport-types"])
app.include_router(flow_diagrams.router, prefix="/api/flow-diagrams", tags=["flow-diagrams"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
