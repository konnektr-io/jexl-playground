import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Any, Optional
from pyjexl import JexlExtended

app = FastAPI()
class EvalRequest(BaseModel):
    expression: str
    context: Any


class EvalResponse(BaseModel):
    result: Optional[Any]
    error: Optional[str]


jexl = JexlExtended()


@app.post("/evaluate", response_model=EvalResponse)
async def evaluate(req: EvalRequest):
    try:
        result = jexl.evaluate(req.expression, req.context)
        return EvalResponse(result=result, error=None)
    except Exception as e:
        return EvalResponse(result=None, error=str(e))


# Health check endpoint
@app.get("/healthz")
def healthz():
    return {"status": "ok", "message": "pyjexl-extended API running"}


# Serve static frontend files
frontend_dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="static")


# fallback to index.html for SPA routing
@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    index_path = os.path.join(frontend_dist_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="Not Found")
