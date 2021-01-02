import { BgBlue, Reset } from "../../bash";
import { OrmConnection } from "./OrmConnection";

export class OrmConnectionDummy implements OrmConnection
{
    query(sql, callback?)
    {
        console.log(BgBlue + "[QUERY]:" + Reset + " " + sql);
        callback(null, []); // TODO
    }
}
