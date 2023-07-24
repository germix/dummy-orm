import { ConfigDriverType } from "../types";
import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeDouble extends OrmTableFieldType
{
    constructor(name: string)
    {
        super(name);
    }

    public getColumnType(driverType: ConfigDriverType): string
    {
        if(driverType == "postgresql")
            return "DOUBLE PRECISION";

        return "DOUBLE";
    }
}
