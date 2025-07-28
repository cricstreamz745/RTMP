const NodeMediaServer = require('node-media-server');
const path = require('path');

const config = {
  logType: 3, // Optional: log only errors
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
    ffmpeg: '/usr/bin/ffmpeg', // Or just 'ffmpeg' if it's in PATH
    tasks: [
      {
        app: 'live',
        vc: 'copy',
        ac: 'aac',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: false,
        mediaRoot: path.join(__dirname, 'media'), // ✅ Important fix
        output: path.join(__dirname, 'public')    // Optional: serve from /public
      }
    ]
  }
};

const nms = new NodeMediaServer(config);

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[RTMP Publish] id=', id, 'StreamPath=', StreamPath);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[RTMP Done] id=', id, 'StreamPath=', StreamPath);
});

nms.run();
