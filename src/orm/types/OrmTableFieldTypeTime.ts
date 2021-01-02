import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeTime extends OrmTableFieldType
{
    private fraction = null;

    constructor(name)
    {
        super(name);
    }

    public getFraction()
    {
        return this.fraction;
    }

    public setFraction(fraction)
    {
        this.fraction = fraction;
    }

    public getColumnType()
    {
        return (this.fraction == null) ? "TIME" : `TIME(${this.fraction})`;
    }
}
