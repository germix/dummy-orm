import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeText extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "TEXT";
    }
}
