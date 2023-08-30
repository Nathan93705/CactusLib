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
event_1.events.serverOpen.on(() => {
    console.log(`[CactusLib] Loaded`);
});
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
}
exports.CactusLib = CactusLib;
/**
 * The CactusLib version.
 */
CactusLib.version = packagee.version;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBdUM7QUFDdkMsZ0RBQW1EO0FBQ25ELDhDQUFnRjtBQUVoRixzQ0FBb0M7QUFDcEMsNENBQThDO0FBQzlDLDJDQUEwQztBQUMxQyx3REFBcUQ7QUFHckQsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtBQUNyQyxDQUFDLENBQUMsQ0FBQTtBQUVGLE1BQWEsU0FBUztJQU9sQjs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQVk7UUFDakMsT0FBTyx3QkFBYSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDcEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQTZCLEVBQUUsUUFBa0IsRUFBRSxPQUFlO1FBQ3ZGLE1BQU0sVUFBVSxHQUFHLGFBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDekQsTUFBTSxHQUFHLEdBQUcsMkJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDekMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0IsR0FBRyxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUM7UUFDaEMsR0FBRyxDQUFDLFdBQVcsR0FBRywyQkFBaUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQ3hELEdBQUcsQ0FBQyxLQUFLLEdBQUcsMkJBQWlCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUN4QyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFDMUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxD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