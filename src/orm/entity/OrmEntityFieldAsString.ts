import { OrmEntityField } from "./OrmEntityField";

export function OrmEntityFieldAsString(params?)
{
    let length = 24;
    if(params !== undefined && params.length !== undefined)
    {
        length = params.length;
    }
    return OrmEntityField({
        ...params,
        type: 'string',
        length,
    });
}
