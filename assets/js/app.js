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
// Media S
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
