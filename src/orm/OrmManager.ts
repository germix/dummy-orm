import { OrmEntityMapper } from "../testing/OrmEntityMapper";
import { OrmConnection } from "./connection/OrmConnection";
import { OrmEntityDefinition } from "./entity/OrmEntityDefinition";
import { OrmOneToManyCollection } from "./entity/OrmOneToManyCollection";
import { OrmConfig } from "./OrmConfig";
import { OrmInsertBuilder } from "./OrmInsertBuilder";
import { OrmReference } from "./OrmReference";
import { OrmUpdateBuilder } from "./OrmUpdateBuilder";
import { EntityClass } from "./types";
import { camelcaseToUnderscore, getEntityFieldValue, makeReferenceFieldId } from "./utils";

function isEmptyObject(obj)
{
    return Object.keys(obj).length === 0 && obj.constructor === Object
}

export class OrmManager
{
    private con: OrmConnection;
    private config: OrmConfig;
    private entitiesToDelete = [];
    private entitiesToPersist = [];

    constructor(config: OrmConfig)
    {
        this.con = config.con;
        this.config = config;
    }

    public async findBy<T>(entityClass: EntityClass<T>|string, criteria) : Promise<T[]>
    {
        const cfg = this.config;
        const entityName = (typeof entityClass === 'string') ? entityClass : entityClass.name;
        let ed = this.config.getEntityDefinition(entityName);
        let entityDefinition = ed;

        //
        // Select
        //
        let sql = "SELECT ";
        // TODO: let dbName = this.config.dbname;
        let tableName = ed.tableName;

        if(ed.extends === undefined)
        {
            sql += "*";
        }
        else
        {
            let fieldsToSelect = [];
            do
            {
                for(const fieldName in ed.ormFields)
                {
                    fieldsToSelect.push(cfg.wrapFieldName(fieldName));
                }
                for(const fieldName in ed.ormManyToOne)
                {
                    const edTarget = cfg.getEntityDefinition(ed.ormManyToOne[fieldName].target);
                    Object.entries(this.config.getEntityIds(edTarget)).forEach(([idFieldName, idFieldData]) =>
                    {
                        fieldsToSelect.push(cfg.wrapFieldName(makeReferenceFieldId(fieldName, idFieldName)));
                    });
                }
                if(ed.extends !== undefined)
                {
                    ed = ed.extends;
                }
                else
                {
                    for(const idName in ed.ormIds)
                    {
                        fieldsToSelect.push(`${cfg.wrapTableName(ed.tableName)}.${cfg.wrapFieldName(idName)} as ${cfg.wrapFieldName(idName)}`);
                    }
                    ed = null;
                }
            }
            while(ed !== null);

            sql += fieldsToSelect.join(',');
        }

        //
        // From
        //
        // TODO: sql += ` FROM \`${dbName}\`.\`${tableName}\``;
        sql += ` FROM ${cfg.wrapTableName(tableName)}`;

        //
        // Inner join
        //
        ed = entityDefinition;
        if(ed.extends !== undefined)
        {
            //
            // Get ids
            //
            let ids = this.config.getEntityIds(ed);

            //
            // ...
            //
            ed = ed.extends;
            do
            {
                // TODO: sql += ` INNER JOIN \`${dbName}\`.\`${ed.tableName}\` ON `;
                sql += ` INNER JOIN ${cfg.wrapTableName(ed.tableName)} ON `;
                let first = true;
                for(const idName in ids)
                {
                    if(!first)
                        sql += " AND ";
                    first = false;
                    // TODO: sql += `\`${dbName}\`.\`${ed.tableName}\`.\`${idName}\` = \`${dbName}\`.\`${tableName}\`.\`${idName}\``;
                    sql += `${cfg.wrapTableName(ed.tableName)}.${cfg.wrapFieldName(idName)} = ${cfg.wrapTableName(tableName)}.${cfg.wrapFieldName(idName)}`;
                }
                ed = ed.extends;
            }
            while(ed !== undefined);
        }

        //
        // Where
        //
        if(criteria !== undefined && !isEmptyObject(criteria))
        {
            sql = "SELECT * FROM (" + sql + ") AS tmp";
            sql += " WHERE ";
            let first = true;
            for(const columnName in criteria)
            {
                const columnValue = criteria[columnName];
                if(!first)
                    sql += " AND ";
                first = false;
                const underscoreColumnName = camelcaseToUnderscore(columnName);
                if(columnValue === null)
                    sql += `${cfg.wrapFieldName(underscoreColumnName)} = NULL`;
                else
                    sql += `${cfg.wrapFieldName(underscoreColumnName)} = '${columnValue}'`;
            }
        }

        sql += ';';

        return new Promise((done, reject) =>
        {
            //
            // Execute
            //
            this.config.con.query(sql).then((result) =>
            {
                done((new OrmEntityMapper(this.config)).map(entityClass, result.rows));
            })
            .catch(reject);
        })
    }

    public async findOneBy<T>(entityClass: EntityClass<T>|string, criteria) : Promise<T>
    {
        return new Promise((done) =>
        {
            this.findBy(entityClass, criteria).then((result) =>
            {
                if(result.length == 0)
                    done(null);
                else
                    done(result[0]);
            });
        });
    }

    public delete(entity) : OrmManager
    {
        this.entitiesToDelete.push(entity);
        return this;
    }

    public persist(entity) : OrmManager
    {
        this.entitiesToPersist.push(entity);
        return this;
    }

    public async flush() : Promise<any[]>
    {
        let allPromises = [];
        this.entitiesToDelete.forEach((entity) =>
        {
            allPromises.push(this.deleteEntity(entity, entity.constructor.name));
        });
        this.entitiesToDelete = [];

        this.entitiesToPersist.forEach((entity) =>
        {
            allPromises.push(this.persistEntity(entity, entity.constructor.name));
        });
        this.entitiesToPersist = [];

        return Promise.all(allPromises);
    }

    public deleteAndFlush(entity) : Promise<any>
    {
        return this.delete(entity).flush();
    }

    public persistAndFlush(entity) : Promise<any>
    {
        return this.persist(entity).flush();
    }

    private async deleteEntity(entity, entityName) : Promise<any>
    {
        return new Promise<void>(async (done, reject) =>
        {
            // Get entity definitions
            const eds = (() =>
            {
                let ed = this.config.getEntityDefinition(entityName);
                const eds = [];
                while(ed !== undefined)
                {
                    eds.push(ed);
                    ed = ed.extends;
                }
                return eds;
            })();

            // Get entity definition ids
            const ormIds = (() =>
            {
                let ed = this.config.getEntityDefinition(entityName);
                while(ed.extends !== undefined)
                {
                    ed = ed.extends;
                }
                return ed.ormIds;
            })();

            // Remove for each table
            for await (const ed of eds)
            {
                let sql = `DELETE FROM ${this.config.wrapTableName(ed.tableName)} WHERE `;
                let first = true;

                for(const idName in ormIds)
                {
                    if(!first)
                        sql += " AND ";
                    first = true;
                    let idValue = getEntityFieldValue(entity, idName);
                    if(idValue === null)
                        sql += `${this.config.wrapFieldName(idName)} = null`;
                    else
                        sql += `${this.config.wrapFieldName(idName)} = '${idValue}'`;
                }
                sql += ";";

                try
                {
                    await this.con.query(sql);
                }
                catch (error)
                {
                    reject(error);
                }
            }

            done();
        })
    }

    private async persistEntity(entity, entityName) : Promise<any>
    {
        return (entity['id'] === undefined)
            ? this.persistEntityInsert(entity, entityName)
            : this.persistEntityUpdate(entity, entityName)
            ;
    }

    private async persistEntityInsert(entity, entityName) : Promise<any>
    {
        let ed: OrmEntityDefinition = this.config.getEntityDefinition(entityName);
        let baseEd = this.config.getEntityDefinitionBase(ed);
        let builder = (new OrmInsertBuilder(this.config, ed.tableName));

        if(entity.constructor.name == entityName && baseEd.discriminatorColumn)
        {
            entity[baseEd.discriminatorColumn] = ed.discriminatorValue;
        }
        if(ed.extends !== undefined)
        {
            await this.persistEntityInsert(entity, ed.extends.name);

            for(const columnName in baseEd.ormIds)
            {
                this.addInsertColumn(builder, entity, columnName, baseEd.ormIds[columnName]);
            }
        }

        // OnPreInsert
        if(entity.ormOnPreInsert)
            entity.ormOnPreInsert();

        // Add insert values
        let ids = this.config.getEntityIds(ed);
        for(const columnName in ids)
        {
            this.addInsertColumn(builder, entity, columnName, ids[columnName]);
        }
        for(const columnName in ed.ormFields)
        {
            this.addInsertColumn(builder, entity, columnName, ed.ormFields[columnName]);
        }
        for(const columnName in ed.ormManyToOne)
        {
            const ent: OrmReference<any> = entity[columnName];

            if(ent && ent.id)
            {
            }
            else if(ent && ent.value)
            {
                const refEd = this.config.getEntityDefinition(ed.ormManyToOne[columnName].target);
                const refIds = this.config.getEntityIds(refEd);

                Object.entries(refIds).forEach(([idFieldName, idFieldData]) =>
                {
                    builder.add(
                        makeReferenceFieldId(columnName, idFieldName),
                        ent.value[idFieldName]
                    );
                })
            }
            else
            {
                console.log('CHECK NULLABLE');
            }
        }

        //
        // OnPreUpdate
        //
        if(entity.ormOnPreUpdate)
        {
            entity.ormOnPreUpdate();
        }

        //
        // Execute
        //
        const result = await this.con.query(builder.getSqlQuery());
        if(result.insertId !== undefined && entity['id'] === undefined)
        {
            entity['id'] = result.insertId;
        }

        //
        // OnPostInsert
        //
        if(entity.ormOnPostInsert)
        {
            entity.ormOnPostInsert();
        }

        //
        // Update OneToMany
        //
        await this.persistOrDeleteOneToMany(entity, ed);
    }

    private async persistEntityUpdate(entity, entityName) : Promise<any>
    {
        let ed: OrmEntityDefinition = this.config.getEntityDefinition(entityName);
        let baseEd = this.config.getEntityDefinitionBase(ed);
        let builder = (new OrmUpdateBuilder(this.config, ed.tableName));

        // Update super classes
        if(ed.extends !== undefined)
        {
            await this.persistEntityUpdate(entity, ed.extends.name);
        }

        for(const columnName in ed.ormFields)
        {
            builder.add(columnName, getEntityFieldValue(entity, columnName));
        }

        //
        // Execute
        //
        if(ed.ormFields !== undefined)
        {
            await this.con.query(builder.getSqlQuery());
        }

        //
        // OnPostUpdate
        //
        if(entity.ormOnPostUpdate)
        {
            entity.ormOnPostUpdate();
        }

        //
        // Update OneToMany
        //
        await this.persistOrDeleteOneToMany(entity, ed);
    }

    private addInsertColumn(builder, entity, columnName, columnData)
    {
        if(columnData.type == 'autoincrement')
        {
            let value = getEntityFieldValue(entity, columnName);
            if(value !== undefined)
            {
                builder.add(columnName, value);
            }
        }
        else
        {
            builder.add(columnName, getEntityFieldValue(entity, columnName));
        }
    }

    private async persistOrDeleteOneToMany(entity, ed: OrmEntityDefinition): Promise<void>
    {
        if(ed.ormOneToMany)
        {
            const entityId = entity["id"];

            // TODO: console.log("ed.ormOneToMany");
            const columns = [];
            for(const columnName in ed.ormOneToMany)
                columns.push({ columnName: columnName, columnData: ed.ormOneToMany[columnName] })

            // TODO: console.log("x", columns)

            for await (const c of columns)
            {
                // TODO: console.log("columnName", c.columnName)
                //const columnData = ed.ormOneToMany[columnName];
                // TODO: console.log("columnData", c.columnData)
                const collection = entity[c.columnName] as OrmOneToManyCollection<any>;
                // TODO: console.log("collection", collection)

                const mappedById = makeReferenceFieldId(c.columnData.mappedBy, "id")
                const mappedEntity = this.config.getEntityDefinition(c.columnData.entity);

                // TODO: console.log("mappedEntity", mappedEntity)
                for await (const elem of collection.removedElements)
                {
                    if(!elem[mappedById])
                    {
                        await this.con.query(`UPDATE ${this.config.wrapTableName(mappedEntity.tableName)} SET ${mappedById} = NULL WHERE id = '${elem['id']}'`);
                    }
                }
                collection.removedElements = [];

                for await (const elem of collection.persistedElements)
                {
                    if(!elem[mappedById])
                    {
                        await this.con.query(`UPDATE ${this.config.wrapTableName(mappedEntity.tableName)} SET ${mappedById} = '${entityId}' WHERE id = '${elem['id']}'`);
                    }
                }
                collection.persistedElements = [];
            }
        }
    }
}
