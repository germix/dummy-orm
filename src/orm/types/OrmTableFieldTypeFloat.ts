import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeFloat extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "FLOAT";
    }
}
