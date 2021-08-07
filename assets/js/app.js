// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.css";

import "phoenix_html";

import channel from "./socket";

const connectButton = document.getElementById("connect");
const callButton = document.getElementById("call");
const disconnectButton = document.getElementById("disconnect");

const remoteVideo = document.getElementById("remote-stream");
const localVideo = document.getElementById("local-stream");
// Media Stream
const remoteStream = new MediaStream();

setVideoStream(remoteVideo, remoteStream);

let peerConnection;

disconnect.disabled = true;
call.disabled = true;
connectButton.onclick = connect;
callButton.onclick = call;
disconnectButton.onclick = disconnect;

const reportError = (where) => (error) => {
  console.error(where, error);
};

function log() {
  console.log(...arguments);
}

function setVideoStream(videoElement, stream) {
  videoElement.srcObject = stream;
}
function unsetVideoStream(videoElement) {
  if (videoElement.srcObject) {
    // stop tracks before disconnecting
    videoElement.srcObject.getTracks().forEach((track) => track.stop());
  }
  videoElement.removeAttribute("src");
  videoElement.removeAttribute("srcObject");
}
async function connect() {
  connectButton.disabled = true;
  disconnectButton.disabled = false;
  callButton.disabled = false;

  try {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setVideoStream(localVideo, localStream);
    peerConnection = createPeerConnection(localStream);
  } catch (error) {
    console.error(error);
  }
}

function disconnect() {
  connectButton.disabled = false;
  disconnectButton.disabled = true;
  callButton.disabled = true;
  unsetVideoStream(localVideo);
  unsetVideoStream(remoteVideo);
  remoteStream = new MediaStream();

  setVideoStream(remoteVideo, remoteStream);
  peerConnection.close();
  peerConnection.ontrack = null;
  peerConnection.onicecandidate = null;
  peerConnection = null;
}

function createPeerConnection(stream) {
  const pc = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org",
      },
    ],
  });
  pc.ontrack = handleOnTrack;
  pc.onicecandidate = handleOnIceCandidate;
  stream.getTracks().forEach((track) => pc.addTrack(track));
  return pc;
}

async function call() {
  let offer = peerConnection.createOffer();
  peerConnection.setLocalDescription(offer);
  pushPeerMessage("video-offer", offer);
}

function pushPeerMessage(type, content) {
  channel.push("peer-message", {
    body: JSON.stringify({
      type,
      content,
    }),
  });
}

function handleOnTrack(event) {
  log(event);
}

function handleOnIceCandidate(event) {
  log(event);
}
