import { ConfigDriverType } from "../types";
import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeMediumInt extends OrmTableFieldType
{
    constructor(name: string)
    {
        super(name);
    }

    public getColumnType(driverType: ConfigDriverType): string
    {
        if(driverType == "postgresql")
            return "INT"; // TODO:

        return "MEDIUMINT";
    }
}
