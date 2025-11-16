/** @import {Actions, PAP, AllProps, AP, BAP, ItemPropMap} from './ts-refs/be-parsing/types' */;

/** @type {WeakMap<HTMLElement, any} */
const parsedItempropmaps = new WeakMap();
/**
 * 
 * @param {HTMLElement} el 
 */
export function parse(el, obj = {}){
    const itemprop = el.getAttribute('itemprop');
    if(itemprop){
        obj[itemprop] = el.textContent; //TODO full logic
    }
    const itempropmap = el.getAttribute('itempropmap');
    if(itempropmap){
        const el = document.getElementById(itempropmap);
        if(!el) throw 500;
        if(!parsedItempropmaps.has(el)){
            parsedItempropmaps.set(el, JSON.parse(el.innerHTML));
        }
        const parsed =/** @type {ItemPropMap} */  (parsedItempropmaps.get(el));
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
        const children = Array.from(el.children);
        for(const child of children){
            if(child.hasAttribute('itemscope')) continue;
            parse(child, obj);
        }
    }
}