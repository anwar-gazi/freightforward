export declare type callbackFn = () => void;
export interface IStateObj {
    listeners: callbackFn[];
    scriptId: string;
    scriptLoaded: boolean;
}
export declare const create: () => IStateObj;
export declare const load: (state: IStateObj, doc: Document, url: string, callback: callbackFn) => void;
