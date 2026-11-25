import os
import unittest

os.environ.setdefault("GEMINI_API_KEY", "test-key")

from app import create_app  # noqa: E402


class TestHealth(unittest.TestCase):
    def test_health_returns_ok(self):
        client = create_app("testing").test_client()
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"status": "ok"})


if __name__ == "__main__":
    unittest.main()
