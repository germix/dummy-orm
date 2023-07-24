import { OrmConfig } from "../OrmConfig";
import { ConfigDriverType } from "../types";

export abstract class OrmTableFieldType
{
    private name: string;
    private nullable: boolean = false;
    private primaryKey: boolean = false;
    private foreignKeyTable: string = null;
    private foreignKeyColumn: string = null;

    constructor(name: string)
    {
        this.name = name;
    }

    public getName(): string
    {
        return this.name;
    }

    public setName(name: string)
    {
        this.name = name;

        return this;
    }

    public getNullable(): boolean
    {
        return this.nullable;
    }

    public setNullable(nullable: boolean)
    {
        this.nullable = nullable;

        return this;
    }

    public getPrimaryKey(): boolean
    {
        return this.primaryKey;
    }

    public setPrimaryKey(primaryKey: boolean)
    {
        this.primaryKey = primaryKey;

        return this;
    }

    public getForeignKeyTable(): string
    {
        return this.foreignKeyTable;
    }

    public setForeignKeyTable(foreignKeyTable: string)
    {
        this.foreignKeyTable = foreignKeyTable;

        return this;
    }

    public getForeignKeyColumn(): string
    {
        return this.foreignKeyColumn;
    }

    public setForeignKeyColumn(foreignKeyColumn: string)
    {
        this.foreignKeyColumn = foreignKeyColumn;

        return this;
    }

    public abstract getColumnType(driverType: ConfigDriverType): string;

    public toString(config: OrmConfig): string
    {
        let sql = `${config.wrapFieldName(this.name)} ${this.getColumnType(config.getDriverType())}`;

        if(!this.nullable || this.primaryKey)
        {
            sql += ' NOT NULL';
        }

        return sql;
    }
}
