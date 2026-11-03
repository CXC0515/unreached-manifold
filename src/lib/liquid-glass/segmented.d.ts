import type { GlassOptions } from './api';
export function mountSegmented(host: HTMLElement, options: {value:string;trackRim?:boolean;liftPx?:number;glass?:GlassOptions;onChange(value:string):void}): {destroy():void;select(value:string,options?:{animate?:boolean;notify?:boolean}):void};
