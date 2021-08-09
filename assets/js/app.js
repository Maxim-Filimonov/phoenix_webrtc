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
  let offer = await peerConnection.createOffer();
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
  remoteStream.addTrack(event.track);
}

function handleOnIceCandidate(event) {
  if (!!event.candidate) {
    pushPeerMessage("ice-candidate", event.candidate);
  }
}

channel.on("peer-message", (payload) => {
  const message = JSON.parse(payload.body);
  switch (message.type) {
    case "video-offer":
      log("offered: ", message.content);
      answerCall(message.content);
      break;
    case "video-answer":
      log("answered: ", message.content);
      receiveRemote(message.content);
      break;
    case "ice-candidate":
      log("candidate: ", message.content);
      let candidate = new RTCIceCandidate(message.content);
      peerConnection.addIceCandidate(candidate).catch(reportError);
      break;
    case "disconnect":
      disconnect();
      break;
    default:
      reportError("unhandled message type")(message.type);
  }
});

function receiveRemote(offer) {
  let remoteDescription = new RTCSessionDescription(offer);
  console.log(offer);
  peerConnection.setRemoteDescription(remoteDescription);
}

async function answerCall(offer) {
  receiveRemote(offer);
  let answer = await peerConnection.createAnswer();
  peerConnection
    .setLocalDescription(answer)
    .then(() =>
      pushPeerMessage("video-answer", peerConnection.localDescription)
    );
}
