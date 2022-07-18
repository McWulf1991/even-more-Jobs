import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { ConstdriverJob } from './src/job';

const PLUGIN_NAME = 'Construction Driver Job';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    ConstdriverJob.init();
});
