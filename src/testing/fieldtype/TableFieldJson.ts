import { ConfigDriverType } from "../../orm/types";
import { OrmTableFieldType } from "./../../orm/types/OrmTableFieldType";

export class CustomTableFieldJson extends OrmTableFieldType
{
    constructor(name: string)
    {
        super(name);
    }

    public getColumnType(driverType: ConfigDriverType): string
    {
        return "JSON";
    }
}
