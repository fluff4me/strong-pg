import Statement from '../Statement';
export default class DropTrigger extends Statement.Basic {
    constructor(on: string, name: string);
}
