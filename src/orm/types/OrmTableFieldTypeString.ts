import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeString extends OrmTableFieldType
{
    private length = 255;

    constructor(name)
    {
        super(name);
    }

    public getLength()
    {
        return this.length;
    }

    public setLength(length)
    {
        this.length = length;
    }

    public getColumnType()
    {
        return `VARCHAR(${this.length})`;
    }
}
