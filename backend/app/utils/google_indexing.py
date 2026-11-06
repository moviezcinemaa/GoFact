"""
Google Indexing API integration.

Pushes article URLs to Google immediately after they are saved to the database,
requesting faster crawling and indexing.

Prerequisites (one-time manual setup):
  1. GCP Console → enable "Web Search Indexing API"
  2. Create a Service Account → download JSON key
  3. Google Search Console → Settings → Users and Permissions
     → add service account email as Owner

Configuration:
  Set GOOGLE_INDEXING_SA_JSON env var to either:
    a) The raw JSON string of the service account key, OR
    b) The absolute path to the .json key file on disk
"""

import json
import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

INDEXING_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"
SCOPES = ["https://www.googleapis.com/auth/indexing"]


def _get_access_token() -> Optional[str]:
    """
    Obtain a short-lived OAuth2 access token from the service account credentials.
    Returns None (and logs a warning) if credentials are not configured.
    """
    sa_config = os.getenv("GOOGLE_INDEXING_SA_JSON", "").strip()
    if not sa_config:
        logger.warning("GOOGLE_INDEXING_SA_JSON not set — skipping Google Indexing API push.")
        return None

    try:
        # Accept either raw JSON string or a file path
        if sa_config.startswith("{"):
            sa_info = json.loads(sa_config)
        else:
            with open(sa_config, "r") as f:
                sa_info = json.load(f)

        # Lazy import so the package is optional during local dev
        from google.oauth2 import service_account  # type: ignore
        from google.auth.transport.requests import Request  # type: ignore

        credentials = service_account.Credentials.from_service_account_info(
            sa_info, scopes=SCOPES
        )
        credentials.refresh(Request())
        return credentials.token
    except Exception as exc:
        logger.error(f"Failed to obtain Google Indexing API token: {exc}")
        return None


async def push_url_to_google(url: str, notification_type: str = "URL_UPDATED") -> None:
    """
    Notify Google that a URL has been created or updated.

    Args:
        url: The canonical article URL, e.g. https://gofact.in/article/<slug>
        notification_type: "URL_UPDATED" (new or changed) or "URL_DELETED"
    """
    token = _get_access_token()
    if not token:
        return  # credentials not set — silently skip (warning already logged)

    payload = {"url": url, "type": notification_type}
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(INDEXING_ENDPOINT, json=payload, headers=headers)
        if response.status_code == 200:
            logger.info(f"Google Indexing API ✓ {url}")
        else:
            logger.warning(
                f"Google Indexing API returned {response.status_code} for {url}: {response.text}"
            )
    except Exception as exc:
        logger.error(f"Google Indexing API request failed for {url}: {exc}")

