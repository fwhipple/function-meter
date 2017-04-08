
import { FunctionMeter } from "./FunctionMeter";
import { MeterDefinition } from "./MeterDefinition";

// Create meter definitons and their associated meters
let overallMeterDefinition: MeterDefinition = new MeterDefinition(
    "Overall Meter",
    "Keep the overall number of activities from overwhelming server",
    null,
    100,
    null,
    null,
    null,
    [],
    true
);
let overallMeter = new FunctionMeter(overallMeterDefinition);

let webserverMeterDefinition: MeterDefinition = new MeterDefinition(
    "Web Server Meter",
    "Limit the servicing of incomming web requests",
    100,
    75,
    100,
    null,
    null,
    [overallMeter],
    true
);
let webserverMeter = new FunctionMeter(webserverMeterDefinition);

let databaseMeterDefinition: MeterDefinition = new MeterDefinition(
    "Database Meter",
    "Limit the servicing database requests",
    null,
    75,
    null,
    null,
    null,
    [overallMeter],
    true
);
let databaserMeter = new FunctionMeter(databaseMeterDefinition);

for (let i = 0; i < 1000; i++) {

    console.log("Requesting web callback:  " + i);

    webserverMeter.getCallback((uuid: string) => {

        console.log("Received web callback:  " + i);

        let waitTime = Math.floor(Math.random() * (5000 - 1)) + 1;
        setTimeout(() => {

            console.log("Releasing web callback:  " + i);
            webserverMeter.release(uuid);
        }, waitTime);
    });

    console.log("Requesting DB callback:  " + i);

    databaserMeter.getCallback((uuid: string) => {

        console.log("Received DB callback:  " + i);

        let waitTime = Math.floor(Math.random() * (5000 - 1)) + 1;
        setTimeout(() => {

            console.log("Releasing DB callback:  " + i);
            databaserMeter.release(uuid);
        }, waitTime);
    });
}

setInterval(() => {

    console.log("\n\n");
    overallMeter.dumpStats();
    console.log("\n\n");
    webserverMeter.dumpStats();
    console.log("\n\n");
    databaserMeter.dumpStats();
    console.log("\n");
}, 5000)