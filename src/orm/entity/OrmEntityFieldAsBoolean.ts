import { OrmEntityField } from "./OrmEntityField";

interface Params
{
    /**
     * Indicates if the field is nullable
     */
    nullable?: boolean;
}

export function OrmEntityFieldAsBoolean(params?: Params)
{
    const {
        nullable,
    } = params || {};

    return OrmEntityField({
        type: 'boolean',
        nullable,
    });
}
