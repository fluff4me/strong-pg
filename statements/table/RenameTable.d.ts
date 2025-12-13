import Statement from '../Statement';
export default class RenameTable extends Statement.Basic {
    constructor(name: string, newName: string);
}
