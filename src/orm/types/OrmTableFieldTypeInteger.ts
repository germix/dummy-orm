import { ConfigDriverType } from "../types";
import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeInteger extends OrmTableFieldType
{
    constructor(name: string)
    {
        super(name);
    }

    public getColumnType(driverType: ConfigDriverType): string
    {
        return "INT";
    }
}
