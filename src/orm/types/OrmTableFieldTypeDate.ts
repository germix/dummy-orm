import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeDate extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "DATE";
    }
}
