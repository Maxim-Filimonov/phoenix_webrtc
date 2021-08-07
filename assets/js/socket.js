import { Socket } from "phoenix";

let socket = new Socket("/socket", { params: { token: window.userToken } });

socket.connect();

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("video:peer2peer", {});

channel
  .join()
  .receive("ok", (resp) => {
    console.log("Joined successfully", resp);
  })
  .receive("error", (resp) => {
    console.error("Unable to join", resp);
  });

// We are only connecting to one topic so no need to export socket
//export default socket;
export default channel;
