"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerEvents = void 0;
const Expression_1 = __importDefault(require("../../expressions/Expression"));
const Statement_1 = __importDefault(require("../Statement"));
var TriggerEvent;
(function (TriggerEvent) {
    TriggerEvent["Insert"] = "INSERT";
    TriggerEvent["Update"] = "UPDATE";
    TriggerEvent["Delete"] = "DELETE";
})(TriggerEvent || (TriggerEvent = {}));
class TriggerEvents {
    constructor() {
        this.events = [];
        this.or = this;
    }
    get insert() {
        this.events.push(TriggerEvent.Insert);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    update(...columns) {
        this.events.push(columns.length ? [TriggerEvent.Update, ...columns] : TriggerEvent.Update);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    get delete() {
        this.events.push(TriggerEvent.Delete);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    compile() {
        return this.events.map(event => {
            if (typeof event === "string")
                return event;
            let columns;
            [event, ...columns] = event;
            return `${event} OF ${columns.join(", ")}`;
        })
            .join(" OR ");
    }
}
exports.TriggerEvents = TriggerEvents;
class CreateTrigger extends Statement_1.default {
    constructor(id, on) {
        super();
        this.id = id;
        this.on = on;
    }
    before(initialiser) {
        this.events = `BEFORE ${initialiser(new TriggerEvents()).compile()}`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    after(initialiser) {
        this.events = `AFTER ${initialiser(new TriggerEvents()).compile()}`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    when(initialiser) {
        const expr = Expression_1.default.compile(initialiser, true);
        this.condition = `WHEN (${expr.text})`;
        return this;
    }
    execute(functionName) {
        this.fn = functionName;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    compile() {
        return this.queryable(`CREATE OR REPLACE TRIGGER ${this.id} ${this.events} ON ${this.on} FOR EACH ROW ${this.condition ?? ""} EXECUTE FUNCTION ${this.fn}()`);
    }
}
exports.default = CreateTrigger;
