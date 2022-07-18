import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { Trucker2Job } from './src/job';

const PLUGIN_NAME = 'Trucker Job';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    Trucker2Job.init();
});
