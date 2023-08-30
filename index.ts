import { Block } from "bdsx/bds/block";
import { BlockPos, ChunkPos, Vec3 } from "bdsx/bds/blockpos";
import { SpawnParticleEffectPacket, UpdateBlockPacket } from "bdsx/bds/packets";
import { Player, PlayerPermission, ServerPlayer } from "bdsx/bds/player";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import * as packagee from "./package.json"
import { wineCompatible } from "bdsx/winecompatible";
import { command } from "bdsx/command";
import { VoidPointer } from "bdsx/core";
import { uint32_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";

events.serverOpen.on(() => {
    console.log(`[CactusLib] Loaded`)
})


//--------------------Ticking Area Stuff--------------------
procHacker.hooking('?countActiveStandaloneTickingAreas@TickingAreasManager@@QEBAIXZ', uint32_t, { this: VoidPointer })(on_get_count);
procHacker.hooking('?countStandaloneTickingAreas@TickingAreasManager@@QEBAIXZ', uint32_t, { this: VoidPointer })(on_get_count);
function on_get_count(this: VoidPointer) { return 1; }
class AreaData {
    name: string;
    pos1: { x: number, z: number };
    pos2: { x: number, z: number };

    constructor(name: string, pos1: { x: number, z: number }, pos2: { x: number, z: number }) {
        this.name = name;
        this.pos1 = pos1;
        this.pos2 = pos2;
    }
}
//----------------------------------------------------------

export class CactusLib {
    /**
     * The CactusLib version.
     */
    static version: string = packagee.version

    /**
     * Gets a player from XUID.
     * @param xuid Player XUID.
     * @returns ServerPlayer or null.
     */
    static getPlayerFromXuid(xuid: string): ServerPlayer | null {

        return bedrockServer.level.getPlayerByXuid(xuid)
    }

    /**
     * Creates A Client Sided Block On A Player.
     * @param player ServerPlayer or Player.
     * @param blockPos Block Position.
     * @param blockId Block Id.
     */
    static createClientBlock(player: ServerPlayer | Player, blockPos: BlockPos, blockId: string) {
        const RUNTIME_ID = Block.create(blockId)!.getRuntimeId();
        const pkt = UpdateBlockPacket.allocate();
        pkt.blockPos.set(blockPos);
        pkt.blockRuntimeId = RUNTIME_ID;
        pkt.dataLayerId = UpdateBlockPacket.DataLayerIds.Normal;
        pkt.flags = UpdateBlockPacket.Flags.All;
        pkt.sendTo(player.getNetworkIdentifier());
        pkt.dispose();
    }

    /**
     * Creates A Client Sided Particle On A Player.
     * @param player ServerPlayer or Player.
     * @param blockPos Block Position.
     * @param particleName Particle Name.
     */
    static createClientParticle(player: ServerPlayer | Player, blockPos: BlockPos, particleName: string) {
        let pkt = SpawnParticleEffectPacket.allocate()
        pkt.dimensionId = player.getDimensionId()
        pkt.pos.set(blockPos)
        pkt.particleName = particleName
        pkt.sendTo(player.getNetworkIdentifier());
        pkt.dispose()
    }

    /**
     * Gets A Players Look Direction.
     * @param player ServerPlayer or Player.
     * @returns The players look direction or null. Ex: x+ or z+
     */
    static getLookDirection(player: ServerPlayer | Player): string | null {
        let yaw: string | number = player.getRotation().y
        if (yaw >= -45 && yaw <= 45) {
            return "z+"
        } else if ((yaw <= -135 && yaw > -180) || (yaw >= 135 && yaw < 180)) {
            return "z-"
        } else if (yaw > -135 && yaw < -45) {
            return "x+"
        } else if (yaw > 45 && yaw < 135) {
            return "x-"
        }
        return null
    }

    /**
     * Runs a command on the machine as Root.
     * @param command String.
     */
    static runRootCommand(command: string) {
        wineCompatible.execSync(command)
    }


    /**
     * Converts a BlockPos into a Vec3.
     * @param Vec3
     * @returns BlockPos
     */
    static Vec3toBlockPos(vector: Vec3): BlockPos {
        let blockPos = new BlockPos(true)
        blockPos.x = Math.floor(vector.x)
        blockPos.y = Math.floor(vector.y)
        blockPos.z = Math.floor(vector.z)
        return blockPos
    }
    /**
     * Converts a Vec3 into a BlockPos.
     * @param BlockPos
     * @returns Vec3
     */
    static BlockPosToVec3(blockPos: BlockPos): Vec3 {
        let vec = new Vec3(true)
        vec.x = Math.floor(blockPos.x)
        vec.y = Math.floor(blockPos.y)
        vec.z = Math.floor(blockPos.z)
        return vec
    }

    /**
     * Sets the permission level of a player. Ex: Operator, Member, Visitor
     * @param player ServerPlayer or Player.
     * @param PlayerPermission Permission Level. Ex: PlayerPermission.MEMBER
     */
    static setPermissionLevel(player: ServerPlayer | Player, permissionLevel: PlayerPermission) {
        player.getAbilities().setPlayerPermissions(permissionLevel)
        player.syncAbilities()
    }

    /**
     * Creates A Ticking Area
     * @param namePrefix String
     * @param pos1 \{ x: number, z: number }
     * @param pos2 \{ x: number, z: number }
     */
    static createTickingAreas(name: string, pos1: { x: number, z: number }, pos2: { x: number, z: number }) {
        let chunkPos1 = ChunkPos.create(
            BlockPos.create(
                pos1.x,
                0,
                pos1.z,
            )
        )

        let chunkPos2 = ChunkPos.create(
            BlockPos.create(
                pos2.x,
                0,
                pos2.z,
            )
        )

        let totalWidth = Math.abs(chunkPos1.x - chunkPos2.x) + 1;
        let totalHeight = Math.abs(chunkPos1.z - chunkPos2.z) + 1;

        let areas: AreaData[] = [];

        let z = 0;
        while (z < totalHeight) {
            const remainingHeight = totalHeight - z;
            const handlingHeight = Math.min(remainingHeight, 10);
            let x = 0;
            while (x < totalWidth) {

                const remainingWidth = totalWidth - x;
                const handlingWidth = Math.min(remainingWidth, 10);

                const originPos = {
                    x: (chunkPos1.x * 16) + (x * 16),
                    z: (chunkPos1.z * 16) + (z * 16),
                }

                x += handlingWidth;

                const endPos = {
                    x: originPos.x + (handlingWidth * 16) - 1,
                    z: originPos.z + (handlingHeight * 16) - 1,
                }

                areas.push(new AreaData(name, originPos, endPos));
            }
            z += handlingHeight;
        }

        for (const data of areas) {
            const command = `tickingarea add ` +
                `${data.pos1.x} 0 ${data.pos1.z} ` +
                `${data.pos2.x} 0 ${data.pos2.z} ` +
                `"${data.name}"`;

            bedrockServer.executeCommand(command);
        }
    }

    /**
     * Removes A Ticking Area
     * @param namePrefix String
     * @param pos1 \{ x: number, z: number }
     * @param pos2 \{ x: number, z: number }
     */
    static removeTickingAreas(name: string) {
        const command = `tickingarea remove "${name}"`;
        bedrockServer.executeCommand(command);
    }
}
