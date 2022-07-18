import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { RepairdriverJob } from './src/job';

const PLUGIN_NAME = 'Repair Driver Job';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    RepairdriverJob.init();
});
