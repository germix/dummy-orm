import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeBoolean extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "BOOLEAN";
    }
}
