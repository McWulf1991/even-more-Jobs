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

const START_POINT = { x: 265.97039794921875, y: 2598.63232421875, z: 44.80232620239258 - 1 };
const TOTAL_DROP_OFFS = 1;
const TOTAL_MONEY_VALUE = 1;

export class RepairdriverJob {
    /**
     * Create In-World Job Location(s)
     * @static
     * @memberof Job
     */
    static init() {
        ServerBlipController.append({
            sprite: 745,
            color: 7,
            pos: START_POINT,
            scale: 0.6,
            shortRange: true,
            text: 'Repairdriver Job',
        });

        ServerMarkerController.append({
            pos: START_POINT,
            color: new alt.RGBA(255, 255, 255, 150),
            type: MARKER_TYPE.CYLINDER,
            scale: new alt.Vector3(1, 1, 1),
        });

        InteractionController.add({
            callback: RepairdriverJob.begin,
            description: 'Get to your spot and hook some Vehicles',
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
        const openSpot = await RepairdriverJob.getVehicleSpawnPoint();
        if (!openSpot) {
            Athena.player.emit.notification(player, `~r~No room for vehicles right now. Please wait...`);
            return;
        }

        const randomPoints1 = RepairdriverJob.getRandomPoints1(TOTAL_DROP_OFFS);
        const objectives: Array<Objective> = [];
        objectives.push({
            description: 'Enter the Vehicle',
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
                data: 'Get in Vehicle',
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z + 1.5,
                },
            },
            criteria:
                JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                JobEnums.ObjectiveCriteria.NO_DYING,
            callbackOnStart: (player: alt.Player) => {
                Athena.player.emit.message(player, '/quitjob - To stop this job.');
                Athena.player.emit.notification(player, `Get in the Flatbed`);
            },
        });

        for (let i = 0; i < randomPoints1.length; i++) {
            const rPoint1 = randomPoints1[i];
            objectives.push({
                description: 'Collect the Vehicle',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint1,
                range: 2,
                marker: {
                    pos: rPoint1,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Collect Point',
                    pos: {
                        x: rPoint1.x,
                        y: rPoint1.y,
                        z: rPoint1.z + 1.5,
                    },
                },
                blip: {
                    text: 'Collect Point',
                    color: 2,
                    pos: rPoint1,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                    JobEnums.ObjectiveCriteria.VEHICLE_HOOKED |
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Collect the Vehicle`);
                    Athena.vehicle.funcs.tempVehicle(player, 'primo', rPoint1, rPoint1, false);
                },
                callbackOnFinish: (player: alt.Player) => {
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You have collected the Vehicle`);
                },
            });
        }

        const randomPoints2 = RepairdriverJob.getRandomPoints2(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints2.length; i++) {
            const rPoint2 = randomPoints2[i];
            objectives.push({
                description: 'Drop Off the Vehicle',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint2,
                range: 2,
                marker: {
                    pos: rPoint2,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Drop Off Point',
                    pos: {
                        x: rPoint2.x,
                        y: rPoint2.y,
                        z: rPoint2.z + 1.5,
                    },
                },
                blip: {
                    text: 'Drop Off Point',
                    color: 2,
                    pos: rPoint2,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.IN_VEHICLE |
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Drop off the Vehicle and drive it in the Workshop`);
                },
                callbackOnFinish: (player: alt.Player) => {
                    const extra = RepairdriverJob.getRandomMoney(TOTAL_MONEY_VALUE)
                    for (let i = 0; i < extra.length; i++) {
                        const exmoney = extra[i];
                        Athena.player.currency.add(player, CurrencyTypes.CASH, exmoney);
                        Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                        Athena.player.emit.notification(player, `You have dropped off the Vehicle`);
                        Athena.player.emit.notification(player, `You earned extramoney: ~g~$${exmoney}`);
                    };
                },
            });
        }

        const randomPoints3 = RepairdriverJob.getRandomPoints3(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints3.length; i++) {
            const rPoint3 = randomPoints3[i];
            objectives.push({
                description: 'Collect the Vehicle',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint3,
                range: 2,
                marker: {
                    pos: rPoint3,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Collect Point',
                    pos: {
                        x: rPoint3.x,
                        y: rPoint3.y,
                        z: rPoint3.z + 1.5,
                    },
                },
                blip: {
                    text: 'Collect Point',
                    color: 2,
                    pos: rPoint3,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                    JobEnums.ObjectiveCriteria.VEHICLE_HOOKED |
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Collect the Vehicle`);
                    Athena.vehicle.funcs.tempVehicle(player, 'chino', rPoint3, rPoint3, false);
                },
                callbackOnFinish: (player: alt.Player) => {
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You have collected the Vehicle`);
                },
            });
        }

        const randomPoints4 = RepairdriverJob.getRandomPoints4(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints4.length; i++) {
            const rPoint4 = randomPoints4[i];
            objectives.push({
                description: 'Drop Off Vehicle',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint4,
                range: 2,
                marker: {
                    pos: rPoint4,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Drop Off Point',
                    pos: {
                        x: rPoint4.x,
                        y: rPoint4.y,
                        z: rPoint4.z + 1.5,
                    },
                },
                blip: {
                    text: 'Drop Off Point',
                    color: 2,
                    pos: rPoint4,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.IN_VEHICLE |
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Drop off the Vehicle and drive it in the Workshop`);
                },
                callbackOnFinish: (player: alt.Player) => {
                    const extra = RepairdriverJob.getRandomMoney(TOTAL_MONEY_VALUE)
                    for (let i = 0; i < extra.length; i++) {
                        const exmoney = extra[i];
                        Athena.player.currency.add(player, CurrencyTypes.CASH, exmoney);
                        Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                        Athena.player.emit.notification(player, `You have dropped off the Vehicle`);
                        Athena.player.emit.notification(player, `You earned extramoney: ~g~$${exmoney}`);
                    };
                },
            });
        }

        const randomPoints5 = RepairdriverJob.getRandomPoints5(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints5.length; i++) {
            const rPoint5 = randomPoints5[i];
            objectives.push({
                description: 'Collect the Vehicle',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint5,
                range: 2,
                marker: {
                    pos: rPoint5,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Collect Point',
                    pos: {
                        x: rPoint5.x,
                        y: rPoint5.y,
                        z: rPoint5.z + 1.5,
                    },
                },
                blip: {
                    text: 'Collect Point',
                    color: 2,
                    pos: rPoint5,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                    JobEnums.ObjectiveCriteria.VEHICLE_HOOKED |
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Collect the Vehicle`);
                    Athena.vehicle.funcs.tempVehicle(player, 'glendale', rPoint5, rPoint5, false);
                },
                callbackOnFinish: (player: alt.Player) => {
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You have collected the Vehicle`);
                },
            });
        }

        const randomPoints6 = RepairdriverJob.getRandomPoints6(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints6.length; i++) {
            const rPoint6 = randomPoints6[i];
            objectives.push({
                description: 'Drop Off Vehicle',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint6,
                range: 2,
                marker: {
                    pos: rPoint6,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Drop Off Point',
                    pos: {
                        x: rPoint6.x,
                        y: rPoint6.y,
                        z: rPoint6.z + 1.5,
                    },
                },
                blip: {
                    text: 'Drop Off Point',
                    color: 2,
                    pos: rPoint6,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.IN_VEHICLE |
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Drop off the Vehicle and drive it in the Workshop`);
                },
                callbackOnFinish: (player: alt.Player) => {
                    const extra = RepairdriverJob.getRandomMoney(TOTAL_MONEY_VALUE)
                    for (let i = 0; i < extra.length; i++) {
                        const exmoney = extra[i];
                        Athena.player.currency.add(player, CurrencyTypes.CASH, exmoney);
                        Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                        Athena.player.emit.notification(player, `You have dropped off the Vehicle`);
                        Athena.player.emit.notification(player, `You earned extramoney: ~g~$${exmoney}`);
                    };
                },
            });
        }

        const randomPoints7 = RepairdriverJob.getRandomPoints7(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints7.length; i++) {
            const rPoint7 = randomPoints7[i];
            objectives.push({
                description: 'Collect the Vehicle',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint7,
                range: 2,
                marker: {
                    pos: rPoint7,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Collect Point',
                    pos: {
                        x: rPoint7.x,
                        y: rPoint7.y,
                        z: rPoint7.z + 1.5,
                    },
                },
                blip: {
                    text: 'Collect Point',
                    color: 2,
                    pos: rPoint7,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                    JobEnums.ObjectiveCriteria.VEHICLE_HOOKED |
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Collect the Vehicle`);
                    Athena.vehicle.funcs.tempVehicle(player, 'blade', rPoint7, rPoint7, false);
                },
                callbackOnFinish: (player: alt.Player) => {
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You have collected the Vehicle`);
                },
            });
        }

        const randomPoints8 = RepairdriverJob.getRandomPoints8(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints8.length; i++) {
            const rPoint8 = randomPoints8[i];
            objectives.push({
                description: 'Drop Off Vehicle',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint8,
                range: 2,
                marker: {
                    pos: rPoint8,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Drop Off Point',
                    pos: {
                        x: rPoint8.x,
                        y: rPoint8.y,
                        z: rPoint8.z + 1.5,
                    },
                },
                blip: {
                    text: 'Drop Off Point',
                    color: 2,
                    pos: rPoint8,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.IN_VEHICLE |
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Drop off the Vehicle and drive it in the Workshop`);
                },
                callbackOnFinish: (player: alt.Player) => {
                    const extra = RepairdriverJob.getRandomMoney(TOTAL_MONEY_VALUE)
                    for (let i = 0; i < extra.length; i++) {
                        const exmoney = extra[i];
                        Athena.player.currency.add(player, CurrencyTypes.CASH, exmoney);
                        Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                        Athena.player.emit.notification(player, `You have dropped off the Vehicle`);
                        Athena.player.emit.notification(player, `You earned extramoney: ~g~$${exmoney}`);
                    };
                },
            });
        }

        const randomPoints9 = RepairdriverJob.getRandomPoints9(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints9.length; i++) {
            const rPoint9 = randomPoints9[i];
            objectives.push({
                description: 'Collect the Vehicle',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint9,
                range: 2,
                marker: {
                    pos: rPoint9,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Collect Point',
                    pos: {
                        x: rPoint9.x,
                        y: rPoint9.y,
                        z: rPoint9.z + 1.5,
                    },
                },
                blip: {
                    text: 'Collect Point',
                    color: 2,
                    pos: rPoint9,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                    JobEnums.ObjectiveCriteria.VEHICLE_HOOKED |
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Collect the Vehicle`);
                    Athena.vehicle.funcs.tempVehicle(player, 'sabregt', rPoint9, rPoint9, false);
                },
                callbackOnFinish: (player: alt.Player) => {
                    Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                    Athena.player.emit.notification(player, `You have collected the Vehicle`);
                },
            });
        }

        const randomPoints10 = RepairdriverJob.getRandomPoints10(TOTAL_DROP_OFFS);
        for (let i = 0; i < randomPoints10.length; i++) {
            const rPoint10 = randomPoints10[i];
            objectives.push({
                description: 'Drop Off Vehicle',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: rPoint10,
                range: 2,
                marker: {
                    pos: rPoint10,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Drop Off Point',
                    pos: {
                        x: rPoint10.x,
                        y: rPoint10.y,
                        z: rPoint10.z + 1.5,
                    },
                },
                blip: {
                    text: 'Drop Off Point',
                    color: 2,
                    pos: rPoint10,
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.IN_VEHICLE |
                    JobEnums.ObjectiveCriteria.NO_DYING,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Drop off the Vehicle and drive it in the Workshop`);
                },
                callbackOnFinish: (player: alt.Player) => {
                    const extra = RepairdriverJob.getRandomMoney(TOTAL_MONEY_VALUE)
                    for (let i = 0; i < extra.length; i++) {
                        const exmoney = extra[i];
                        Athena.player.currency.add(player, CurrencyTypes.CASH, exmoney);
                        Athena.player.emit.soundFrontend(player, 'BASE_JUMP_PASSED', 'HUD_AWARDS');
                        Athena.player.emit.notification(player, `You have dropped off the Vehicle`);
                        Athena.player.emit.notification(player, `You earned extramoney: ~g~$${exmoney}`);
                    };
                },
            });
        }

        objectives.push({
            description: 'Drop Off Vehicle',
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
                text: 'Park Vehicle',
                color: 2,
                pos: openSpot.pos,
                scale: 1,
                shortRange: true,
                sprite: 271,
            },
            textLabel: {
                data: 'Park Vehicle',
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z + 1.5,
                },
            },
            criteria:
                JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                JobEnums.ObjectiveCriteria.NO_DYING,
            callbackOnStart: (player: alt.Player) => {
                Athena.player.emit.notification(player, `Drive the vehicle back`);
            },
            callbackOnFinish: (player: alt.Player) => {
                // Payout 100 - 200; Random;
                const earned = Math.floor(Math.random() * 50) + 200;
                Athena.player.currency.add(player, CurrencyTypes.CASH, earned);
                Athena.player.emit.notification(player, `~g~$${earned}`);
            },
        });

        const job = new Job();
        job.addVehicle(
            player,
            'flatbed',
            openSpot.pos,
            openSpot.rot,
            new alt.RGBA(255, 0, 0, 255),
            new alt.RGBA(255, 0, 0, 255),
        );

        job.loadObjectives(objectives);
        job.addPlayer(player);
    }

    /**
     * Creates and checks if a vehicle is in a spot and returns a spot if it is open.
     * @static
     * @return {({ pos: Vector3; rot: Vector3 } | null)}
     * @memberof TruckerJob
     */
    static async getVehicleSpawnPoint(): Promise<{ pos: Vector3; rot: Vector3 } | null> {
        for (let i = 0; i < JOB_DATA.PARKING_POINTS.length; i++) {
            const point = JOB_DATA.PARKING_POINTS[i];
            const pointTest = new alt.ColshapeSphere(point.pos.x, point.pos.y, point.pos.z - 1, 2);

            // Have to do a small sleep to the ColShape propogates entities inside of it.
            await new Promise((resolve: Function) => {
                alt.setTimeout(() => {
                    resolve();
                }, 250);
            });

            const spaceOccupied = alt.Vehicle.all.find((veh) => veh && veh.valid && pointTest.isEntityIn(veh));

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
            points.push(JOB_DATA.COLLECT_SPOTS[Math.floor(Math.random() * JOB_DATA.COLLECT_SPOTS.length)]);
        }

        return points;
    }

    static getRandomPoints2(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_SPOT[Math.floor(Math.random() * JOB_DATA.DROP_SPOT.length)]);
        }

        return points;
    }

    static getRandomPoints3(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.COLLECT_SPOTS[Math.floor(Math.random() * JOB_DATA.COLLECT_SPOTS.length)]);
        }

        return points;
    }

    static getRandomPoints4(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_SPOT[Math.floor(Math.random() * JOB_DATA.DROP_SPOT.length)]);
        }

        return points;
    }

    static getRandomPoints5(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.COLLECT_SPOTS[Math.floor(Math.random() * JOB_DATA.COLLECT_SPOTS.length)]);
        }

        return points;
    }

    static getRandomPoints6(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_SPOT[Math.floor(Math.random() * JOB_DATA.DROP_SPOT.length)]);
        }

        return points;
    }

    static getRandomPoints7(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.COLLECT_SPOTS[Math.floor(Math.random() * JOB_DATA.COLLECT_SPOTS.length)]);
        }

        return points;
    }

    static getRandomPoints8(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_SPOT[Math.floor(Math.random() * JOB_DATA.DROP_SPOT.length)]);
        }

        return points;
    }

    static getRandomPoints9(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.COLLECT_SPOTS[Math.floor(Math.random() * JOB_DATA.COLLECT_SPOTS.length)]);
        }

        return points;
    }

    static getRandomPoints10(amount: number): Array<Vector3> {
        const points = [];

        while (points.length < amount) {
            points.push(JOB_DATA.DROP_SPOT[Math.floor(Math.random() * JOB_DATA.DROP_SPOT.length)]);
        }

        return points;
    }

    static getRandomMoney(amount: number): Array<number> {
        const cash = [];

        while (cash.length < amount) {
            cash.push(JOB_DATA.MONEY[Math.floor(Math.random() * JOB_DATA.MONEY.length)]);
        }

        return cash;
    }
}
