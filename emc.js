// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
/** @import {EMC} from './ts-refs/trans-render/be/types' */
/** @import {Actions, PAP, AllProps, AP} from './ts-refs/be-parsing/types' */;

/**
 * @type {EMC<any, AP>}
 */
export const emc = {
    base: 'be-parsing',
    map: {
        '0.0': {
            instanceOf: 'Object',
            mapsTo: '.',
        }
    },
    enhPropKey: 'beParsing',
    importEnh: async () => {
        const { BeParsing } = await import('./be-parsing.js');
        return BeParsing;
    },
};
const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);
