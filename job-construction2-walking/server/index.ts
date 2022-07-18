import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { Constworker2Job } from './src/job';

const PLUGIN_NAME = 'Construction Worker Job';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    Constworker2Job.init();
});
