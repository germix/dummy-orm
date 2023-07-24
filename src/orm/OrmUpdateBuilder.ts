import { OrmConfig } from "./OrmConfig";

export class OrmUpdateBuilder
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
        const valuesToUpdate: string[] = [];

        for(const key in this.fields)
        {
            let value: string = this.fields[key];
            if(value === undefined)
            {
                throw `Field value is undefined (field=${key})`;
            }
            else if(value === null)
            {
                value = "NULL";
            }
            else
            {
                value = "'" + value.toString().replace("'", "\'") + "'";
            }
            valuesToUpdate.push(`${cfg.wrapFieldName(key)} = ${value}`);
        }

        return `UPDATE ${cfg.wrapTableName(this.tableName)} SET ${valuesToUpdate.join(", ")};`;
    }
}
