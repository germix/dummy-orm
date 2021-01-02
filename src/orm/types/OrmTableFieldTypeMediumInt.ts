import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeMediumInt extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "MEDIUMINT";
    }
}
