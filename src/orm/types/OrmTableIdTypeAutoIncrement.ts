import { ConfigDriverType } from "../types";
import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableIdTypeAutoIncrement extends OrmTableFieldType
{
    constructor(name: string)
    {
        super(name);
    }

    public getColumnType(driverType: ConfigDriverType): string
    {
        if(driverType == "postgresql")
            return "SERIAL";

        return 'INT AUTO_INCREMENT';
    }
}
