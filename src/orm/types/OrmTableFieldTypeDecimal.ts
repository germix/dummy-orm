import { ConfigDriverType } from "../types";
import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeDecimal extends OrmTableFieldType
{
    private precision: number = 10;
    private scale: number = 0;

    constructor(name: string)
    {
        super(name);
    }

    public getPrecision(): number
    {
        return this.precision;
    }

    public setPrecision(precision: number): void
    {
        this.precision = precision;
    }

    public getScale(): number
    {
        return this.scale;
    }

    public setScale(scale: number): void
    {
        this.scale = scale;
    }

    public getColumnType(driverType: ConfigDriverType): string
    {
        return `DECIMAL(${this.precision},${this.scale})`;
    }
}
