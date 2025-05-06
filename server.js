const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const si = require('systeminformation');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', async socket => {
  console.log('Client connected');

  const cpu = await si.cpu();
  const memData = await si.mem();
  const disks = await si.fsSize();
  const totalDisk = disks.reduce((acc, d) => acc + d.size, 0);

  socket.emit('system-info', {
    cores: cpu.cores,
    totalMem: (memData.total / (1024 ** 3)).toFixed(2),
    totalStorage: (totalDisk / (1024 ** 3)).toFixed(2)
  });

  const interval = setInterval(async () => {
    try {
      const [load, mem, disks, network] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats()
      ]);

      const totalDisk = disks.reduce((acc, d) => acc + d.size, 0);
      const usedDisk = disks.reduce((acc, d) => acc + d.used, 0);

      socket.emit('metrics', {
        cpuLoad: load.currentLoad.toFixed(2),
        memUsedPercent: ((mem.used / mem.total) * 100).toFixed(2),
        memUsedGB: (mem.used / (1024 ** 3)).toFixed(2),
        diskUsedPercent: ((usedDisk / totalDisk) * 100).toFixed(2),
        diskUsedGB: (usedDisk / (1024 ** 3)).toFixed(2),
        downloadSpeed: (network[0].rx_sec / (1024 * 1024)).toFixed(2), // Mbps
        uploadSpeed: (network[0].tx_sec / (1024 * 1024)).toFixed(2)    // Mbps
      });
    } catch (err) {
      console.error('Error getting metrics:', err);
    }
  }, 1000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

const PORT = 3002;
server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));