<div style="text-align:center"><img src="./resources/banner.png" alt="logo" width="800"/></div>

# CactusLib - A BDSX Library

CactusLib is a library of various things for plugin developers to use inside there plugins.

---

## Installation

### Installing as a standalone plugin
clone the repository in your `plugins` directory :
```shell
git clone https://github.com/Nathan93705/CactusLib.git
```

## Usage Examples

Converting a players Vec3 feetPos to a blockPos:
```ts
let playerVec3 = player.getFeetPos()
let blockPos = CactusLib.Vec3toBlockPos(playerVec3)
console.log(blockPos)
```

Create a client sided block:
```ts
CactusLib.createClientBlock(player, blokcPos, "minecraft:stone")
```

Creating and removing ticking areas:
```ts
// Creating a ticking area with the name "test"
CactusLib.createTickingAreas("test", {x: 5, z: 5}, {x: -5, z: -5})

// Removing a ticking area with the name "test"
CactusLib.removeTickingAreas("test")
```

Gettting a players scoreboard value and adding 2:
```ts
// Gets Score
let score = CactusLib.getEntityScore(player, "test")!

// Adds +2 to the score
CactusLib.setEntityScore(player, "test", score + 2)
```

---

## Credits
Library created and maintained by [@Nathan93705](https://github.com/Nathan93705)
