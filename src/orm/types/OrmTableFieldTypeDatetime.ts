import { ConfigDriverType } from "../types";
import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeDatetime extends OrmTableFieldType
{
    private fraction: number = null;

    constructor(name: string)
    {
        super(name);
    }

    public getFraction(): number|null
    {
        return this.fraction;
    }

    public setFraction(fraction: number|null): void
    {
        this.fraction = fraction;
    }

    public getColumnType(driverType: ConfigDriverType): string
    {
        if(driverType == "postgresql")
            return "TIMESTAMP"; // TODO: fraction ???
        return (this.fraction == null) ? "DATETIME" : `DATETIME(${this.fraction})`;
    }
}
