import { OrmConfig } from "./OrmConfig";

export class OrmInsertBuilder
{
    private config: OrmConfig;
    private tableName;

    private fields = [];

    constructor(config: OrmConfig, tableName)
    {
        this.config = config;
        this.tableName = tableName;
    }

    public add(field, value)
    {
        this.fields[field] = value;
        return this;
    }

    public flush()
    {
        this.config.con.query(this.getSqlQuery());
    }

    public getSqlQuery()
    {
        let sql = `INSERT INTO \`${this.config.dbname}\`.\`${this.tableName}\` (`;
        let first = true;

        for(const key in this.fields)
        {
            if(!first)
                sql += ',';
            first = false;
            sql += `\`${key}\``;
        }
        first = true;
        sql += ') VALUES(';
        for(const key in this.fields)
        {
            let value: string = this.fields[key];
            if(!first)
                sql += ',';
            first = false;
            if(value === undefined)
            {
                throw `Field value is undefined (field=${key})`;
            }
            else if(value === null)
            {
                sql += 'null';
            }
            else
            {
                value = value.toString().replace("'", "\'");
                sql += `'${value}'`;
            }
        }
        sql += ');';

        return sql;
    }
}
