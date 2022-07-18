import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { TaxidriverJob } from './src/job';

const PLUGIN_NAME = 'Taxi Driver Job';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    TaxidriverJob.init();
});
