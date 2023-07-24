import { logQuery } from "../../testing/log";
import { OrmConfigParams } from "../OrmConfigParams";
import { OrmQueryResult } from "../OrmQueryResult";
import { OrmConnection } from "./OrmConnection";
import pg from "pg";

export class OrmConnectionPostgresql implements OrmConnection
{
    //private pool: pg.Pool;
    private client: pg.Client;
    private params: OrmConfigParams;

    public init(params: OrmConfigParams): void
    {
        this.params = params;
    }

    /**
     * Connect
     */
    public connect(): Promise<void>
    {
        return new Promise<void>(async (done, reject) =>
        {
            try
            {
                const client = new pg.Client({
                    port: this.params.port,
                    host: this.params.host || "localhost",
                    user: this.params.user || "",
                    password: this.params.password || "",
                    database: this.params.dbname
                });
                await client.connect();
                this.client = client;
                done();
            }
            catch (error)
            {
                reject(error);
            }
            /*
            // TODO:
            this.client = new pg.Client({
                port: params.port,
                host: params.host || "localhost",
                user: params.user || "",
                password: params.password || "",
                database: params.dbname,
            });
            console.log({
                port: params.port,
                host: params.host || "localhost",
                user: params.user || "",
                password: params.password || "",
                database: params.dbname,
            });

            this.client.connect().then(done).catch(reject);
            */
        });
    }

    /**
     * Disconnect
     */
    public disconnect(): Promise<void>
    {
        return new Promise<void>((done, reject) =>
        {
            this.client.end().then(done).catch(reject);
        });
    }

    /**
     * Drop database
     */
    public drop(): Promise<void>
    {
        /*
        // TODO:
        return this.pool.query(`DROP DATABASE \"${dbname}\"`).then(() =>
        {
            console.log("drop ok")
        });
        */
        return new Promise<void>(async (done, reject) =>
        {
            const pgtools = require('pgtools');
            const config = {
                host: this.params.host,
                port: this.params.port,
                user: this.params.user,
                password: this.params.password,
            }
            try
            {
                await pgtools.dropdb(config, this.params.dbname);
                done();
            }
            catch (error)
            {
                reject(error);
            }
        });
    }

    /**
     * Create database
     */
    public create(): Promise<void>
    {
        /*
        // TODO:
        return this.pool.query(`CREATE DATABASE \"${dbname}\"`).then(() =>
        {
            console.log("create ok")
        });
        */
        return new Promise<void>(async (done, reject) =>
        {
            const pgtools = require('pgtools');
            const config = {
                host: this.params.host,
                port: this.params.port,
                user: this.params.user,
                password: this.params.password,
            }
            try
            {
                await pgtools.createdb(config, this.params.dbname);
                done();
            }
            catch (error)
            {
                reject(error);
            }
        });
    }

    /**
     * Execute query
     *
     * @param sql
     */
    public query(sql: string): Promise<OrmQueryResult>
    {
        return new Promise<OrmQueryResult>(async (done, reject) =>
        {
            logQuery(sql, this.params.debug);

            const result = await this.client.query(sql)

            // TODO: console.log(result)

            let insertId = undefined;

            if(result.command === "INSERT")
            {
                if(result.rows.length == 1 && result.rows[0]['id'] !== undefined)
                {
                    insertId = result.rows[0]['id'];
                }
            }

            done({
                rows: result.rows,
                rowCount: result.rowCount,
                insertId,
            });
        });
    }

    public wrapTableName(tableName: string): string
    {
        return `"${tableName}"`;
    }

    public wrapFieldName(fieldName: string): string
    {
        return `"${fieldName}"`;
    }

}
