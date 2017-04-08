
import { FunctionMeter } from "./FunctionMeter";
import { MeterDefinition } from "./MeterDefinition";

let parentMeterDefinition = new MeterDefinition();
parentMeterDefinition.maximumConcurrent = 100;
//parentMeterDefinition.minimumInterval = 500;
//parentMeterDefinition.queueMonitorInterval = 250;


let childMeterDefinition1 = new MeterDefinition();
childMeterDefinition1.maximumConcurrent = 100;
childMeterDefinition1.minimumInterval = 200;
childMeterDefinition1.queueMonitorInterval = 200;

let childMeterDefinition2 = new MeterDefinition();
childMeterDefinition2.maximumConcurrent = 100;
childMeterDefinition2.minimumInterval = 500;
childMeterDefinition2.queueMonitorInterval = 200;


let parentFunctionMeter = new FunctionMeter(parentMeterDefinition);
let otherParentFunctionMeter = new FunctionMeter(childMeterDefinition1);


childMeterDefinition1.parentMeters.push(parentFunctionMeter);
let childFunctionMeter1 = new FunctionMeter(childMeterDefinition1);

childMeterDefinition2.parentMeters.push(parentFunctionMeter);
let childFunctionMeter2 = new FunctionMeter(childMeterDefinition2);

parentFunctionMeter.getCallback((uuid: string) => {

    parentFunctionMeter.release(uuid);
    console.log("Parent gave me a callback");

});

otherParentFunctionMeter.getCallback((uuid: string) => {

    otherParentFunctionMeter.release(uuid);
    console.log("Parent gave me a callback");

});


childFunctionMeter1.getCallback((uuid: string) => {

    childFunctionMeter1.release(uuid);
    console.log("Child 1 gave me a callback");

});

childFunctionMeter2.getCallback((uuid: string) => {

    childFunctionMeter2.release(uuid);
    console.log("Child 2 gave me a callback");

});



for (let i = 0; i < 1000; i++) {

    if (i % 2 === 0) {
        console.log(new Date().toLocaleString() + "\tChild 1 requesting callback iteration:  " + i);
        childFunctionMeter1.getCallback(function (uuid: string) {

            console.log(new Date().toLocaleString() + "\tChild 1 executing iteration:  " + i);

            let waitTime = Math.floor(Math.random() * (10000 - 1)) + 1;
            setTimeout(() => {

                console.log(new Date().toLocaleString() + "\tChild 1 completing iteration:  " + i);
                childFunctionMeter1.release(uuid);

            }, waitTime);
        });
    } else {
        console.log(new Date().toLocaleString() + "\tChild 2 requesting callback iteration:  " + i);
        childFunctionMeter2.getCallback(function (uuid: string) {

            console.log(new Date().toLocaleString() + "\tChild 2 executing iteration:  " + i);

            let waitTime = Math.floor(Math.random() * (10000 - 1)) + 1;
            setTimeout(() => {

                console.log(new Date().toLocaleString() + "\tChild 2 completing iteration:  " + i);
                childFunctionMeter2.release(uuid);

            }, waitTime);
        });
    }
}

