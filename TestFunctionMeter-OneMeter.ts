
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

setTimeout(function () { overallMeter.dumpStats() }, 5000);





let webserverMeterDefinition: MeterDefinition = new MeterDefinition(
    "Web Server Meter",
    "Limit the servicing of incomming web requests",
    null,
    100,
    null,
    null,
    null,
    [overallMeter],
    true
);
let webserverMeter = new FunctionMeter(webserverMeterDefinition);