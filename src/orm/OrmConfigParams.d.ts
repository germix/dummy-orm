import { ConfigDriverType } from "./types";
import { OrmTableFieldType } from "./types/OrmTableFieldType";

interface OrmConfigParams
{
    type: ConfigDriverType;
    dbname: string;
    port?: number;
    host?: string;
    user?: string;
    password?: string;
    entities: any[];
    customTypes?:
    {
        name: string;
        type: typeof OrmTableFieldType;
    }[];
    debug?: boolean; // TODO:
}
