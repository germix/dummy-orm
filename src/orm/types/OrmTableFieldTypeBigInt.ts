import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeBigInt extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }

    public getColumnType()
    {
        return "BIGINT";
    }
}
