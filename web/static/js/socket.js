import { Socket } from "phoenix"

const socket = new Socket("/socket")
socket.connect()

const gameChannel = socket.channel("game:lobby", {})
gameChannel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default socket
export { gameChannel }
