import { OrmConfig } from "./OrmConfig";
import { OrmTableFieldType } from "./types/OrmTableFieldType";

export class OrmTableBuilder
{
    private config: OrmConfig;
    private tableName: string;
    private allFields: OrmTableFieldType[] = [];

    constructor(config: OrmConfig)
    {
        this.config = config;
    }

    public setName(name: string)
    {
        this.tableName = name;
    }

    public addField(field: OrmTableFieldType)
    {
        this.allFields.push(field);
    }

    public toSqlString()
    {
        let sql = `CREATE TABLE IF NOT EXISTS ${this.config.wrapTableName(this.tableName)} (`;
        let first = true;
        let hasPrimaryKeys = false;

        //
        // Column definitions
        //
        this.allFields.forEach((field) =>
        {
            if(!first)
                sql += ',';
            first = false;
            if(field.getPrimaryKey())
            {
                hasPrimaryKeys = true;
            }

            sql += field.toString(this.config);
        });

        //
        // Primary key definitions
        //
        if(hasPrimaryKeys)
        {
            sql += ", " + this.generatePrimaryKey();
        }

        //
        // Foreign keys definitions
        //
        this.allFields.forEach((field) =>
        {
            if(field.getForeignKeyTable() != null)
            {
                sql += ", " + this.generateForeignKey(field);
            }
        });

        sql += ");";

        return sql;
    }

    private generatePrimaryKey()
    {
        let sql = "PRIMARY KEY (";
        let first = true;
        this.allFields.forEach((field) =>
        {
            if(field.getPrimaryKey())
            {
                if(!first)
                    sql += ',';
                first = false;
                let fieldName = field.getName();

                sql += this.config.wrapFieldName(fieldName);
            }
        });
        sql += ")";
        return sql;
    }

    private generateForeignKey(field: OrmTableFieldType)
    {
        let column = field.getName();
        let foreignTable = field.getForeignKeyTable();
        let foreignColumn = field.getForeignKeyColumn();
        if(foreignColumn == null)
        {
            foreignColumn = column;
        }
        column = this.config.wrapFieldName(column);
        foreignTable = this.config.wrapTableName(foreignTable);
        foreignColumn = this.config.wrapFieldName(foreignColumn);

        return `FOREIGN KEY (${column}) REFERENCES ${foreignTable}(${foreignColumn})`;
    }
}
