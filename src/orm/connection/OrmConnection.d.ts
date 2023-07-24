import { OrmConfigParams } from "../OrmConfigParams";
import { OrmQueryResult } from "../OrmQueryResult";

export interface OrmConnection
{
    /**
     * Initialize
     *
     * @param params
     */
    init(params: OrmConfigParams): void;

    /**
     * Connect
     */
    connect(): Promise<void>;

    /**
     * Disconnect
     */
    disconnect(): Promise<void>;

    /**
     * Drop database
     */
    drop(): Promise<void>;

    /**
     * Create database
     */
    create(): Promise<void>;

    /**
     * Execute query
     *
     * @param sql
     */
    query(sql: string): Promise<OrmQueryResult>;

    wrapTableName(tableName: string): string;

    wrapFieldName(fieldName: string): string;

}
