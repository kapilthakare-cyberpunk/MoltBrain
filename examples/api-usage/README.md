# HTTP API Usage

claude-recall exposes a REST API for programmatic access to your memory data.

## Base URL

```
http://localhost:37777
```

## Authentication

No authentication required for local access.

## Endpoints

### Health Check

```bash
curl http://localhost:37777/health
```

Response:
```json
{
  "status": "ok",
  "version": "9.0.9",
  "uptime": 3600
}
```

### Search Observations

```bash
curl "http://localhost:37777/api/search?q=authentication&limit=10"
```

Response:
```json
{
  "results": [
    {
      "id": 123,
      "type": "discovery",
      "title": "OAuth2 implementation",
      "narrative": "Implemented OAuth2 flow...",
      "concepts": ["authentication", "security"],
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 45,
  "page": 1
}
```

### Get Timeline

```bash
curl "http://localhost:37777/api/timeline?project=my-project&days=7"
```

### Get Session Details

```bash
curl "http://localhost:37777/api/sessions/123"
```

### List Projects

```bash
curl "http://localhost:37777/api/projects"
```

### Get Statistics

```bash
curl "http://localhost:37777/api/stats"
```

Response:
```json
{
  "total_observations": 1234,
  "total_sessions": 89,
  "total_summaries": 89,
  "projects": 5,
  "tokens_used": 45000
}
```

### Export Data

```bash
# Export as JSON
curl "http://localhost:37777/api/export?format=json" > backup.json

# Export as CSV
curl "http://localhost:37777/api/export?format=csv" > backup.csv
```

## Filtering

Most endpoints support filtering:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `project` | Filter by project | `?project=my-app` |
| `type` | Filter by observation type | `?type=discovery` |
| `from` | Start date (ISO 8601) | `?from=2026-01-01` |
| `to` | End date (ISO 8601) | `?to=2026-01-31` |
| `limit` | Results per page | `?limit=20` |
| `offset` | Pagination offset | `?offset=40` |

## Examples

### Python

```python
import requests

def search_memories(query, limit=10):
    response = requests.get(
        "http://localhost:37777/api/search",
        params={"q": query, "limit": limit}
    )
    return response.json()

results = search_memories("database migration")
for r in results["results"]:
    print(f"{r['type']}: {r['title']}")
```

### JavaScript

```javascript
async function getTimeline(project, days = 7) {
  const response = await fetch(
    `http://localhost:37777/api/timeline?project=${project}&days=${days}`
  );
  return response.json();
}

const timeline = await getTimeline("my-project");
console.log(timeline);
```

### Shell Script

```bash
#!/bin/bash
# Daily backup script

DATE=$(date +%Y-%m-%d)
curl -s "http://localhost:37777/api/export?format=json" > "backup-$DATE.json"
echo "Backup saved to backup-$DATE.json"
```

## Server-Sent Events (SSE)

Subscribe to real-time updates:

```javascript
const eventSource = new EventSource("http://localhost:37777/stream");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("New event:", data);
};

eventSource.addEventListener("observation", (event) => {
  console.log("New observation:", JSON.parse(event.data));
});

eventSource.addEventListener("summary", (event) => {
  console.log("Session summary:", JSON.parse(event.data));
});
```

## Error Handling

All errors return JSON with an `error` field:

```json
{
  "error": "Session not found",
  "code": "NOT_FOUND"
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad request
- `404` - Not found
- `500` - Server error
