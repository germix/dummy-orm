import { ConfigDriverType } from "../types";
import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeTime extends OrmTableFieldType
{
    private fraction: number|null = null;

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
        return (this.fraction == null) ? "TIME" : `TIME(${this.fraction})`;
    }
}
