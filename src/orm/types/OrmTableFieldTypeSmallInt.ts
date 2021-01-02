import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeSmallInt extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "SMALLINT";
    }
}
