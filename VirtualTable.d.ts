import type { Initialiser } from './IStrongPG';
import type Schema from './Schema';
import type { TableSchema } from './Schema';
import type { SelectColumnsRecord } from './statements/Select';
import { SelectFromVirtualTable } from './statements/Select';
export declare abstract class VirtualTable<VIRTUAL_TABLE extends TableSchema, NAME extends string> {
    protected readonly name: NAME;
    protected vars: any[];
    constructor(name: NAME, vars?: any[]);
    /**
     * SELECT *
     */
    select(): SelectFromVirtualTable<VIRTUAL_TABLE, NAME, '*'>;
    /**
     * SELECT columns AS aliases
     */
    select<const COLUMNS extends SelectColumnsRecord<VIRTUAL_TABLE, NAME>>(columns: COLUMNS): SelectFromVirtualTable<VIRTUAL_TABLE, NAME, COLUMNS>;
    /**
     * SELECT columns
     */
    select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[]>(...columns: COLUMNS): SelectFromVirtualTable<VIRTUAL_TABLE, NAME, COLUMNS>;
    /**
     * SELECT *
     * ...then provide an initialiser for tweaking the query
     */
    select<RETURN extends SelectFromVirtualTable<VIRTUAL_TABLE, NAME, '*'> = SelectFromVirtualTable<VIRTUAL_TABLE, NAME, '*'>>(initialiser: Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, NAME, '*'>, RETURN>): RETURN;
    /**
     * SELECT columns
     * ...then provide an initialiser for tweaking the query
     */
    select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[], RETURN extends SelectFromVirtualTable<VIRTUAL_TABLE, NAME, COLUMNS>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, NAME, COLUMNS>, RETURN>]): RETURN;
    compileWith?(): string;
    compileFrom?(): string;
    protected selectInitialiser?(select: SelectFromVirtualTable<VIRTUAL_TABLE, '*'>): any;
}
