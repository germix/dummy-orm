import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeDecimal extends OrmTableFieldType
{
    private precision = 10;
    private scale = 0;

    constructor(name)
    {
        super(name);
    }

    public getPrecision()
    {
        this.precision;
    }

    public setPrecision(precision)
    {
        this.precision = precision;
    }

    public getScale()
    {
        this.scale;
    }

    public setScale(scale)
    {
        this.scale = scale;
    }

    public getColumnType()
    {
        return `DECIMAL(${this.precision},${this.scale})`;
    }
}
