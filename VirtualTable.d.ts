import { Initialiser } from "./IStrongPG";
import Schema, { TableSchema } from "./Schema";
import { SelectFromVirtualTable } from "./statements/Select";
export declare abstract class VirtualTable<VIRTUAL_TABLE extends TableSchema> {
    protected readonly name: string;
    protected vars: any[];
    constructor(name: string, vars?: any[]);
    /**
     * SELECT *
     */
    select(): SelectFromVirtualTable<VIRTUAL_TABLE, "*">;
    /**
     * SELECT columns AS aliases
     */
    select<COLUMNS extends Partial<Record<Schema.Column<VIRTUAL_TABLE>, string>>>(columns: COLUMNS): SelectFromVirtualTable<VIRTUAL_TABLE, COLUMNS>;
    /**
     * SELECT columns
     */
    select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[]>(...columns: COLUMNS): SelectFromVirtualTable<VIRTUAL_TABLE, COLUMNS>;
    /**
     * SELECT *
     * ...then provide an initialiser for tweaking the query
     */
    select<RETURN extends SelectFromVirtualTable<VIRTUAL_TABLE, "*"> = SelectFromVirtualTable<VIRTUAL_TABLE, "*">>(initialiser: Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, "*">, RETURN>): RETURN;
    /**
     * SELECT columns
     * ...then provide an initialiser for tweaking the query
     */
    select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[], RETURN extends SelectFromVirtualTable<VIRTUAL_TABLE, COLUMNS>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, COLUMNS>, RETURN>]): RETURN;
    compileWith?(): string;
    compileFrom?(): string;
    protected selectInitialiser?(select: SelectFromVirtualTable<VIRTUAL_TABLE, "*">): any;
}
