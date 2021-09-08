import { BgBlue, Reset } from "../../bash";
import { OrmConnection } from "./OrmConnection";
import mysql from 'mysql';

export class OrmConnectionMysql implements OrmConnection
{
    con:  mysql.Connection;

    constructor(params: mysql.ConnectionConfig, callback)
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
