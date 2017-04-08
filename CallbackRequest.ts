
import * as UUID from "uuid/v4";

class CallbackRequest {

    readonly uuid: string;
    readonly callback: any;
    readonly requestTime: number;
    executionTime: number;
    releaseTime: number;
    parentRequestUuids: any[];

    constructor(callback) {

        this.uuid = UUID();
        this.requestTime = new Date().getTime();
        this.parentRequestUuids = [];
        this.callback = callback;
    }
}

export { CallbackRequest };