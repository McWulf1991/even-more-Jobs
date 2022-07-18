import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { Pizza2Job } from './src/job';

const PLUGIN_NAME = 'Pizza Job';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    Pizza2Job.init();
});
