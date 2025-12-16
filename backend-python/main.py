from fastapi import FastAPI
from pydantic import BaseModel
from pyjexl.jexl_extended import JexlExtended
from typing import Any, Optional

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


@app.get("/")
def root():
    return {"status": "ok", "message": "pyjexl-extended API running"}
