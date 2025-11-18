# Live Stream Review System

A web-based content review system for live stream snapshots with advanced filtering and viewing capabilities.

## Features

### Filter Panel
- **Anchor ID**: Fuzzy search for anchor identifiers
- **Live ID**: Fuzzy search for live stream identifiers
- **Platform**: Multi-select dropdown (iOS, Android, Web)
- **Behavior**: Multi-select dropdown for tracking actions (gift_send, comment, share, follow, like)
- **App Version Range**: Start and end version inputs (format: X.Y.Z, e.g., 10.11.99)
  - Internally converts to 9-digit integer for comparison
- **Time Range**: Date-time picker with default 24-hour range
- All filters trigger via "Search" button (no auto-refresh)

### Data Display
- Paginated layout (10 items per page default)
- 5 images per row, 2 rows per screen (10 images visible)
- Images scaled to fit 160×160px containers with `object-fit: contain`
- Minimal text display (10px font) for metadata below images
- Lazy loading for images to prevent blocking
- Pagination control at bottom (supports 10/20/50 items per page)

### Image Detail Modal
- Click any image to open modal
- Displays:
  - Full-size original image (maintains aspect ratio)
  - All metadata fields
  - JSON parameters formatted for readability
  - Detail link (opens in new tab)
- Close via ESC key or overlay click
- All operations on current page (no navigation)

## Tech Stack

- **Frontend**: React 18 + Vite + Ant Design
- **Backend**: Node.js + Express
- **Data Fetching**: Axios
- **Date Handling**: Day.js

## Project Structure

```
LiveSnapReview/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── App.css        # Application styles
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   └── package.json
└── README.md
```

## Installation

### Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Documentation

### GET /api/review-items

Retrieve filtered review items with pagination.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| anchorId | string | No | Fuzzy search for anchor ID |
| liveId | string | No | Fuzzy search for live ID |
| platforms | string[] | No | Array of platform names |
| behaviors | string[] | No | Array of behavior types |
| appVersionMin | string | No | Minimum app version (X.Y.Z format) |
| appVersionMax | string | No | Maximum app version (X.Y.Z format) |
| startTime | number | No | Start timestamp (Unix milliseconds) |
| endTime | number | No | End timestamp (Unix milliseconds) |
| page | number | No | Page number (default: 1) |
| pageSize | number | No | Items per page (default: 10) |

#### Response Format

```json
{
  "total": 125,
  "items": [
    {
      "id": 1,
      "anchorId": "u12345",
      "liveId": "l67890",
      "appVersion": "10.11.99",
      "timestamp": 1731234567890,
      "platform": "iOS",
      "behavior": "gift_send",
      "behaviorParams": "{\"gift_id\":101}",
      "extraParams": "{}",
      "imageUrl": "https://cdn.example.com/frame_abc.jpg",
      "detailUrl": "https://example.com/detail?liveId=l67890&ts=1731234567890"
    }
  ]
}
```

### GET /api/health

Health check endpoint.

#### Response

```json
{
  "status": "ok"
}
```

## Version Number Conversion

App versions in X.Y.Z format are converted to 9-digit integers for range comparison:
- Format: `X.Y.Z` → `XXXYYYZZZZ`
- Example: `10.11.99` → `101199000`
- Allows partial range queries (only min or max)

## Design Specifications

- **Target Resolution**: 1920×1080 and above
- **Image Container**: 160×160px with `object-fit: contain`
- **Metadata Font Size**: 10px
- **Layout**: Compact and clean design
- **Modal Width**: 800px, centered
- **No Page Navigation**: All operations in single page

## Usage

1. Start the backend server (port 3001)
2. Start the frontend development server (port 5173)
3. Open browser to `http://localhost:5173`
4. Use filter panel to set search criteria
5. Click "Search" to fetch results
6. Click any image to view details in modal
7. Use pagination controls to navigate results

## Mock Data

The backend generates 125 mock items with:
- Random platforms (iOS, Android, Web)
- Random behaviors (gift_send, comment, share, follow, like)
- Random app versions (10.0.0 - 10.19.99)
- Timestamps within last 7 days
- Sample images from picsum.photos
- Unique anchor and live IDs

## License

MIT
