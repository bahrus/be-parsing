// @ts-check
import { propInfo} from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';
import {parse} from './parse.js';
/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP, AllProps, AP, BAP} from './ts-refs/be-parsing/types' */;

/**
 * @implements {Actions}
 * 
 */
class BeParsing extends BE {
    /**
     * @type {BEConfig<BAP, Actions & IEnhancement>}
     */
    static config = {
        propDefaults: {
            nudges: true,
        },
        propInfo: {
            ...propInfo,
        },
        compacts: {
            when_nudges_changes_call_do: 0,
        }
    }

    /**
     * 
     * @param {BAP} self 
     */
    async do(self){
        const {enhancedElement, nudges} = self;
        const itemScope = enhancedElement.closest('[itemscope]');
        if(itemScope === null) throw 404;
        if(nudges){
            const {nudge} = await import('trans-render/lib/nudge.js');
            nudge(itemScope);
        }
        parse(itemScope, {});
    }
}
await BeParsing.bootUp();
export { BeParsing }