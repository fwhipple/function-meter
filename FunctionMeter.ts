
import * as UUID from "uuid/v4";

import { MeterDefinition } from "./MeterDefinition";
import { CallbackRequest } from "./CallbackRequest";

class FunctionMeter {

    readonly uuid: string;
    readonly meterDefinition: MeterDefinition;

    private lastExecute: number;
    private currentExecutions: {};
    private callbackQueue: any[];
    private releasedRequests: any[];
    private isQueueMonitorRunning: boolean;
    private queueMonitorTimer: any;

    constructor(meterDefinition: MeterDefinition) {

        this.meterDefinition = meterDefinition;

        // Uniquely identify this FunctionMeter
        this.uuid = UUID();

        this.lastExecute = 0;
        this.currentExecutions = {};
        this.callbackQueue = [];
        this.releasedRequests = [];
        this.isQueueMonitorRunning = false;
        this.queueMonitorTimer = null;
    }

    /**
     * 
     * @param callback Callback from caller to execute once the meter determines
     */
    getCallback(callback: any): void {

        // Create a new request and initialize stuff
        let request: CallbackRequest = new CallbackRequest(callback);

        // If we can run this now, do so, otherwise push to the queue        
        if (this.canDoCallback()) {

            this.serviceCallback(request);

            // Push to the queue            
        } else {

            this.callbackQueue.push(request);
            if (this.meterDefinition.minimumInterval > 0) this.startQueueMonitoring();
        }
    }

    private canDoCallback(): boolean {

        let now = new Date().getTime();
        let currentExecutions = Object.keys(this.currentExecutions).length;

        if (
            currentExecutions < this.meterDefinition.maximumConcurrent &&
            (now - this.lastExecute) >= this.meterDefinition.minimumInterval
        ) return true;
        else return false;
    }

    private serviceCallback(request: CallbackRequest): void {

        let now = new Date().getTime();
        this.lastExecute = now;
        request.executionTime = now;
        this.currentExecutions[request.uuid] = request;

        // Set meter variables and actually do the callback
        let foobar = () => {


        }

        // If there are parent meters, get callbacks from each
        if (this.meterDefinition.parentMeters.length > 0) {

            let responses = 0;
            for (let i = 0; i < this.meterDefinition.parentMeters.length; i++) {

                this.meterDefinition.parentMeters[i].getCallback((uuid) => {

                    responses++;

                    // Store the parent meter's allback UUID in order to release later
                    request.parentRequestUuids[i] = uuid;

                    // Once we have as many responses as we do parent meters we
                    // can do the actual execution
                    if (responses == this.meterDefinition.parentMeters.length)
                        //                        foobar();
                        request.callback(request.uuid);
                });
            }

            // If there were no parent meters, just continue on            
            //        } else foobar();
        } else request.callback(request.uuid);
    }

    release(uuid: string): void {

        let request: CallbackRequest = this.currentExecutions[uuid];
        if (!request)
            throw new Error("Cannot release unknown request:  " + uuid);

        // Do a sanity check - the number of parent callback UUIDs in the
        // CallbackRequest should be equal to the number of parent meters
        // in the MeterDefinition.  If not, something went terribly wrong
        if (request.parentRequestUuids.length != this.meterDefinition.parentMeters.length)
            throw new Error("Number of parent callback entries does not match number of " +
                "parent FunctionMeters defined for this FunctionMeter");

        for (let i = 0; i < request.parentRequestUuids.length; i++) {

            this.meterDefinition.parentMeters[i].release(request.parentRequestUuids[i]);
        }

        request.releaseTime = new Date().getTime();
        this.releasedRequests.unshift(request);
        delete this.currentExecutions[uuid];

        if (this.meterDefinition.minimumInterval == null) this.checkQueue();
    }

    // TODO - Change this to a fat arrow function    
    private startQueueMonitoring(): void {

        if (!this.isQueueMonitorRunning) {

            this.isQueueMonitorRunning = true;
            this.queueMonitorTimer = setInterval(function (functionMeter: FunctionMeter) {

                functionMeter.checkQueue();

            }, this.meterDefinition.queueMonitorInterval, this);
        }
    }

    private checkQueue(): void {

        // If there's nothing in the queue, disable queue management
        if (this.callbackQueue.length == 0) {

            clearInterval(this.queueMonitorTimer);
            this.queueMonitorTimer = null;
            this.isQueueMonitorRunning = false;

        }

        // If there are jobs in the queue and we have availability, service the
        // first member of the queue    
        else if (this.canDoCallback())
            this.serviceCallback(this.callbackQueue.shift());

        //                if (this.meterDefinition.minimumInterval == 0) this.checkQueue();
        //            }
        //        }
    }

    dumpStats(): void {

        var stats = {};
        stats['name'] = this.meterDefinition.name;
        stats['callbackQueueLength'] = this.callbackQueue.length;
        stats['currentExecutionsLength'] = Object.keys(this.currentExecutions).length;
        stats['lastCallbackMade'] = new Date(this.lastExecute).toLocaleTimeString();
        stats['releasedRequestsLength'] = this.releasedRequests.length;
        stats['queueMonitorRunning'] = this.isQueueMonitorRunning;
        if (this.queueMonitorTimer) stats['queueMonitorTimer'] = true;
        else stats['queueMonitorTimer'] = false;

        console.log(stats);
    }
};

export { FunctionMeter };
