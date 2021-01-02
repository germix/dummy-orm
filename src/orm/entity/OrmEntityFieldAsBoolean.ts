import { OrmEntityField } from "./OrmEntityField";

export function OrmEntityFieldAsBoolean(params?)
{
    return OrmEntityField({
        ...params,
        type: 'boolean',
    });
}
