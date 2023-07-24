import { OrmEntityField } from "./OrmEntityField";

interface Params
{
    /**
     * Indicates if the field is nullable
     */
    nullable?: boolean;
}

export function OrmEntityFieldAsText(params?: Params)
{
    const {
        nullable,
    } = params || {};

    return OrmEntityField({
        type: 'text',
        nullable,
    });
}
