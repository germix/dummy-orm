
export abstract class OrmTableFieldType
{
    private name;
    private nullable = false;
    private primaryKey = false;
    private foreignKeyTable = null;
    private foreignKeyColumn = null;

    constructor(name)
    {
        this.name = name;
    }

    public getName()
    {
        return this.name;
    }

    public setName(name)
    {
        this.name = name;

        return this;
    }

    public getNullable()
    {
        return this.nullable;
    }

    public setNullable(nullable)
    {
        this.nullable = nullable;

        return this;
    }

    public getPrimaryKey()
    {
        return this.primaryKey;
    }

    public setPrimaryKey(primaryKey)
    {
        this.primaryKey = primaryKey;

        return this;
    }

    public getForeignKeyTable()
    {
        return this.foreignKeyTable;
    }

    public setForeignKeyTable(foreignKeyTable)
    {
        this.foreignKeyTable = foreignKeyTable;

        return this;
    }

    public getForeignKeyColumn()
    {
        return this.foreignKeyColumn;
    }

    public setForeignKeyColumn(foreignKeyColumn)
    {
        this.foreignKeyColumn = foreignKeyColumn;

        return this;
    }

    public abstract getColumnType();

    public toString()
    {
        let sql = `\`${this.name}\` ${this.getColumnType()}`;

        if(!this.nullable || this.primaryKey)
        {
            sql += ' NOT NULL';
        }

        return sql;
    }
}
