const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data generator
function generateMockData() {
  const platforms = ['iOS', 'Android', 'Web'];
  const behaviors = ['gift_send', 'comment', 'share', 'follow', 'like'];
  const items = [];
  
  for (let i = 1; i <= 125; i++) {
    const timestamp = Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
    const version = `10.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 100)}`;
    
    items.push({
      id: i,
      anchorId: `u${10000 + i}`,
      liveId: `l${60000 + i}`,
      appVersion: version,
      appVersionInt: convertVersionToInt(version),
      timestamp: timestamp,
      platform: platform,
      behavior: behavior,
      behaviorParams: JSON.stringify({ gift_id: 100 + Math.floor(Math.random() * 50) }),
      extraParams: JSON.stringify({}),
      imageUrl: `https://picsum.photos/seed/${i}/400/400`,
      detailUrl: `https://example.com/detail?liveId=l${60000 + i}&ts=${timestamp}`
    });
  }
  
  return items;
}

// Convert version string (X.Y.Z) to 9-digit integer
function convertVersionToInt(version) {
  if (!version) return 0;
  const parts = version.split('.').map(p => parseInt(p) || 0);
  while (parts.length < 3) parts.push(0);
  
  // Format: XXXYYYZZZZ (3 digits for major, 3 for minor, 3 for patch)
  return parts[0] * 1000000 + parts[1] * 1000 + parts[2];
}

// Initialize mock data
const mockData = generateMockData();

// API endpoint
app.get('/api/review-items', (req, res) => {
  try {
    const {
      anchorId,
      liveId,
      platforms,
      behaviors,
      appVersionMin,
      appVersionMax,
      startTime,
      endTime,
      page = 1,
      pageSize = 10
    } = req.query;

    let filteredItems = [...mockData];

    // Filter by anchorId (fuzzy search)
    if (anchorId) {
      filteredItems = filteredItems.filter(item =>
        item.anchorId.toLowerCase().includes(anchorId.toLowerCase())
      );
    }

    // Filter by liveId (fuzzy search)
    if (liveId) {
      filteredItems = filteredItems.filter(item =>
        item.liveId.toLowerCase().includes(liveId.toLowerCase())
      );
    }

    // Filter by platforms (multi-select)
    if (platforms) {
      const platformArray = Array.isArray(platforms) ? platforms : [platforms];
      filteredItems = filteredItems.filter(item =>
        platformArray.includes(item.platform)
      );
    }

    // Filter by behaviors (multi-select)
    if (behaviors) {
      const behaviorArray = Array.isArray(behaviors) ? behaviors : [behaviors];
      filteredItems = filteredItems.filter(item =>
        behaviorArray.includes(item.behavior)
      );
    }

    // Filter by app version range
    if (appVersionMin) {
      const minVersionInt = convertVersionToInt(appVersionMin);
      filteredItems = filteredItems.filter(item =>
        item.appVersionInt >= minVersionInt
      );
    }

    if (appVersionMax) {
      const maxVersionInt = convertVersionToInt(appVersionMax);
      filteredItems = filteredItems.filter(item =>
        item.appVersionInt <= maxVersionInt
      );
    }

    // Filter by time range
    if (startTime) {
      const startTimestamp = parseInt(startTime);
      filteredItems = filteredItems.filter(item =>
        item.timestamp >= startTimestamp
      );
    }

    if (endTime) {
      const endTimestamp = parseInt(endTime);
      filteredItems = filteredItems.filter(item =>
        item.timestamp <= endTimestamp
      );
    }

    // Sort by timestamp descending
    filteredItems.sort((a, b) => b.timestamp - a.timestamp);

    // Pagination
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    // Remove internal fields
    const responseItems = paginatedItems.map(item => {
      const { appVersionInt, ...rest } = item;
      return rest;
    });

    res.json({
      total: filteredItems.length,
      items: responseItems
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
