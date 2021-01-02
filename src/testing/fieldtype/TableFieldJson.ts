import { OrmTableFieldType } from "./../../orm/types/OrmTableFieldType";

export class CustomTableFieldJson extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "JSON";
    }
}
