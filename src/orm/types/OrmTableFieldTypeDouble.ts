import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeDouble extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "DOUBLE";
    }
}
