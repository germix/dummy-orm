import { ConfigDriverType } from "../types";
import { OrmTableFieldType } from "./OrmTableFieldType";

export class OrmTableFieldTypeString extends OrmTableFieldType
{
    private length: number = 255;

    constructor(name: string)
    {
        super(name);
    }

    public getLength(): number
    {
        return this.length;
    }

    public setLength(length: number): void
    {
        this.length = length;
    }

    public getColumnType(driverType: ConfigDriverType): string
    {
        return `VARCHAR(${this.length})`;
    }
}
