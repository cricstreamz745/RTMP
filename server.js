const NodeMediaServer = require('node-media-server');
const fs = require('fs');

// Load stream keys from users.json
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));

// Configuration for RTMP, HTTP, and HLS
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg', // Make sure ffmpeg is installed and path is correct
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsKeep: true, // Keeps HLS files for debugging
        mediaRoot: './media', // ✅ FIX: Location to store HLS segments
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]'
      }
    ]
  }
};

// Create NodeMediaServer instance
const nms = new NodeMediaServer(config);

// Authenticate stream key before accepting a stream
nms.on('prePublish', (id, streamPath, args) => {
  const streamKey = streamPath.split('/')[2]; // Extract key from rtmp://domain/live/KEY
  const isValid = users.some(user => user.stream_key === streamKey);

  if (!isValid) {
    console.log(`[REJECTED STREAM] Invalid stream key: ${streamKey}`);
    const session = nms.getSession(id);
    session.reject();
  } else {
    console.log(`[ACCEPTED STREAM] ${streamKey}`);
  }
});

// Start server
nms.run();
