"""Check your Backboard model catalog before making live inference calls.

Run inside backend/: python check_models.py
Only prints public model metadata. Never prints your API key.
"""
import os
import httpx
from dotenv import load_dotenv
load_dotenv()
key = os.getenv("BACKBOARD_API_KEY", "")
model = os.getenv("BACKBOARD_MODEL", "qwen/qwen3-4b")
if not key:
    raise SystemExit("Set BACKBOARD_API_KEY in backend/.env first.")
response = httpx.get("https://app.backboard.io/api/models", headers={"X-API-Key": key}, params={"model_type":"llm", "provider":"openrouter", "limit":500}, timeout=20)
response.raise_for_status()
models = response.json().get("models",[])
matches = [m for m in models if "qwen" in str(m.get("name", "")).lower()]
print(f"Found {len(matches)} Qwen listings in first {len(models)} models; pagination may apply.")
for item in matches[:30]:
    print(f"{item.get('provider')}/{item.get('name')} | JSON={item.get('supports_json_output')} | context={item.get('context_limit')}")
print(f"Configured model: {model}")
print("If not listed, check additional pages or change BACKBOARD_MODEL to a catalog identifier.")
