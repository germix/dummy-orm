import { OrmException } from "../OrmException";

export class ParserException extends OrmException
{
    constructor(message: string)
    {
        super(message);
    }
}
