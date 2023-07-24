import { entityDefinitions } from "../OrmConfig";
import { makeGetMethod } from "../utils";
import { OrmEntityDefinition } from "./OrmEntityDefinition";

interface Params
{
    target?;

    /**
     * Indicates if the field is nullable
     */
    nullable?: boolean;
}

export function OrmEntityFieldAsManyToOne(params?: Params)
{
    return function(target, fieldName)
    {
        let entityName = target.constructor.name;

        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {} as OrmEntityDefinition;
        }
        if(entityDefinitions[entityName].ormManyToOne === undefined)
        {
            entityDefinitions[entityName].ormManyToOne = {};
        }
        entityDefinitions[entityName].ormManyToOne[fieldName] = params;

        target[makeGetMethod(fieldName)] = async function()
        {
            return this[fieldName];
        }
    };
}
