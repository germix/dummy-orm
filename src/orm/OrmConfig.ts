import { OrmConnection } from "./connection/OrmConnection";
import { OrmConnectionDummy } from "./connection/OrmConnectionDummy";
import { OrmConnectionMysql } from "./connection/OrmConnectionMysql";
import { OrmEntityDefinition } from "./entity/OrmEntityDefinition";
import { OrmConfigParams } from "./OrmConfigParams";
import { OrmTableFieldType } from "./types/OrmTableFieldType";

export const entityDefinitions = {

};

export class OrmConfig
{
    con: OrmConnection;
    dbname;
    entities = [];
    customTypes?:
    {
        name,
        type: typeof OrmTableFieldType,
    }[];

    constructor()
    {
    }

    public init({
        type,
        dbname,
        host,
        user,
        password,
        entities,
        customTypes,
    }: OrmConfigParams) : Promise<OrmConfig>
    {
        return new Promise((done, reject) =>
        {
            this.dbname = dbname,
            this.entities = entities;
            this.customTypes = customTypes || [];

            //
            // Patch extends
            //
            this.entities.forEach((e) =>
            {
                const ed = this.getEntityDefinition(e.name);
                if(ed.extends !== undefined)
                {
                    ed.extends = this.getEntityDefinition(ed.extends.name);
                }
            })

            //
            // Create connection
            //
            switch(type)
            {
                case 'dummy':
                    this.con = new OrmConnectionDummy();
                    done(this);
                    break;
                case 'mysql':
                    try
                    {
                        this.con = new OrmConnectionMysql({
                            host: host || "localhost",
                            user: user || "",
                            password: password || ""
                        }, () =>
                        {
                            done(this);
                        });
                    }
                    catch(error)
                    {
                        reject(error);
                    }
                    break;
            }
        })
    }

    public getEntityIds(ed: OrmEntityDefinition)
    {
        while(ed.extends !== undefined)
        {
            ed = ed.extends;
        }
        return ed.ormIds;
    }

    public getEntityDefinition(entityName) : OrmEntityDefinition
    {
        return entityDefinitions[entityName];
    }

    public createTableFieldType(type, fieldName, fieldData)
    {
        for(let i = 0; i < this.customTypes.length; i++)
        {
            if(this.customTypes[i].name == type)
            {
                return new (this.customTypes[i].type as any)(fieldName, fieldData);
            }
        }
        return null;
    }
}
