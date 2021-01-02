import { entityDefinitions } from "../OrmConfig";
import { makeGetMethod } from "../utils";

export function OrmEntityId(params?)
{
    return function(target, fieldName)
    {
        let entityName = target.constructor.name;

        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {};
        }
        if(entityDefinitions[entityName].ormIds === undefined)
        {
            entityDefinitions[entityName].ormIds = {};
        }

        entityDefinitions[entityName].ormIds[fieldName] = params || {
            type: 'string',
            length: 24,
        };;

        target[makeGetMethod(fieldName)] = function()
        {
            return this[fieldName];
        }
    }
}
