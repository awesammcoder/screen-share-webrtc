(function(){
  let stream;

  const config = {
    host: 'screenshare-peerjs.herokuapp.com',
    port: 48181
  };

  const runtime = chrome.runtime;
  const socket = `${config.host}:${config.port}`;
  const EXTENSION_ID = `ckdloahlcnabmaljpbbhkcgngbfdlpbl`;

  const link = document.getElementById('link');
  const video = document.getElementById('screen-container');
  const getScreen = document.getElementById('get-screen');
  const stopScreen = document.getElementById('stop-screen');

  const request = {
    sources: ['window', 'screen', 'tab']
  };

  const app = {
    init: function(){

      this.bindEvents();
      this.postLoad();
    },

    bindEvents: function(){
      getScreen.addEventListener('click', e => {
        runtime.sendMessage(EXTENSION_ID, request, response => {
          if (response && response.type === 'success') {
            app.streamSuccess(response);
          } else {
            app.streamError(response);
          }

        });
      });

      stopScreen.addEventListener('click', event => {
        stream.getTracks().forEach(track => track.stop());
        video.src = '';
        app.toggleControls();
      });

    },

    streamSuccess: function(response){
      navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: response.streamId,
          }
        }
      }).then(returnedStream => {
        stream = returnedStream;
        try {
          video.srcObject = stream;
        }catch (err){
          video.src = URL.createObjectURL(stream);
        }

        app.toggleControls(stream);
      }).catch(err => {
        app.streamError(err);
      });
    },

    streamError: function(err){
      console.log(err);
      if(typeof(err) == 'object'){
        console.error(err);
      }else{
        console.log("Could not get stream");
      }

    },

    toggleControls: function(stream){
      if(!this.streamStatus){
        getScreen.style.display = "none";
        stopScreen.style.display = "inline";

        this.streamStatus = true;
        app.sendToSocket(stream); //send to socket server the StreamMedia object
      }else{
        stopScreen.style.display = "none";
        getScreen.style.display = "inline";

        this.streamStatus = false;
        link.href = ``;
        link.innerText = ``;
      }
    },

    postLoad: function(){
      console.log("Screen share client loaded..");
    },

    sendToSocket: function(stream){
      var peer = new Peer(+new Date(), {
        path: 'server',
        host: `${config.host}`,
        port: config.port,
        debug: 3
      });

      console.log(peer);

      peer.on('open', function(id) {
        link.href =`${location.origin}/screen.html#${id}`;
        link.innerText = `${location.origin}/screen.html#${id}`;
      });

      peer.on('connection', function(conn) {
        conn.on('data', function(data){
          peer.call(data.peerId.toString(), stream);
        });
      });

    }
  };

  app.init();
})();