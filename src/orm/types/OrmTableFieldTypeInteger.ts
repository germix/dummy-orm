import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeInteger extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "INT";
    }
}
