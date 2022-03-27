import Statement from "../Statement";
export default class RenameTrigger extends Statement.Basic {
    constructor(on: string, name: string, newName: string);
}
