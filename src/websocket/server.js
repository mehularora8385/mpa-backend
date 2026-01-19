const WebSocket = require('ws');
const { Op } = require('sequelize');

// Create WebSocket server
const wss = new WebSocket.Server({ 
  port: process.env.WS_PORT || 8080,
  path: process.env.WS_PATH || '/ws'
});

// Store connected admin clients
const adminClients = new Map();

// Generate unique client ID
const generateClientId = () => {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  adminClients.set(clientId, {
    ws,
    subscriptions: [],
    connectedAt: new Date(),
    ip: req.socket.remoteAddress
  });
  
  console.log(`WebSocket client connected: ${clientId} from ${req.socket.remoteAddress}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    clientId: clientId,
    timestamp: new Date().toISOString(),
    message: 'WebSocket connection established'
  }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const client = adminClients.get(clientId);
      
      if (!client) {
        console.error(`Client not found: ${clientId}`);
        return;
      }
      
      switch (data.type) {
        case 'subscribe':
          // Admin subscribes to exam updates
          if (data.examId) {
            if (!client.subscriptions.includes(data.examId)) {
              client.subscriptions.push(data.examId);
            }
            
            ws.send(JSON.stringify({
              type: 'subscribed',
              examId: data.examId,
              timestamp: new Date().toISOString(),
              message: `Subscribed to exam ${data.examId}`
            }));
            
            console.log(`Client ${clientId} subscribed to exam ${data.examId}`);
          }
          break;
          
        case 'unsubscribe':
          // Admin unsubscribes from exam updates
          if (data.examId) {
            client.subscriptions = client.subscriptions.filter(id => id !== data.examId);
            
            ws.send(JSON.stringify({
              type: 'unsubscribed',
              examId: data.examId,
              timestamp: new Date().toISOString(),
              message: `Unsubscribed from exam ${data.examId}`
            }));
            
            console.log(`Client ${clientId} unsubscribed from exam ${data.examId}`);
          }
          break;
          
        case 'ping':
          // Keep-alive ping
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
          break;
          
        default:
          console.log(`Unknown message type from ${clientId}: ${data.type}`);
      }
      
    } catch (error) {
      console.error(`Error processing message from ${clientId}:`, error);
    }
  });
  
  // Handle disconnection
  ws.on('close', (code, reason) => {
    adminClients.delete(clientId);
    console.log(`WebSocket client disconnected: ${clientId}. Code: ${code}, Reason: ${reason}`);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });
});

// Broadcast to admins subscribed to specific exam
const broadcastToExam = (examId, data) => {
  let sentCount = 0;
  
  adminClients.forEach((client, clientId) => {
    if (client.subscriptions.includes(examId) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'update',
        examId: examId,
        data: data,
        timestamp: new Date().toISOString()
      }));
      
      sentCount++;
    }
  });
  
  console.log(`Broadcasted update for exam ${examId} to ${sentCount} clients`);
  return sentCount;
};

// Broadcast to all connected admins
const broadcastToAll = (data) => {
  let sentCount = 0;
  
  adminClients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'broadcast',
        data: data,
        timestamp: new Date().toISOString()
      }));
      
      sentCount++;
    }
  });
  
  console.log(`Broadcasted message to ${sentCount} clients`);
  return sentCount;
};

// Get connection statistics
const getStats = () => {
  const stats = {
    totalClients: adminClients.size,
    activeConnections: 0,
    subscriptions: {},
    uptime: process.uptime()
  };
  
  adminClients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      stats.activeConnections++;
      
      client.subscriptions.forEach(examId => {
        if (!stats.subscriptions[examId]) {
          stats.subscriptions[examId] = 0;
        }
        stats.subscriptions[examId]++;
      });
    }
  });
  
  return stats;
};

// Send keep-alive pings every 30 seconds
setInterval(() => {
  const payload = JSON.stringify({
    type: 'keepalive',
    timestamp: new Date().toISOString()
  });
  
  adminClients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    } else {
      // Remove disconnected clients
      adminClients.delete(clientId);
    }
  });
}, 30000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing WebSocket server...');
  
  wss.clients.forEach(ws => {
    ws.close(1000, 'Server shutting down');
  });
  
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

module.exports = {
  wss,
  broadcastToExam,
  broadcastToAll,
  getStats
};