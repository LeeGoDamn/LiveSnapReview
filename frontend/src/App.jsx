import { useState, useEffect } from 'react';
import { Layout, Input, Select, DatePicker, Button, Pagination, Modal, Row, Col, Card, Typography, Space, message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import './App.css';

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;
const { Text, Title, Paragraph } = Typography;

const API_BASE_URL = 'http://localhost:3001';

function App() {
  // Filter states
  const [anchorId, setAnchorId] = useState('');
  const [liveId, setLiveId] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [behaviors, setBehaviors] = useState([]);
  const [appVersionMin, setAppVersionMin] = useState('');
  const [appVersionMax, setAppVersionMax] = useState('');
  const [timeRange, setTimeRange] = useState([
    dayjs().subtract(24, 'hours'),
    dayjs()
  ]);

  // Data states
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Platform and behavior options
  const platformOptions = ['iOS', 'Android', 'Web'];
  const behaviorOptions = ['gift_send', 'comment', 'share', 'follow', 'like'];

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
      };

      if (anchorId) params.anchorId = anchorId;
      if (liveId) params.liveId = liveId;
      if (platforms.length > 0) params.platforms = platforms;
      if (behaviors.length > 0) params.behaviors = behaviors;
      if (appVersionMin) params.appVersionMin = appVersionMin;
      if (appVersionMax) params.appVersionMax = appVersionMax;
      if (timeRange && timeRange[0]) params.startTime = timeRange[0].valueOf();
      if (timeRange && timeRange[1]) params.endTime = timeRange[1].valueOf();

      const response = await axios.get(`${API_BASE_URL}/api/review-items`, { params });
      setItems(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  // Handle search button click
  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  // Handle page change
  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  };

  // Handle image click
  const handleImageClick = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  // Format JSON display
  const formatJSON = (jsonString) => {
    try {
      const obj = JSON.parse(jsonString);
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonString || '—';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={3} style={{ margin: '16px 0' }}>Live Stream Review System</Title>
      </Header>
      
      <Content style={{ padding: '24px', maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
        {/* Filter Panel */}
        <Card 
          title="Filter Criteria" 
          style={{ marginBottom: '24px' }}
          bodyStyle={{ padding: '24px' }}
        >
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Text strong>Anchor ID:</Text>
              <Input 
                placeholder="Search anchor ID" 
                value={anchorId}
                onChange={(e) => setAnchorId(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Text strong>Live ID:</Text>
              <Input 
                placeholder="Search live ID" 
                value={liveId}
                onChange={(e) => setLiveId(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Text strong>Platform:</Text>
              <Select
                mode="multiple"
                placeholder="Select platforms"
                value={platforms}
                onChange={setPlatforms}
                options={platformOptions.map(p => ({ label: p, value: p }))}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <Text strong>Behavior:</Text>
              <Select
                mode="multiple"
                placeholder="Select behaviors"
                value={behaviors}
                onChange={setBehaviors}
                options={behaviorOptions.map(b => ({ label: b, value: b }))}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={6}>
              <Text strong>Min Version (X.Y.Z):</Text>
              <Input 
                placeholder="e.g., 10.11.0" 
                value={appVersionMin}
                onChange={(e) => setAppVersionMin(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Text strong>Max Version (X.Y.Z):</Text>
              <Input 
                placeholder="e.g., 10.11.99" 
                value={appVersionMax}
                onChange={(e) => setAppVersionMax(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={12}>
              <Text strong>Time Range:</Text>
              <RangePicker
                showTime
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: '100%' }}
                format="YYYY-MM-DD HH:mm:ss"
              />
            </Col>
          </Row>
          
          <Row style={{ marginTop: '24px' }}>
            <Col span={24}>
              <Button type="primary" size="large" onClick={handleSearch} loading={loading}>
                Search
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Image Gallery */}
        <Card 
          title={`Results (${total} items)`}
          bodyStyle={{ padding: '24px' }}
        >
          <Row gutter={[16, 16]}>
            {items.map((item) => (
              <Col key={item.id} span={4.8} style={{ maxWidth: '20%' }}>
                <Card
                  hoverable
                  cover={
                    <div style={{ 
                      width: '100%', 
                      height: '160px', 
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5'
                    }}>
                      <img
                        alt={item.liveId}
                        src={item.imageUrl}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          objectFit: 'contain' 
                        }}
                        loading="lazy"
                        onClick={() => handleImageClick(item)}
                      />
                    </div>
                  }
                  bodyStyle={{ padding: '8px' }}
                >
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Text style={{ fontSize: '10px' }}>Anchor: {item.anchorId}</Text>
                    <Text style={{ fontSize: '10px' }}>Live: {item.liveId}</Text>
                    <Text style={{ fontSize: '10px' }}>Platform: {item.platform}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <Row justify="center" style={{ marginTop: '24px' }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              showTotal={(total) => `Total ${total} items`}
            />
          </Row>
        </Card>
      </Content>

      {/* Detail Modal */}
      <Modal
        title="Frame Details"
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        centered
      >
        {selectedItem && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.liveId}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
              />
            </div>
            
            <Row gutter={[16, 8]}>
              <Col span={8}><Text strong>Anchor ID:</Text></Col>
              <Col span={16}><Text>{selectedItem.anchorId}</Text></Col>
              
              <Col span={8}><Text strong>Live ID:</Text></Col>
              <Col span={16}><Text>{selectedItem.liveId}</Text></Col>
              
              <Col span={8}><Text strong>App Version:</Text></Col>
              <Col span={16}><Text>{selectedItem.appVersion}</Text></Col>
              
              <Col span={8}><Text strong>Timestamp:</Text></Col>
              <Col span={16}><Text>{dayjs(selectedItem.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text></Col>
              
              <Col span={8}><Text strong>Platform:</Text></Col>
              <Col span={16}><Text>{selectedItem.platform}</Text></Col>
              
              <Col span={8}><Text strong>Behavior:</Text></Col>
              <Col span={16}><Text>{selectedItem.behavior}</Text></Col>
              
              <Col span={8}><Text strong>Behavior Params:</Text></Col>
              <Col span={16}>
                <pre style={{ margin: 0, fontSize: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                  {formatJSON(selectedItem.behaviorParams)}
                </pre>
              </Col>
              
              <Col span={8}><Text strong>Extra Params:</Text></Col>
              <Col span={16}>
                <pre style={{ margin: 0, fontSize: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                  {formatJSON(selectedItem.extraParams)}
                </pre>
              </Col>
              
              <Col span={8}><Text strong>Detail URL:</Text></Col>
              <Col span={16}>
                <a href={selectedItem.detailUrl} target="_blank" rel="noopener noreferrer">
                  {selectedItem.detailUrl}
                </a>
              </Col>
            </Row>
          </Space>
        )}
      </Modal>
    </Layout>
  );
}

export default App;
