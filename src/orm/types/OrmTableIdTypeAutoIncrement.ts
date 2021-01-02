import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableIdTypeAutoIncrement extends OrmTableFieldType
{
    constructor(name)
    {
        super(name);
    }
    public getColumnType()
    {
        return 'INT AUTO_INCREMENT';
    }
}
