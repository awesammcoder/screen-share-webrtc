(function(){
  var sessionId = location.hash.trim() ? location.hash.trim().substr(1, location.hash.trim().length) : null;
  var video = document.getElementById('video-output');

  let config = {
    host: 'awesamm-peerjs-server.herokuapp.com',
    port: 4000
  };

  var app = {
    init: function(){
      this.getPort(() => {
        this.peer = this.createPeer();
        this.peerEvents();
      });
    },

    getPort: function(callback){
      $.ajax({
        url: 'https://' + config.host,
        type: 'GET',
        success: function(res){
          config.port = res.port;
          callback();
        }
      });
    },

    createPeer: function(){
      return new Peer(+new Date(), {
        path: 'server',
        host: `${config.host}`,
        port: config.port
      });
    },

    peerEvents: function(){
      this.peer.on('open', id => {

        this.peer.on('call', call => {
          call.on('stream', stream => {
            try {
              video.srcObject = stream;
            }catch(err){
              video.src = createObjectURL.URL(stream);
            }
          });

          call.answer();
        });

        this.connectToPeer();
        console.log(`Connected to Peer Server`);
      });

    },

    connectToPeer: function(){
      this.conn = this.peer.connect(sessionId);

      this.conn.on('open', () => {
        this.conn.send({
          peerId: this.peer.id,
          connId: this.conn.id,
          mainPeerId: sessionId
        });
      });

    }
  };

  function invalidSessionId(id){
    console.error("Invalid session ID", id);
  }

  if(!sessionId || +new Date(sessionId) == 'Invalid Date'){
    invalidSessionId(sessionId);
  }else{
    app.init();
  }

})();