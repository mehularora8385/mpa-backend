const WebSocket = require("ws");

let wss;

function init(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  // Auto-refresh for admin panel (every 30 seconds)
  setInterval(() => {
    broadcast({ type: "refresh_dashboard" });
  }, 30000);
}

function broadcast(data) {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = { init, broadcast };
