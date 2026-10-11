"""Check your Backboard model catalog before making live inference calls.

Run inside backend/: python check_models.py
Only prints public model metadata. Never prints your API key.
"""
import os
import httpx
from dotenv import load_dotenv
load_dotenv()
key = os.getenv("BACKBOARD_API_KEY", "")
model = os.getenv("BACKBOARD_MODEL", "qwen/qwen3-8b")
if not key:
    raise SystemExit("Set BACKBOARD_API_KEY in backend/.env first.")
models = []
skip = 0
limit = 500
while True:
    response = httpx.get("https://app.backboard.io/api/models", headers={"X-API-Key": key}, params={"model_type":"llm", "provider":"openrouter", "limit":limit, "skip":skip}, timeout=20)
    response.raise_for_status()
    page = response.json().get("models", [])
    models.extend(page)
    if len(page) < limit:
        break
    skip += len(page)
matches = [m for m in models if "qwen" in str(m.get("name", "")).lower()]
print(f"Found {len(matches)} Qwen listings across {len(models)} OpenRouter LLM listings.")
for item in matches[:30]:
    print(f"{item.get('provider')}/{item.get('name')} | JSON={item.get('supports_json_output')} | context={item.get('context_limit')}")
configured = [m for m in models if m.get("name") == model]
if not configured:
    raise SystemExit(f"Configured model is not available from this catalog: {model}")
selected = configured[0]
if not selected.get("supports_json_output"):
    raise SystemExit(f"Configured model does not support json_output: {model}")
print(f"Configured model verified: {selected.get('provider')}/{selected.get('name')} | JSON=True | context={selected.get('context_limit')}")
