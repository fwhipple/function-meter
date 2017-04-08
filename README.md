# function-meter
### TypeScript class to limit frequency and concurrency of function calls

The purpose of **function-meter** is to perform rate limiting on callbacks inside JavaScript (or TypeScript) apps.  My specific target for this is Node.js apps.

Often times I find that I need to control how often I make requests to external services in my apps.  For example, for a free [Quandl](http://www.quandl.com) account I am limited to so many requests per second.  I have found [Google Finance](http://finance.google.com) limits the number of concurrent requests I can have.  Finally, I find that the performance of my apps can be very poor in Node.js in cases where I respond to each request when it comes in, especially where the complexity of building responses is more complex than Node.js assumes they should be.

With this class, I can configure a meter that allows only so many requests per second / minute / etc., how many simultaneous requests can be outstanding, or both.  This is implemented by requesting a callback from the meter before performing your activities.  The meter will ensure the rate of activity doesn't exceed the limits.

You can have more than one meter in your application.  For example, you can have a meter to ensure that you don't handle more than 100 simultaneous web requests and at the same time, you don't make more than 4 requests per second to a remote API.

You can also nest meters in order ot setup very complex application control structures.  For example, you may use a SQLite database which can only handle one transaction at a time, and has some upper bound of simultaneous read requests before the operating system starts blocking.  So in this case, you can have one meter that that allows a maximum of 1 write connections whose parent allows 100 simultaneous total operations.  Or, for developing a system that by nature generates tens of thousands of simultaneous requests and operations (e.g. for stock market research) it's helpful to put a master limiter that limits overall operations 1000 or 5000 at a time.

In practice, I create a meter for every external API, a parent meter to those that limit total concurrent API calls, a meter for database operations, a meter for incomming HTTPS requests, and finally a master meter that lets me control overall activity.  Using many meters can introduce overhead but may make the overall running of your application smoother.

Note that when a meter reaches the maximum allowable concurrent requests or a request has been made too soon, it pushes that request to the back of a queue.  Those requests are handled as current callbacks are released.

This meter has been implemented in [TypeScript](https://www.typescriptlang.org/).  It can be transpiled into JavaScript.  It was implemented in TypeScript to help me learn the language.

### Example Usage

The following shows how to use a single function meter that limits callbacks to one at a time:

~~~
import { FunctionMeter } from "./FunctionMeter";
import { MeterDefinition } from "./MeterDefinition";

// Create meter definitons and their associated meters
let overallMeterDefinition: MeterDefinition = new MeterDefinition(
    "Overall Meter",
    "Keep the overall number of activities from overwhelming server",
    null,
    1,
    null,
    null,
    null,
    [],
    true
);
let overallMeter = new FunctionMeter(overallMeterDefinition);

for (let i = 0; i < 5; i++) {

    console.log("Sending callback request:  " + i);

    overallMeter.getCallback((uuid: string) => {

        console.log("Received callback request:  " + i);

        setTimeout(() => {

            console.log("Releasing callback request:  " + i);
            overallMeter.release(uuid);
        }, 1000);
    });
}
~~~

The parameters for the MeterDefinition can be found in the class constructor definition:

~~~
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
    )
~~~

Other examples can be found in Test*.ts.
