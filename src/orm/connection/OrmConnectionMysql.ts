import { logQuery } from "../../testing/log";
import { OrmConfigParams } from "../OrmConfigParams";
import { OrmQueryResult } from "../OrmQueryResult";
import { OrmConnection } from "./OrmConnection";
import mysql from 'mysql';
//import mysql from 'mysql2'; // TODO:

export class OrmConnectionMysql implements OrmConnection
{
    private con: mysql.Connection;
    private params: OrmConfigParams;

    public init(params: OrmConfigParams): void
    {
        this.params = params;
    }

    /**
     * Connect
     */
    public async connect(): Promise<void>
    {
        const connectNow = () =>
        {
            return new Promise<void>((done, reject) =>
            {
                this.con = mysql.createConnection({
                    trace: true,
                    //debug: true,
                    //multipleStatements: true,
                    port: this.params.port,
                    host: this.params.host || "localhost",
                    user: this.params.user || "",
                    password: this.params.password || "",
                    database: this.params.dbname,
                });
                this.con.connect((err) =>
                {
                    if(err)
                    {
                        reject(err);
                    }
                    else
                    {
                        this.con.on("error", function(err)
                        {
                            if (err.code === "PROTOCOL_CONNECTION_LOST")
                            {
                                connectNow();
                            }
// TODO:                            else
// TODO:                            {
// TODO:                                reject(err);
// TODO:                            }
                        });
                        done();
                    }
                });
            })
        }

        return connectNow();
    }

    /**
     * Disconnect
     */
    public disconnect(): Promise<void>
    {
        return new Promise<void>((done, reject) =>
        {
            this.con.end((error) =>
            {
                if(error)
                    reject(error);
                else
                    done();
            });
        });
    }

    /**
     * Drop database
     */
    public drop(): Promise<void>
    {
        return new Promise<void>((done, reject) =>
        {
            const con = mysql.createConnection({
                port: this.params.port,
                host: this.params.host || "localhost",
                user: this.params.user || "",
                password: this.params.password || "",
                database: "mysql",
            });
            con.connect((err) =>
            {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    con.query(`DROP DATABASE IF EXISTS \`${this.params.dbname}\``, async (error) =>
                    {
                        if(error)
                        {
                            reject(error);
                        }
                        else
                        {
                            con.end((error) =>
                            {
                                if(error)
                                    reject(error);
                                else
                                    done();
                            })
                        }
                    });
                }
            });
        })
    }

    /**
     * Create database
     */
    public create(): Promise<void>
    {
        return new Promise<void>((done, reject) =>
        {
            const con = mysql.createConnection({
                port: this.params.port,
                host: this.params.host || "localhost",
                user: this.params.user || "",
                password: this.params.password || "",
                database: "mysql",
            });
            con.connect((err) =>
            {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    con.query(`CREATE DATABASE \`${this.params.dbname}\``, async (error) =>
                    {
                        if(error)
                        {
                            reject(error);
                        }
                        else
                        {
                            con.end((error) =>
                            {
                                if(error)
                                    reject(error);
                                else
                                    done();
                            })
                        }
                    });
                }
            });
        })
    }

    /**
     * Execute query
     *
     * @param sql
     */
    public query(sql: string): Promise<OrmQueryResult>
    {
        return new Promise<OrmQueryResult>((done, reject) =>
        {
            logQuery(sql, this.params.debug);
            this.con.query(sql, (error, result, fields) =>
            {
                /*
                // TODO:
                console.log("==========================")
                console.log("sql", sql)
                console.log("error", error)
                console.log("result", result)
                console.log("fields", fields)
                */
                if(error)
                {
                    reject(error);
                }
                else
                {
                    if(Array.isArray(result))
                    {
                        done({
                            rows: result,
                            rowCount: result.length,
                        });
                    }
                    else if(result.constructor.name == "OkPacket")
                    {
                        done({
                            rows: [],
                            rowCount: 0,
                            insertId: result.insertId,
                        });
                    }
                }
            });
        });
    }

    public wrapTableName(tableName: string): string
    {
        return `\`${tableName}\``;
    }

    public wrapFieldName(fieldName: string): string
    {
        return `\`${fieldName}\``;
    }

}
