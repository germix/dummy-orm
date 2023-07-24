import { ConfigDriverType } from "../types";
import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeText extends OrmTableFieldType
{
    constructor(name: string)
    {
        super(name);
    }

    public getColumnType(driverType: ConfigDriverType): string
    {
        return "TEXT";
    }
}
