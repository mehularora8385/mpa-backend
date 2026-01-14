// WebSocket Handler for real-time communication between Admin Panel and Mobile Devices
// Enables live exam data sync, password sharing, and device control

const WebSocket = require('ws');

class WebSocketHandler {
  constructor() {
    this.adminConnections = new Map(); // examId -> Set of admin connections
    this.deviceConnections = new Map(); // operatorId -> device connection
    this.examDevices = new Map(); // examId -> Set of device operatorIds
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws, req) => {
      const url = req.url;
      
      if (url.startsWith('/ws/admin/')) {
        this.handleAdminConnection(ws, url);
      } else if (url.startsWith('/ws/device/')) {
        this.handleDeviceConnection(ws, url);
      }
    });

    console.log('✅ WebSocket server initialized');
  }

  /**
   * Handle Admin Panel connection
   */
  handleAdminConnection(ws, url) {
    const examId = url.split('/').pop();
    
    console.log(`📱 Admin connected for exam: ${examId}`);

    if (!this.adminConnections.has(examId)) {
      this.adminConnections.set(examId, new Set());
    }
    this.adminConnections.get(examId).add(ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        this.handleAdminMessage(data, examId);
      } catch (error) {
        console.error('Error parsing admin message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`📱 Admin disconnected from exam: ${examId}`);
      this.adminConnections.get(examId).delete(ws);
    });

    ws.on('error', (error) => {
      console.error('Admin WebSocket error:', error);
    });
  }

  /**
   * Handle Device (Mobile App) connection
   */
  handleDeviceConnection(ws, url) {
    const parts = url.split('/');
    const operatorId = parts[3];
    const examId = parts[4];

    console.log(`📱 Device connected - Operator: ${operatorId}, Exam: ${examId}`);

    // Store device connection
    this.deviceConnections.set(operatorId, { ws, examId, operatorId });

    // Track devices for this exam
    if (!this.examDevices.has(examId)) {
      this.examDevices.set(examId, new Set());
    }
    this.examDevices.get(examId).add(operatorId);

    // Notify admin that device is online
    this.notifyAdminDeviceStatus(examId, operatorId, 'online');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        this.handleDeviceMessage(data, operatorId, examId);
      } catch (error) {
        console.error('Error parsing device message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`📱 Device disconnected - Operator: ${operatorId}`);
      this.deviceConnections.delete(operatorId);
      this.examDevices.get(examId).delete(operatorId);
      this.notifyAdminDeviceStatus(examId, operatorId, 'offline');
    });

    ws.on('error', (error) => {
      console.error('Device WebSocket error:', error);
    });
  }

  /**
   * Handle messages from Admin Panel
   */
  handleAdminMessage(data, examId) {
    const { type, command, data: payload } = data;

    if (type === 'COMMAND') {
      switch (command) {
        case 'SYNC_TRIGGER':
          this.broadcastToDevices(examId, { type: 'COMMAND', command: 'SYNC_TRIGGER', payload });
          break;
        case 'LOGOUT_ALL':
          this.broadcastToDevices(examId, { type: 'COMMAND', command: 'LOGOUT_ALL', payload });
          break;
        case 'SHARE_PASSWORD':
          this.broadcastToDevices(examId, { type: 'COMMAND', command: 'SHARE_PASSWORD', payload });
          break;
        case 'SHARE_EXAM_DATA':
          this.broadcastToDevices(examId, { type: 'COMMAND', command: 'SHARE_EXAM_DATA', payload });
          break;
        case 'GET_STATUS':
          this.broadcastToDevices(examId, { type: 'COMMAND', command: 'GET_STATUS', payload });
          break;
      }
    }
  }

  /**
   * Handle messages from Device
   */
  handleDeviceMessage(data, operatorId, examId) {
    const { type, payload } = data;

    switch (type) {
      case 'DEVICE_INFO':
        this.notifyAdminDeviceInfo(examId, payload);
        break;
      case 'STATUS_UPDATE':
        this.notifyAdminStatusUpdate(examId, payload);
        break;
      case 'VERIFICATION_DATA':
        this.notifyAdminVerificationData(examId, payload);
        break;
      case 'SYNC_STATUS':
        this.notifyAdminSyncStatus(examId, payload);
        break;
    }
  }

  /**
   * Broadcast command to all devices for an exam
   */
  broadcastToDevices(examId, message) {
    const deviceIds = this.examDevices.get(examId);
    if (!deviceIds) return;

    deviceIds.forEach(operatorId => {
      const device = this.deviceConnections.get(operatorId);
      if (device && device.ws.readyState === WebSocket.OPEN) {
        device.ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Notify admin about device status
   */
  notifyAdminDeviceStatus(examId, operatorId, status) {
    const adminConnections = this.adminConnections.get(examId);
    if (!adminConnections) return;

    const message = JSON.stringify({
      type: 'DEVICE_UPDATE',
      payload: {
        operatorId,
        status,
        timestamp: new Date().toISOString()
      }
    });

    adminConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Notify admin about device info
   */
  notifyAdminDeviceInfo(examId, deviceInfo) {
    const adminConnections = this.adminConnections.get(examId);
    if (!adminConnections) return;

    const message = JSON.stringify({
      type: 'DEVICE_INFO',
      payload: deviceInfo
    });

    adminConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Notify admin about device status update
   */
  notifyAdminStatusUpdate(examId, statusData) {
    const adminConnections = this.adminConnections.get(examId);
    if (!adminConnections) return;

    const message = JSON.stringify({
      type: 'DEVICE_STATUS',
      payload: statusData
    });

    adminConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Notify admin about verification data
   */
  notifyAdminVerificationData(examId, verificationData) {
    const adminConnections = this.adminConnections.get(examId);
    if (!adminConnections) return;

    const message = JSON.stringify({
      type: 'VERIFICATION_DATA',
      payload: verificationData
    });

    adminConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Notify admin about sync status
   */
  notifyAdminSyncStatus(examId, syncData) {
    const adminConnections = this.adminConnections.get(examId);
    if (!adminConnections) return;

    const message = JSON.stringify({
      type: 'SYNC_STATUS',
      payload: syncData
    });

    adminConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Get connected devices for an exam
   */
  getConnectedDevices(examId) {
    const deviceIds = this.examDevices.get(examId);
    return deviceIds ? Array.from(deviceIds) : [];
  }

  /**
   * Get device count for an exam
   */
  getDeviceCount(examId) {
    return this.getConnectedDevices(examId).length;
  }
}

module.exports = new WebSocketHandler();
