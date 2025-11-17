import {upShadowSearch} from 'mount-observer/upShadowSearch.js';

/** @import {Actions, PAP, AllProps, AP, BAP, ItemPropMap} from './ts-refs/be-parsing/types' */;

/** @type {WeakMap<HTMLElement, any} */
const parsedItempropmaps = new WeakMap();
/**
 * 
 * @param {Element} el 
 */
export function parse(el, obj = {}){
    const itemprop = el.getAttribute('itemprop');
    if(itemprop){
        obj[itemprop] = el.textContent; //TODO full logic
    }
    const itempropmap = el.getAttribute('itempropmap');
    if(itempropmap){
        //const el = document.getElementById(itempropmap);
        const jsonEl = upShadowSearch(el, itempropmap)
        if(!jsonEl) throw 500;
        if(!parsedItempropmaps.has(jsonEl)){
            parsedItempropmaps.set(jsonEl, JSON.parse(jsonEl.innerHTML));
        }
        const parsed =/** @type {ItemPropMap} */  (parsedItempropmaps.get(jsonEl));
        for(const key in parsed){
            if(!el.hasAttribute(key)) continue;
            const attr = el.getAttribute(key);
            const rhs = parsed[key];
            switch(typeof rhs){
                case 'string':
                    obj[rhs] = attr;
                    break;
                case 'object':
                    const {instanceOf, mapsTo} = rhs;
                    switch(instanceOf){
                        case 'Number':
                        case Number:
                            obj[mapsTo] = Number(attr);
                            break;
                        case 'Object':
                        case Object:
                        case 'Boolean':
                        case Boolean:
                            obj[mapsTo] = JSON.parse(attr);
                            break;
                        

                    }
            }
        }

    }
    el.ish = obj;
    const children = Array.from(el.children);
    for(const child of children){
        const objToPass = child.hasAttribute('itemscope') ? {} : obj;
        parse(child, objToPass);
    }
}