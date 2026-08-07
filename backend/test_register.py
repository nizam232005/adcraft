"""Test registration endpoint directly."""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

response = client.post("/api/auth/register", json={
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "creator"
})

print(f"Status: {response.status_code}")
print(f"Body: {response.json()}")
