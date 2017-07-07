export default class Match extends Phaser.State {

  //////////////////////////////
  // Phaser.State "callbacks" //
  //////////////////////////////

  init(channel) {
    this.channel = channel
    this.gameState = []
    this.spriteCache = []
    this.wrapMatrix = []
  }

  preload() {
    this.load.image('pirate', 'images/pirate.png')
    this.load.image('mute', 'images/mute.png')
    this.load.audio('chantey', 'sounds/pirates.wav')
  }

  create() {
    this.setupHUD()
    this.setupSprites()
    this.setupSounds()
    this.setupWorld()
  }

  //////////////////////
  // Helper Functions //
  //////////////////////

  setupWorld() {
    this.stage.backgroundColor = "#0000FF"
    // TODO: the following line is for development purposes only
    // remove this before releasing game
    this.stage.disableVisibilityChange = true

    this.world.setBounds(0, 0, 2500, 2500)
    this.camera.follow(this.player)
    this.camera.bounds = null
  }

  setupHUD() {
    // TODO get better mute button asset, size it correctly, add frames
    const muteButton = this.add.button(10, 10, 'mute', () => this.chantey.mute = !this.chantey.mute)
    muteButton.height = 50
    muteButton.width = 50
    muteButton.fixedToCamera = true

    this.setupChat()
  }

  setupChat() {
    const chatInput = document.querySelector("#chat-input")
    const messagesContainer = document.querySelector("#messages")

    chatInput.addEventListener("keypress", event => {
      if (event.keyCode === 13) {
        const message = chatInput.value.trim()
        if (message !== '') {
          this.channel.push("new_chatmsg", { body: chatInput.value })
          chatInput.value = ""
        }
      }
    })

    this.channel.on("new_chatmsg", payload => {
      const messageItem = document.createElement("li")
      const now = new Date()
      messageItem.innerText = `[${now.getHours()}:${(now.getMinutes() < 10 ? '0' : '') + now.getMinutes()}] ${payload.user}: ${payload.body}`
      messagesContainer.insertBefore(messageItem, messagesContainer.firstChild)
      setTimeout(() => messagesContainer.removeChild(messageItem), 8000)
    })
  }

  setupSprites() {
    this.player = this.addSprite()

    for (let [ix, x] of [0 - this.world.bounds.width, 0, this.world.bounds.width].entries())
      for (let [iy, y] of [0 - this.world.bounds.height, 0, this.world.bounds.height].entries())
        this.wrapMatrix[ix * 3 + iy] = { x: x, y: y }
  }

  setupSounds() {
    const chantey = this.add.audio('chantey')
    chantey.loopFull(0.3)
    chantey.mute = true // remember initial mute state
    this.chantey = chantey
  }

  addSprite() {
    const sprite = this.add.sprite(this.world.centerX, this.world.centerY, 'pirate')
    sprite.anchor.set(0.5)
    this.physics.enable(sprite, Phaser.Physics.ARCADE)
    sprite.body.setCircle(sprite.width / 2, 0, 0)
    return sprite
  }
}




//   update() {

//     /// Input
//     this.physics.arcade.moveToPointer(this.player, 400)
//     this.player.rotation = this.physics.arcade.angleToPointer(this.player)
//     if (Phaser.Rectangle.contains(this.player.body, this.input.worldX, this.input.worldY)) {
//       this.player.body.velocity.setTo(0, 0)
//     }

//     // Drop disconnected sprites
//     for (let charId in spriteCache) {
//       if (this.gameState.every(c => c.id != charId)) {
//         for (let sprite of spriteCache[charId]) {
//           sprite.body = null
//           sprite.destroy()
//         }
//         spriteCache.splice(charId, 1)
//       }
//     }

//     // Update and cache connected sprites
//     for (let char of this.gameState) {
//       let spriteMatrix = spriteCache[char.id] = spriteCache[char.id] || addSpriteMatrix()
//       for (let [i, m] of wrapMatrix.entries()) {
//         let sprite = spriteMatrix[i]
//         sprite.x = char.pos.x + m.x
//         sprite.y = char.pos.y + m.y
//         sprite.rotation = char.rot
//       }
//     }

//     if (trailCounter++ > trailInterval) {
//       trailCounter = 0

//       for (let pos of this.gameState.map(c => c.pos).concat(this.player)) {
//         // Draw trail
//         let trail = this.add.graphics(0, 0)
//         for (let x of [0 - this.world.bounds.width, 0, this.world.bounds.width])
//           for (let y of [0 - this.world.bounds.height, 0, this.world.bounds.height]) {
//             trail.beginFill(0xffffff)
//             trail.drawCircle(x + pos.x, y + pos.y, 3)
//             trail.endFill()
//           }
//         setTimeout(() => trail.destroy(), 3000) // Keep trail 3 seconds long
//       }
//     }

//     // Wrap this.player into this world
//     const boundsWidth = this.world.bounds.width
//     const boundsHeight = this.world.bounds.height
//     if (this.player.x > boundsWidth)
//       this.player.x = this.player.x - boundsWidth
//     if (this.player.x < 0)
//       this.player.x = boundsWidth + this.player.x
//     if (this.player.y > boundsHeight)
//       this.player.y = this.player.y - boundsHeight
//     if (this.player.y < 0)
//       this.player.y = boundsHeight + this.player.y

//     pushStateToServer()
//   }

//   render() {

//   }
// }

// function pushStateToServer() {
//   const { offsetX, offsetY, body: { rotation, position: { x, y } } } = this.player
//   this.channel.push("this.player_state", { pos: { x: x + offsetX, y: y + offsetY }, rot: Phaser.Math.degToRad(rotation) })
// }

// function addSpriteMatrix() {
//   let matrix = []
//   for (let i = 0; i < wrapMatrix.length; ++i)
//     matrix.push(addSprite())
//   return matrix
// }

// function toggleMute(/* button, pointer, isOver */) {
//   chantey.mute = !chantey.mute
// }

// function setupChat() {
//   const chatInput = document.querySelector("#chat-input")
//   const messagesContainer = document.querySelector("#messages")

//   chatInput.addEventListener("keypress", event => {
//     if (event.keyCode === 13) {
//       const message = chatInput.value.trim()
//       if (message !== '') {
//         this.channel.push("new_chatmsg", { body: chatInput.value })
//         chatInput.value = ""
//       }
//     }
//   })

//   this.channel.on("new_chatmsg", payload => {
//     const messageItem = document.createElement("li")
//     const now = new Date()
//     messageItem.innerText = `[${now.getHours()}:${(now.getMinutes() < 10 ? '0' : '') + now.getMinutes()}] ${payload.user}: ${payload.body}`
//     messagesContainer.insertBefore(messageItem, messagesContainer.firstChild)
//     setTimeout(() => messagesContainer.removeChild(messageItem), 8000)
//   })
// }
