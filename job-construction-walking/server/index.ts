import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { ConstworkerJob } from './src/job';

const PLUGIN_NAME = 'Construction Worker Job';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    ConstworkerJob.init();
});
