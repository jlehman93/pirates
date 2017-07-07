import Match from "./states/match"

export default class Game extends Phaser.Game {
  constructor(channel) {
    super(1920, 1080)

    this.state.add("match", Match)
    this.state.start("match", true, false, channel)
  }
}
