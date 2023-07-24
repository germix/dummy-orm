import { OrmEntityField } from "./OrmEntityField";

interface Params
{
    /**
     * Length (default 24)
     */
    length?: number;

    /**
     * Indicates if the field is nullable
     */
    nullable?: boolean;
}

export function OrmEntityFieldAsString(params?: Params)
{
    const {
        length = 24,
        nullable,
    } = params || {};

    return OrmEntityField({
        type: 'string',
        nullable,
        length,
    });
}
