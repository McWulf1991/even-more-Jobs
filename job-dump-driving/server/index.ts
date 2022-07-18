import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { DumpJob } from './src/job';

const PLUGIN_NAME = 'Dump Job';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    DumpJob.init();
});