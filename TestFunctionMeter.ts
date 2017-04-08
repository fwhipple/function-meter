
import { FunctionMeter } from "./FunctionMeter";
import { MeterDefinition } from "./MeterDefinition";

// Create meter definitons and their associated meters
let overallMeterDefinition: MeterDefinition = new MeterDefinition(
    "Overall Meter",
    "Keep the overall number of activities from overwhelming server",
    null,
    150,
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
    null,
    100,
    null,
    null,
    null,
    [overallMeter],
    true
);
let webserverMeter = new FunctionMeter(webserverMeterDefinition);

let dataDownloadMeterDefinition: MeterDefinition = new MeterDefinition(
    "Data Download Meter",
    "Limit the total number of data download requests from all services",
    null,
    100,
    null,
    null,
    null,
    [overallMeter],
    true
);
let dataDownloadMeter = new FunctionMeter(dataDownloadMeterDefinition);

let quandlMeterDefinition: MeterDefinition = new MeterDefinition(
    "Quandl Download Meter",
    "Limit Quandl requests to 5 per second, 20 concurrent",
    200,
    20,
    200,
    null,
    null,
    [dataDownloadMeter],
    true
);
let quandlMeter = new FunctionMeter(quandlMeterDefinition);

let googleMeterDefinition: MeterDefinition = new MeterDefinition(
    "Google Download Meter",
    "Limit Google requests to 1 per second, 5 concurrent",
    1000,
    5,
    1000,
    null,
    null,
    [dataDownloadMeter],
    true
);
let googleMeter = new FunctionMeter(googleMeterDefinition);

let yahooMeterDefinition: MeterDefinition = new MeterDefinition(
    "Yahoo Download Meter",
    "Limit Yahoo requests to 1 per second, 5 concurrent",
    1000,
    5,
    1000,
    null,
    null,
    [dataDownloadMeter],
    true
);
let yahooMeter = new FunctionMeter(yahooMeterDefinition);

let sqliteMeterDefinition: MeterDefinition = new MeterDefinition(
    "SQLite Overall Activity Meter",
    "Limit the total activity occuring on SQLite",
    null,
    100,
    null,
    null,
    null,
    [overallMeter],
    true
);
let sqliteMeter = new FunctionMeter(sqliteMeterDefinition);

let sqliteTransactionMeterDefinition: MeterDefinition = new MeterDefinition(
    "SQLite Transaction Meter",
    "Limit SQLite to 1 at a time",
    null,
    1,
    null,
    null,
    null,
    [sqliteMeter],
    true
);
let sqliteTransactionMeter = new FunctionMeter(sqliteTransactionMeterDefinition);

let requestId: number = 0;

let handleRequest = () => {

    requestId++;
    console.log("Request:" + requestId);

    // First thing's first, don't handle request without a metered callback
    webserverMeter.getCallback((webUuid: string) => {

        let finishedDataRequests: number = 0;

        // This web request will generate 5 data lookups from each of the 3 services
        for (let i: number = 0; i < 5; i++) {

            setImmediate(() => {

                quandlMeter.getCallback((quandlUuid: string) => {

                    let waitTime = Math.floor(Math.random() * (5000 - 1)) + 1;
                    setTimeout(() => {

                        console.log("Request:" + requestId + " Quandl:" + i + " Finished");
                        quandlMeter.release(quandlUuid);
                        finishedDataRequest();
                    }, waitTime);
                });
            });

            setImmediate(() => {

                googleMeter.getCallback((googleUuid: string) => {

                    let waitTime = Math.floor(Math.random() * (5000 - 1)) + 1;
                    setTimeout(() => {

                        console.log("Request:" + requestId + " Google:" + i + " Finished");
                        googleMeter.release(googleUuid);
                        finishedDataRequest();
                    }, waitTime);
                });
            });

            setImmediate(() => {

                yahooMeter.getCallback((yahooUuid: string) => {

                    let waitTime = Math.floor(Math.random() * (5000 - 1)) + 1;
                    setTimeout(() => {

                        console.log("Request:" + requestId + " Yahoo:" + i + " Finished");
                        yahooMeter.release(yahooUuid);
                        finishedDataRequest();
                    }, waitTime);
                });
            });
        }

        // This web request will also generate 50 DB lookups and 2 writes
        for (let i: number = 0; i < 50; i++) {

            setImmediate(() => {

                sqliteMeter.getCallback((sqliteUuid: string) => {

                    let waitTime = Math.floor(Math.random() * (500 - 1)) + 1;
                    setTimeout(() => {

                        console.log("Request:" + requestId + " SQLite:" + i + " Finished");
                        sqliteMeter.release(sqliteUuid);
                        finishedDataRequest();
                    }, waitTime);
                });
            });
        }
        for (let i: number = 0; i < 2; i++) {

            setImmediate(() => {

                sqliteTransactionMeter.getCallback((sqliteUuid: string) => {

                    let waitTime = Math.floor(Math.random() * (1000 - 1)) + 1;
                    setTimeout(() => {

                        console.log("Request:" + requestId + " SQLite Xion:" + i + " Finished");
                        sqliteTransactionMeter.release(sqliteUuid);
                        finishedDataRequest();
                    }, waitTime);
                });
            });
        }

        let finishedDataRequest = () => {
            finishedDataRequests++;
            if (finishedDataRequests == 67) {
                // Give us some processing time
                let waitTime = Math.floor(Math.random() * (5000 - 1)) + 1;
                setTimeout(finishedWebRequest, waitTime);
            }
        }

        let finishedWebRequest = () => {
            console.log("Request:" + requestId + " WebRequest:" + requestId + " Finished");
            webserverMeter.release(webUuid);
        }
    });
}

// Now generate some traffic
setInterval(() => {

    handleRequest();

}, 100);

// Finally dump the overall queue's stats
setInterval(() => {

    console.log('\n');
    overallMeter.dumpStats();
    webserverMeter.dumpStats();
    dataDownloadMeter.dumpStats();
    sqliteMeter.dumpStats();
    sqliteTransactionMeter.dumpStats();
    quandlMeter.dumpStats();
    googleMeter.dumpStats();
    yahooMeter.dumpStats();
    console.log('\n');

}, 5000);

