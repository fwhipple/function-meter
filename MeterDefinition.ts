
import { FunctionMeter } from "./FunctionMeter";

class MeterDefinition {

    readonly name: string | null;
    readonly description: string | null;
    readonly minimumInterval: number | null;
    readonly maximumConcurrent: number | null;
    readonly queueMonitorInterval: number | null;
    readonly maximumQueueLength: number | null;
    readonly queueMaxLengthExceededAction: string | null;
    readonly parentMeters: FunctionMeter[];
    readonly recordStats: boolean;

    /*
     * For this class, the constructor just initializes all properties to
     * values that are likely to cause errors without being properly set later
     */

    constructor(
        name: string,
        description: string,
        minimumInterval: number,
        maximumConcurrent: number,
        queueMonitorInterval: number,
        maximumQueueLength: number,
        queueMaxLengthExceededAction: string,
        parentMeters: FunctionMeter[],
        recordStats: boolean
    ) {
        this.name = name;
        this.description = description;
        this.minimumInterval = minimumInterval;
        this.maximumConcurrent = maximumConcurrent;
        this.queueMonitorInterval = queueMonitorInterval;
        this.maximumQueueLength = maximumQueueLength;
        this.queueMaxLengthExceededAction = queueMaxLengthExceededAction;
        this.parentMeters = parentMeters;
        this.recordStats = recordStats;
    }

    /*
     * Validation Cases
     *
     * The following rules are checked in validate ():
     *
     * 1. At least one of the two metering variables, minimumInterval or,
     *    maximumConcurrent, must be specified unless 'recordStats' is true
     *
     * 2. If minimumInterval is specified, it must be greater than zero since
     *    a value of zero is equivilent to not having a meter, and less than
     *    zero is impossible
     *
     * 3. If minimumInterval is specified, a queueMonitorInterval must also
     *    be specified.  The same is not true for a maximumConcurrent alone
     *    because each time the meter's release () function is called the next
     *    queued callback will get called back immediately
     *
     * 4. If queueMonitorInterval is specified, it must be an integer greater
     *    than zero.  In theory we could interpret a value of zero to mean do
     *    an immediate check on the queue continuously however that wouldn't be
     *    useful since it would defeat the purpose of the meter
     *
     * 5. If maximumConcurrent is specified, it must be an integer greater than
     *    zero since a value of zero is equivilent to an eternal block, and
     *    less than zero is impossible
     *
     * 6. If maximumQueueLength is specified it must be zero or greater
     *
     * 7. If maximumQueueLength is specified, queueMaxLengthExceededAction must
     *    also be specified
     *
     * 8. If queueMaxLengthExceededAction is specified, it must contain a
     *    string of either "error" or "ignore" to specify that an error
     *    will be thrown in the event that a callback is requested but cannot
     *    be serviced right now, or that the callback request will be ignored
     *    and will simply never occur, respectively.
     */

    private validate(): void {

        // Case 1        
        if (this.minimumInterval == this.maximumConcurrent == null)
            throw new Error("'minimumInterval' or 'maximumConcurrent' must be specified");

        // Case 2        
        if (
            this.minimumInterval != null &&
            (
                Math.round(this.minimumInterval) != this.minimumInterval ||
                this.minimumInterval < 1
            )
        )
            throw new Error("'minimumInterval' must be a positive integer");

        // Case 3
        if (this.minimumInterval != null && this.queueMonitorInterval == null)
            throw new Error("'queueMonitorInterval' must also be specified where 'minimumInterval' is specified");

        // Case 4
        if (
            this.queueMonitorInterval != null &&
            (
                Math.round(this.queueMonitorInterval) != this.queueMonitorInterval ||
                this.queueMonitorInterval < 1
            )
        )
            throw new Error("'queueMonitorInterval' must be a positive integer");

        // Case 5
        if (
            this.maximumConcurrent != null &&
            (
                Math.round(this.maximumConcurrent) != this.maximumConcurrent ||
                this.maximumConcurrent < 1
            )
        )
            throw new Error("'maximumConcurrent' must be a positive integer when specified");

        // Case 6
        if (
            this.maximumQueueLength != null &&
            (
                Math.round(this.maximumQueueLength) != this.maximumQueueLength ||
                this.maximumQueueLength < 0
            )
        )
            throw new Error("'maximumQueueLength' must be a positive integer or zero when specified");

        // Case 7
        if (this.maximumQueueLength != null && this.queueMaxLengthExceededAction == null)
            throw new Error("'queueMaxLengthExceededAction' must also be specified where 'maximumQueueLength' is specified");

        // Case 8
        if (
            this.queueMaxLengthExceededAction != null &&
            this.queueMaxLengthExceededAction != 'error' &&
            this.queueMaxLengthExceededAction != 'ignore'
        )
            throw new Error("'queueMaxLengthExceededAction' must be 'error' or 'ignore' where specified");

    }
}

export { MeterDefinition };