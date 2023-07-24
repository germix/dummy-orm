import { FieldType } from "../types";

export interface OrmEntityFieldParams
{
    /**
     * Field type
     */
    type: FieldType;

    /**
     * Indicates if the field is nullable
     */
    nullable?: boolean;
}
