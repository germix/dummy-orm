import { OrmConfig } from "./OrmConfig";
import { OrmQueryResult } from "./OrmQueryResult";
import { Parser } from "./parser/Parser";

export class OrmQueryRunner
{
    private config: OrmConfig;

    constructor(cfg: OrmConfig)
    {
        this.config = cfg;
    }

    public async run(query) : Promise<OrmQueryResult>
    {
        const parser = new Parser(this.config);

        const sql = parser.parse(query);

        console.log("sql in query", sql)

        const result = this.config.con.query(sql);

        return result;
    }
}
