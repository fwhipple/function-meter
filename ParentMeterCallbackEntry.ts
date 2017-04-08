
import { FunctionMeter } from "./FunctionMeter";

class ParentMeterCallbackEntry {

    functionMeter: FunctionMeter;
    callbackUuid: string;

    constructor(functionMeter: FunctionMeter, callbackUuid: string) {

        this.functionMeter = functionMeter;
        this.callbackUuid = callbackUuid;
    }
}

export { ParentMeterCallbackEntry };