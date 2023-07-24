import { OrmConfig } from "./OrmConfig";
import { OrmException } from "./OrmException";

export class OrmInsertBuilder
{
    private config: OrmConfig;
    private tableName: string;

    private fields: {[key: string]: string} = {};

    constructor(config: OrmConfig, tableName: string)
    {
        this.config = config;
        this.tableName = tableName;
    }

    public add(field: string, value: string)
    {
        this.fields[field] = value;
        return this;
    }

    public async flush(): Promise<void>
    {
        await this.config.con.query(this.getSqlQuery());
    }

    public getSqlQuery()
    {
        const cfg = this.config;
        const driverType = this.config.getDriverType();
        const columnNames: string[] = [];
        const columnValues: string[] = [];

        let sql = `INSERT INTO ${cfg.wrapTableName(this.tableName)}`;
        for(const key in this.fields)
        {
            columnNames.push(cfg.wrapFieldName(key));
        }
        for(const key in this.fields)
        {
            const value = this.fields[key];
            if(value === undefined)
            {
                throw new OrmException(`Field value is undefined (field=${key})`);
            }
            else if(value === null)
            {
                columnValues.push("NULL");
            }
            else
            {
                columnValues.push(`'${value.toString().replace("'", "\'")}'`)
            }
        }
        if(columnNames.length === 0)
        {
            sql += " VALUES(DEFAULT)";
        }
        else
        {
            sql += `(${columnNames.join(",")}) VALUES(${columnValues.join(",")})`;
        }

        if(driverType == 'postgresql')
        {
            sql += " RETURNING id"
        }

        sql += ';';

        return sql;
    }
}
