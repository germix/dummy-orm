import { OrmTableFieldType } from "./types/OrmTableFieldType";

interface OrmConfigParams
{
    type: 'dummy'|'mysql',
    dbname,
    host?,
    user?,
    password?,
    entities: any[],
    customTypes?:
    {
        name,
        type: typeof OrmTableFieldType,
    }[];
}
