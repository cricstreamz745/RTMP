const NodeMediaServer = require('node-media-server');
const fs = require('fs');

const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));

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
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
      }
    ]
  }
};

const nms = new NodeMediaServer(config);

nms.on('prePublish', (id, streamPath, args) => {
  const streamKey = streamPath.split('/')[2];
  const valid = users.some(user => user.stream_key === streamKey);
  if (!valid) {
    const session = nms.getSession(id);
    session.reject();
  }
});

nms.run();
