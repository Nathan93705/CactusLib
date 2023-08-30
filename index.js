"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CactusLib = void 0;
const block_1 = require("bdsx/bds/block");
const blockpos_1 = require("bdsx/bds/blockpos");
const packets_1 = require("bdsx/bds/packets");
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const packagee = require("./package.json");
const winecompatible_1 = require("bdsx/winecompatible");
const core_1 = require("bdsx/core");
const nativetype_1 = require("bdsx/nativetype");
const prochacker_1 = require("bdsx/prochacker");
event_1.events.serverOpen.on(() => {
    console.log(`[CactusLib] Loaded`);
});
//--------------------Ticking Area Stuff--------------------
prochacker_1.procHacker.hooking('?countActiveStandaloneTickingAreas@TickingAreasManager@@QEBAIXZ', nativetype_1.uint32_t, { this: core_1.VoidPointer })(on_get_count);
prochacker_1.procHacker.hooking('?countStandaloneTickingAreas@TickingAreasManager@@QEBAIXZ', nativetype_1.uint32_t, { this: core_1.VoidPointer })(on_get_count);
function on_get_count() { return 1; }
class AreaData {
    constructor(name, pos1, pos2) {
        this.name = name;
        this.pos1 = pos1;
        this.pos2 = pos2;
    }
}
//----------------------------------------------------------
class CactusLib {
    /**
     * Gets a player from XUID.
     * @param xuid Player XUID.
     * @returns ServerPlayer or null.
     */
    static getPlayerFromXuid(xuid) {
        return launcher_1.bedrockServer.level.getPlayerByXuid(xuid);
    }
    /**
     * Creates A Client Sided Block On A Player.
     * @param player ServerPlayer or Player.
     * @param blockPos Block Position.
     * @param blockId Block Id.
     */
    static createClientBlock(player, blockPos, blockId) {
        const RUNTIME_ID = block_1.Block.create(blockId).getRuntimeId();
        const pkt = packets_1.UpdateBlockPacket.allocate();
        pkt.blockPos.set(blockPos);
        pkt.blockRuntimeId = RUNTIME_ID;
        pkt.dataLayerId = packets_1.UpdateBlockPacket.DataLayerIds.Normal;
        pkt.flags = packets_1.UpdateBlockPacket.Flags.All;
        pkt.sendTo(player.getNetworkIdentifier());
        pkt.dispose();
    }
    /**
     * Creates A Client Sided Particle On A Player.
     * @param player ServerPlayer or Player.
     * @param blockPos Block Position.
     * @param particleName Particle Name.
     */
    static createClientParticle(player, blockPos, particleName) {
        let pkt = packets_1.SpawnParticleEffectPacket.allocate();
        pkt.dimensionId = player.getDimensionId();
        pkt.pos.set(blockPos);
        pkt.particleName = particleName;
        pkt.sendTo(player.getNetworkIdentifier());
        pkt.dispose();
    }
    /**
     * Gets A Players Look Direction.
     * @param player ServerPlayer or Player.
     * @returns The players look direction or null. Ex: x+ or z+
     */
    static getLookDirection(player) {
        let yaw = player.getRotation().y;
        if (yaw >= -45 && yaw <= 45) {
            return "z+";
        }
        else if ((yaw <= -135 && yaw > -180) || (yaw >= 135 && yaw < 180)) {
            return "z-";
        }
        else if (yaw > -135 && yaw < -45) {
            return "x+";
        }
        else if (yaw > 45 && yaw < 135) {
            return "x-";
        }
        return null;
    }
    /**
     * Runs a command on the machine as Root.
     * @param command String.
     */
    static runRootCommand(command) {
        winecompatible_1.wineCompatible.execSync(command);
    }
    /**
     * Converts a BlockPos into a Vec3.
     * @param Vec3
     * @returns BlockPos
     */
    static Vec3toBlockPos(vector) {
        let blockPos = new blockpos_1.BlockPos(true);
        blockPos.x = Math.floor(vector.x);
        blockPos.y = Math.floor(vector.y);
        blockPos.z = Math.floor(vector.z);
        return blockPos;
    }
    /**
     * Converts a Vec3 into a BlockPos.
     * @param BlockPos
     * @returns Vec3
     */
    static BlockPosToVec3(blockPos) {
        let vec = new blockpos_1.Vec3(true);
        vec.x = Math.floor(blockPos.x);
        vec.y = Math.floor(blockPos.y);
        vec.z = Math.floor(blockPos.z);
        return vec;
    }
    /**
     * Sets the permission level of a player. Ex: Operator, Member, Visitor
     * @param player ServerPlayer or Player.
     * @param PlayerPermission Permission Level. Ex: PlayerPermission.MEMBER
     */
    static setPermissionLevel(player, permissionLevel) {
        player.getAbilities().setPlayerPermissions(permissionLevel);
        player.syncAbilities();
    }
    /**
     * Creates A Ticking Area
     * @param namePrefix String
     * @param pos1 \{ x: number, z: number }
     * @param pos2 \{ x: number, z: number }
     */
    static createTickingAreas(name, pos1, pos2) {
        let chunkPos1 = blockpos_1.ChunkPos.create(blockpos_1.BlockPos.create(pos1.x, 0, pos1.z));
        let chunkPos2 = blockpos_1.ChunkPos.create(blockpos_1.BlockPos.create(pos2.x, 0, pos2.z));
        let totalWidth = Math.abs(chunkPos1.x - chunkPos2.x) + 1;
        let totalHeight = Math.abs(chunkPos1.z - chunkPos2.z) + 1;
        let areas = [];
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
                };
                x += handlingWidth;
                const endPos = {
                    x: originPos.x + (handlingWidth * 16) - 1,
                    z: originPos.z + (handlingHeight * 16) - 1,
                };
                areas.push(new AreaData(name, originPos, endPos));
            }
            z += handlingHeight;
        }
        for (const data of areas) {
            const command = `tickingarea add ` +
                `${data.pos1.x} 0 ${data.pos1.z} ` +
                `${data.pos2.x} 0 ${data.pos2.z} ` +
                `"${data.name}"`;
            launcher_1.bedrockServer.executeCommand(command);
        }
    }
    /**
     * Removes A Ticking Area
     * @param namePrefix String
     * @param pos1 \{ x: number, z: number }
     * @param pos2 \{ x: number, z: number }
     */
    static removeTickingAreas(name) {
        const command = `tickingarea remove "${name}"`;
        launcher_1.bedrockServer.executeCommand(command);
    }
    /**
     * Gets the scoreboard value of an actor
     * @param entity actor
     * @param objectiveName string
     * @returns A number or null
     */
    static getEntityScore(entity, objectiveName) {
        const g_scoreboard = launcher_1.bedrockServer.level.getScoreboard();
        const objective = g_scoreboard.getObjective(objectiveName);
        if (objective === null)
            return null;
        let id;
        if (entity.isPlayer())
            id = g_scoreboard.getPlayerScoreboardId(entity);
        else
            id = g_scoreboard.getActorScoreboardId(entity);
        const info = objective.getPlayerScore(id);
        return info.valid ? info.value : null;
    }
    /**
     * Gets the scoreboard value of an actor
     * @param entity actor
     * @param objectiveName string
     * @returns A number or null
     */
    static setEntityScore(entity, objectiveName, value) {
        const g_scoreboard = launcher_1.bedrockServer.level.getScoreboard();
        const objective = g_scoreboard.getObjective(objectiveName);
        if (objective === null)
            return null;
        let id;
        if (entity.isPlayer())
            id = g_scoreboard.getPlayerScoreboardId(entity);
        else
            id = g_scoreboard.getActorScoreboardId(entity);
        g_scoreboard.setPlayerScore(id, objective, value);
    }
}
exports.CactusLib = CactusLib;
/**
 * The CactusLib version.
 */
CactusLib.version = packagee.version;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBdUM7QUFDdkMsZ0RBQTZEO0FBQzdELDhDQUFnRjtBQUVoRixzQ0FBb0M7QUFDcEMsNENBQThDO0FBQzlDLDJDQUEwQztBQUMxQyx3REFBcUQ7QUFDckQsb0NBQXdDO0FBQ3hDLGdEQUEyQztBQUMzQyxnREFBNkM7QUFJN0MsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtBQUNyQyxDQUFDLENBQUMsQ0FBQTtBQUdGLDREQUE0RDtBQUM1RCx1QkFBVSxDQUFDLE9BQU8sQ0FBQyxpRUFBaUUsRUFBRSxxQkFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLGtCQUFXLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3JJLHVCQUFVLENBQUMsT0FBTyxDQUFDLDJEQUEyRCxFQUFFLHFCQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsa0JBQVcsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDL0gsU0FBUyxZQUFZLEtBQXNCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RCxNQUFNLFFBQVE7SUFLVixZQUFZLElBQVksRUFBRSxJQUE4QixFQUFFLElBQThCO1FBQ3BGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7Q0FDSjtBQUNELDREQUE0RDtBQUU1RCxNQUFhLFNBQVM7SUFNbEI7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFZO1FBRWpDLE9BQU8sd0JBQWEsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxD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