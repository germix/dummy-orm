import { BgMagenta, Reset } from "../../bash";
import { entityDefinitions } from "../OrmConfig";
import { makeGetMethod } from "../utils";
import { OrmEntityFieldParams } from "./OrmEntityFieldParams";

export function OrmEntityField(params?: OrmEntityFieldParams|object)
{
    return function(target, fieldName)
    {
        let entityName = target.constructor.name;
        
        console.log(BgMagenta + "[ORM FIELD]:" + Reset + " " + entityName + '.' + fieldName);

        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {};
        }
        if(entityDefinitions[entityName].ormFields === undefined)
        {
            entityDefinitions[entityName].ormFields = {};
        }

        entityDefinitions[entityName].ormFields[fieldName] = params;

        target[makeGetMethod(fieldName)] = function()
        {
            return this[fieldName];
        }
    }
}
