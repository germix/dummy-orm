import { OrmEntityField } from "./OrmEntityField";

interface Params
{
    /**
     * Indicates if the field is nullable
     */
    nullable?: boolean;
}

export function OrmEntityFieldAsInteger(params?: Params)
{
    const {
        nullable,
    } = params || {};

    return OrmEntityField({
        type: 'integer',
        nullable,
    });
}
