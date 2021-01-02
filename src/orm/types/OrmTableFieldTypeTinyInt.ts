import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeTinyInt extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "TINYINT";
    }
}
