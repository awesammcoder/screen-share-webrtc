(function(){
  var sessionId = location.hash.trim() ? location.hash.trim().substr(1, location.hash.trim().length) : null;
  var video = document.getElementById('video-output');

  const config = {
    host: 'screen-share-peerjs-screen-share-peerjs.7e14.starter-us-west-2.openshiftapps.com',
    port: 5000
  };

  var app = {
    init: function(){
      this.peer = this.createPeer();
      this.peerEvents();
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