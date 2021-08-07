defmodule PhoenixWebrtcWeb.VideoChannel do
  use Phoenix.Channel

  # Setup subtopic - video:pee2peer
  def join("video:peer2peer", _message, socket) do
    {:ok, socket}
  end

  def handle_in("peer-message", %{"body" => body}, socket) do
    # Broadcast to all other sockets the message
    broadcast_from!(socket, "peer-message", %{body: body})
    {:noreply, socket}
  end
end
