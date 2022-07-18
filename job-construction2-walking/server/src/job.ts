import * as alt from 'alt-server';
import { ServerMarkerController } from '../../../../server/streamers/marker';
import { ServerBlipController } from '../../../../server/systems/blip';
import { InteractionController } from '../../../../server/systems/interaction';
import { Job } from '../../../../server/systems/job';
import { MARKER_TYPE } from '../../../../shared/enums/markerTypes';
import { Objective } from '../../../../shared/interfaces/job';
import { Vector3 } from '../../../../shared/interfaces/vector';
import JOB_DATA from './data';
import JobEnums from '../../../../shared/interfaces/job';
import { CurrencyTypes } from '../../../../shared/enums/currency';
import { Athena } from '../../../../server/api/athena';
import { ANIMATION_FLAGS } from '../../../../shared/flags/animationFlags';
import { EXAMPLE_NPC_INTERACT } from '../../../example-npc-interact/shared/info';
import { PedController } from '../../../../server/streamers/ped';
import { PED_CONFIG_FLAG } from '../../../../shared/flags/pedflags';
import { emitServer } from 'alt-client';
import { ClientEvents } from '../../../../server/events/clientEvents';
import { PluginSystem } from '../../../../server/systems/plugins';
import { UID } from '../../../../client/utility/uid';
import { distance2d } from '../../../../shared/utility/vector';

const START_POINT = { x: -97.01538, y: -1013.67035, z: 26.27478 };
const TOTAL_DROP_OFFS = 1;

export class Constworker2Job {
    /**
     * Create In-World Job Location(s)
     * @static
     * @memberof Job
     */
    static init() {
        ServerBlipController.append({
            sprite: 480,
            color: 5,
            pos: START_POINT,
            scale: 0.6,
            shortRange: true,
            text: 'Construction Working',
        });

        ServerMarkerController.append({
            pos: START_POINT,
            color: new alt.RGBA(255, 255, 255, 150),
            type: MARKER_TYPE.CYLINDER,
            scale: new alt.Vector3(1, 1, 1),
        });

        InteractionController.add({
            callback: Constworker2Job.begin,
            description: 'Set up the Construction',
            position: START_POINT,
            range: 2,
            isPlayerOnly: true,
        });
    }

    /**
     * Call this to start the job. Usually called through interaction point.
     * @static
     * @param {alt.Player} player
     * @memberof Job
     */
    static async begin(player: alt.Player) {
        const openSpot = await Constworker2Job.getStartingPoint();
        if (!openSpot) {
            Athena.player.emit.notification(player, `~r~No room for starting the job. Please wait...`);
            return;
        }

        const randomPoints1 = Constworker2Job.getRandomPoints1(TOTAL_DROP_OFFS);
        const objectives: Array<Objective> = [];
        objectives.push({
            description: 'Start your job',
            type: JobEnums.ObjectiveType.WAYPOINT,
            pos: openSpot.pos,
            range: 4,
            marker: {
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z - 1,
                },
                type: MARKER_TYPE.CYLINDER,
                color: new alt.RGBA(0, 255, 0, 100),
            },
            textLabel: {
                data: 'Get your Tools',
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z + 1.5,
                },
            },
            criteria:
                JobEnums.ObjectiveCriteria.NO_DYING,
            callbackOnStart: (player: alt.Player) => {
                Athena.player.emit.message(player, '/quitjob - To stop this job.');
                Athena.player.emit.notification(player, `Get your  Tools`);
            },
        });

        for (let i = 0; i < randomPoints1.length; i++) {
            const rPoint1 = randomPoints1[i];
            objectives.push({
                description: 'Adjust the Working Tools',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint1,
                range: 2,
                marker: {
                    pos: rPoint1,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Workspot',
                    pos: {
                        x: rPoint1.x,
                        y: rPoint1.y,
                        z: rPoint1.z + 1.5,
                    },
                },
                blip: {
                    text: 'Workspot',
                    color: 2,
                    pos: rPoint1,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Get to the Workspot`);
                    Athena.player.emit.animation(player, `amb@world_human_hammering@male@base`, 'base', ANIMATION_FLAGS.REPEAT, 3);
                },
                callbackOnFinish: (player: alt.Player) => {
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You did the Checkpoint`);
                },
            });
        }

        const randomPoints2 = Constworker2Job.getRandomPoints2(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints2.length; i++) {
            const rPoint2 = randomPoints2[i];
            const distance2 = distance2d(player.pos, rPoint2)
            objectives.push({
                description: 'Adjust the Working Tools',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint2,
                range: 2,
                marker: {
                    pos: rPoint2,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Workspot',
                    pos: {
                        x: rPoint2.x,
                        y: rPoint2.y,
                        z: rPoint2.z + 1.5,
                    },
                },
                blip: {
                    text: 'Workspot',
                    color: 2,
                    pos: rPoint2,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Get to the Workspot`);
                    Athena.player.emit.animation(player, `amb@world_human_hammering@male@base`, 'base', ANIMATION_FLAGS.REPEAT, 3);
                },
                callbackOnFinish: (player: alt.Player) => {
                    const extra = Math.floor(distance2 * 0.1)
                    Athena.player.currency.add(player, CurrencyTypes.CASH, extra);
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You found money: ~g~$${extra}`);
                    Athena.player.emit.notification(player, `You did the Checkpoint`);
                },
            });
        }

        const randomPoints3 = Constworker2Job.getRandomPoints3(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints3.length; i++) {
            const rPoint3 = randomPoints3[i];
            objectives.push({
                description: 'Adjust the Working Tools',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint3,
                range: 2,
                marker: {
                    pos: rPoint3,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Workspot',
                    pos: {
                        x: rPoint3.x,
                        y: rPoint3.y,
                        z: rPoint3.z + 1.5,
                    },
                },
                blip: {
                    text: 'Workspot',
                    color: 2,
                    pos: rPoint3,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Get to the Workspot`);
                    Athena.player.emit.animation(player, `amb@world_human_hammering@male@base`, 'base', ANIMATION_FLAGS.REPEAT, 3);
                },
                callbackOnFinish: (player: alt.Player) => {
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You did the Checkpoint`);
                },
            });
        }

        const randomPoints4 = Constworker2Job.getRandomPoints4(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints4.length; i++) {
            const rPoint4 = randomPoints4[i];
            const distance4 = distance2d(player.pos, rPoint4)
            objectives.push({
                description: 'Adjust the Working Tools',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint4,
                range: 2,
                marker: {
                    pos: rPoint4,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Workspot',
                    pos: {
                        x: rPoint4.x,
                        y: rPoint4.y,
                        z: rPoint4.z + 1.5,
                    },
                },
                blip: {
                    text: 'Workspot',
                    color: 2,
                    pos: rPoint4,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Get to the Workspot`);
                    Athena.player.emit.animation(player, `amb@world_human_hammering@male@base`, 'base', ANIMATION_FLAGS.REPEAT, 3);
                },
                callbackOnFinish: (player: alt.Player) => {
                    const extra = Math.floor(distance4 * 0.1)
                    Athena.player.currency.add(player, CurrencyTypes.CASH, extra);
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You found money: ~g~$${extra}`);
                    Athena.player.emit.notification(player, `You did the Checkpoint`);
                },
            });
        }

        const randomPoints5 = Constworker2Job.getRandomPoints5(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints5.length; i++) {
            const rPoint5 = randomPoints5[i];
            const distance5 = distance2d(player.pos, rPoint5)
            objectives.push({
                description: 'Adjust the Working Tools',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint5,
                range: 2,
                marker: {
                    pos: rPoint5,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Workspot',
                    pos: {
                        x: rPoint5.x,
                        y: rPoint5.y,
                        z: rPoint5.z + 1.5,
                    },
                },
                blip: {
                    text: 'Workspot',
                    color: 2,
                    pos: rPoint5,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Get to the Workspot`);
                    Athena.player.emit.animation(player, `amb@world_human_hammering@male@base`, 'base', ANIMATION_FLAGS.REPEAT, 3);
                },
                callbackOnFinish: (player: alt.Player) => {
                    const extra = Math.floor(distance5 * 0.1)
                    Athena.player.currency.add(player, CurrencyTypes.CASH, extra);
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You found money: ~g~$${extra}`);
                    Athena.player.emit.notification(player, `You did the Checkpoint`);
                },
            });
        }

        const randomPoints6 = Constworker2Job.getRandomPoints6(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints6.length; i++) {
            const rPoint6 = randomPoints6[i];
            const distance6 = distance2d(player.pos, rPoint6)
            objectives.push({
                description: 'Adjust the Working Tools',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint6,
                range: 2,
                marker: {
                    pos: rPoint6,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Workspot',
                    pos: {
                        x: rPoint6.x,
                        y: rPoint6.y,
                        z: rPoint6.z + 1.5,
                    },
                },
                blip: {
                    text: 'Workspot',
                    color: 2,
                    pos: rPoint6,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Get to the Workspot`);
                    Athena.player.emit.animation(player, `amb@world_human_hammering@male@base`, 'base', ANIMATION_FLAGS.REPEAT, 3);
                },
                callbackOnFinish: (player: alt.Player) => {
                    const extra = Math.floor(distance6 * 0.1)
                    Athena.player.currency.add(player, CurrencyTypes.CASH, extra);
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You found money: ~g~$${extra}`);
                    Athena.player.emit.notification(player, `You did the Checkpoint`);
                },
            });
        }

        objectives.push({
            description: 'Drop Off our Tools',
            type: JobEnums.ObjectiveType.WAYPOINT,
            pos: openSpot.pos,
            range: 4,
            marker: {
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z - 1,
                },
                type: MARKER_TYPE.CYLINDER,
                color: new alt.RGBA(0, 255, 0, 100),
            },
            blip: {
                text: 'Get your Tools back',
                color: 2,
                pos: openSpot.pos,
                scale: 1,
                shortRange: true,
                sprite: 271,
            },
            textLabel: {
                data: 'Get your Tools back',
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z + 1.5,
                },
            },
            criteria:
                JobEnums.ObjectiveCriteria.NO_DYING,
            callbackOnStart: (player: alt.Player) => {
                Athena.player.emit.notification(player, `Get your Tools back`);
            },
            callbackOnFinish: (player: alt.Player) => {
                // Payout 100 - 200; Random;
                const earned = Math.floor(Math.random() * 100) + 100;
                Athena.player.currency.add(player, CurrencyTypes.CASH, earned);
                Athena.player.emit.notification(player, `~g~$${earned}`);
            },
        });

        const job = new Job();
        /*job.addVehicle(
            player,
            'bulldozer',
            openSpot.pos,
            openSpot.rot,
            new alt.RGBA(120, 120, 0, 255),
            new alt.RGBA(120, 120, 0, 255),
        );*/

        job.loadObjectives(objectives);
        job.addPlayer(player);
    }

    /**
     * Creates and checks if a vehicle is in a spot and returns a spot if it is open.
     * @static
     * @return {({ pos: Vector3; rot: Vector3 })}
     * @memberof Constworker2Job
     */
    static async getStartingPoint(): Promise<{ pos: Vector3; rot: Vector3 }> {
        for (let i = 0; i < JOB_DATA.STARTING_POINT.length; i++) {
            const point = JOB_DATA.STARTING_POINT[i];
            const pointTest = new alt.ColshapeSphere(point.pos.x, point.pos.y, point.pos.z - 1, 2);

            // Have to do a small sleep to the ColShape propogates entities inside of it.
            await new Promise((resolve: Function) => {
                alt.setTimeout(() => {
                    resolve();
                }, 250);
            });

            const spaceOccupied = alt.Player.all.find((player) => pointTest.isEntityIn(player));

            try {
                pointTest.destroy();
            } catch (err) { }

            if (spaceOccupied) {
                continue;
            }

            return point;
        }

        return null;
    }

    /**
     * Get random point from list of points.
     * @static
     * @return {Array<Vector3>}
     * @memberof Job
     */
    static getRandomPoints1(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_OFF_SPOTS1[Math.floor(Math.random() * JOB_DATA.DROP_OFF_SPOTS1.length)]);
        }

        return points;
    }

    static getRandomPoints2(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_OFF_SPOTS2[Math.floor(Math.random() * JOB_DATA.DROP_OFF_SPOTS2.length)]);
        }

        return points;
    }

    static getRandomPoints3(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_OFF_SPOTS3[Math.floor(Math.random() * JOB_DATA.DROP_OFF_SPOTS3.length)]);
        }

        return points;
    }

    static getRandomPoints4(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_OFF_SPOTS4[Math.floor(Math.random() * JOB_DATA.DROP_OFF_SPOTS4.length)]);
        }

        return points;
    }

    static getRandomPoints5(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_OFF_SPOTS5[Math.floor(Math.random() * JOB_DATA.DROP_OFF_SPOTS5.length)]);
        }

        return points;
    }

    static getRandomPoints6(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_OFF_SPOTS6[Math.floor(Math.random() * JOB_DATA.DROP_OFF_SPOTS6.length)]);
        }

        return points;
    }
}
