import { BgBlue, Reset } from "../../bash";
import { OrmConnection } from "./OrmConnection";

var mysql = require('mysql');

export class OrmConnectionMysql implements OrmConnection
{
    con;

    constructor(params, callback)
    {
        this.con = mysql.createConnection(params);

        this.con.connect((err) =>
        {
            if(err)
                throw err;
            console.log("Connected!");
            callback();
        });
    }

    query(sql, callback?)
    {
        console.log(BgBlue + "[QUERY]:" + Reset + " " + sql);
        this.con.query(sql, callback);
    }
}
