import { OrmConfig } from "./orm/OrmConfig";
import { OrmSchemaBuilder } from "./orm/OrmSchemaBuilder";
import { Test, User, Person, Customer, Employee, Objekt, Box } from "./testing/entity/Test";
import { CustomTableFieldJson } from "./testing/fieldtype/TableFieldJson";
import { OrmEntityDefinition } from "./orm/entity/OrmEntityDefinition";
import isObject from "./orm/utils/isObject";
import { Parser } from "./orm/parser/Parser";

function isString(value)
{
    return typeof value === 'string' || value instanceof String;
}

async function main()
{
    let cfg = await (new OrmConfig()).init({
        type: 'mysql',
        dbname: 'db_000',
        user: '',
        password: '',
        entities: [
            Test,
            User,
            Objekt,
            Box,
            Person,
            Customer,
            Employee,
        ],
        customTypes: [
            {
                name: 'json',
                type: CustomTableFieldJson,
            }
        ]
    });

    let osb = (new OrmSchemaBuilder(cfg));
/*
    await osb.drop();
    await osb.build();

    let omgr = new OrmManager(cfg);

    for(let i = 1; i <= 5; i++)
    {
        let user = new User();
        user.id = 'u'+i;
        user.username = 'user'+i;
        user.password = '123';
        await omgr.persistAndFlush(user)
    }

    let personId = 1;
    for(let i = 1; i <= 5; i++, personId++)
    {
        let p = new Customer();
        p.id = 'p'+personId;
        p.type = 'customer';
        p.name = 'person'+personId;
        p.customerField = 'customer-' + i;
        await omgr.persistAndFlush(p)
    }
    for(let i = 1; i <= 5; i++, personId++)
    {
        let p = new Employee();
        p.id = 'p'+personId;
        p.type = 'employee';
        p.name = 'person'+personId;
        p.employeeField = 'employee-' + i;
        await omgr.persistAndFlush(p)
    }

    {
        let user = new User();
        user.id = 'u2';
        await omgr.deleteAndFlush(user);
    }
    
    let box = new Box();
    box.id = 'box1';
    box.type = 'box';
    box.name = 'Wooden box';
    await omgr.persistAndFlush(box);

    console.log(await omgr.findBy(User, {}));
    console.log(await omgr.findBy(Box, {}));
    console.log(await omgr.findBy(Customer, {
    }));
    console.log(await omgr.findOneBy(Customer, {
        id: 'p1'
    }));
*/
    test_qb(cfg);
}

try
{
    main();
}
catch(error)
{
    console.log(error);
}

//--------------------------------------------------------------------------------------------------

class SelectExpr
{
    fields;
    
    constructor(fields)
    {
        this.fields = fields;
    }
};

class FromExpr
{
    entity;
    alias;
    
    constructor(entity, alias)
    {
        this.entity = entity;
        this.alias = alias;
    }
}

function innerJoin(config: OrmConfig, entityDefinition: OrmEntityDefinition)
{
    let dbName = config.dbname;
    
    //
    // Inner join
    //
    let ed = entityDefinition;
    let sql = '';
    if(ed.extends !== undefined)
    {
        //
        // Get ids
        //
        let ids = config.getEntityIds(ed);

        //
        // ...
        //
        ed = ed.extends;
        do
        {
            sql += ` INNER JOIN \`${dbName}\`.\`${ed.tableName}\` ON `;
            let first = true;
            for(const idName in ids)
            {
                if(!first)
                    sql += " AND ";
                first = false;
                sql += `\`${dbName}\`.\`${ed.tableName}\`.\`${idName}\` = \`${dbName}\`.\`${entityDefinition.tableName}\`.\`${idName}\``;
            }
            ed = ed.extends;
        }
        while(ed !== undefined);
    }
    return sql;
}

class QueryBuilder
{
    private config: OrmConfig;
    private selectExpr: SelectExpr = null;
    private fromParts: FromExpr[] = [];
    private whereExpr: {};

    constructor(cfg: OrmConfig)
    {
        this.config = cfg;
    }

    public select(fields) : QueryBuilder
    {
        if(this.selectExpr != null)
        {
            // TODO
        }
        this.selectExpr = new SelectExpr(fields);

        return this;
    }

    public from(from, alias) : QueryBuilder
    {
        this.fromParts.push(new FromExpr(from, alias));

        return this;
    }

    public where(where) : QueryBuilder
    {
        this.whereExpr = where;

        return this;
    }

    public getSqlQuery() : string
    {
        if(this.selectExpr != null)
        {
            return this.getSelectQuery();
        }
    }

    private getSelectQuery() : string
    {
        let sql = '';
        let dbName = this.config.dbname;
        

        let lastSubAliasId = 1;
        
        let aliasTablesToData = {};
        let aliasFieldsToData = {};

        
        let fieldsToSelect = [];
        let fromClauses = [];
        let whereClause = null;

        if(this.fromParts.length > 0)
        {
            this.fromParts.forEach((from) =>
            {
                let entityDefinition = this.config.getEntityDefinition(from.entity.name);
                let tableName = entityDefinition.tableName;
                let mainSubAlias = 't' + lastSubAliasId++;
                let fromClause = `\`${dbName}\`.\`${tableName}\` ${mainSubAlias}`;
                
                aliasTablesToData[from.alias] = {};
                aliasTablesToData[from.alias][tableName] = mainSubAlias;

                {
                    let ed = entityDefinition;
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
                            let first = true;
                            let joinSubAlias = 't' + lastSubAliasId++;
                            
                            fromClause += ` INNER JOIN \`${dbName}\`.\`${ed.tableName}\` ${joinSubAlias} ON `;
                            aliasTablesToData[from.alias][ed.tableName] = joinSubAlias;

                            for(const idName in ids)
                            {
                                if(!first)
                                    fromClause += " AND ";
                                first = false;
                                fromClause += `${mainSubAlias}.\`${idName}\` = ${joinSubAlias}.\`${idName}\``;
                            }
                            ed = ed.extends;
                        }
                        while(ed !== undefined);
                    }
                }
                
                fromClauses.push(fromClause);

            })
            //sql += " FROM " + fromClauses.join(', ');
        }
        
        //
        // Fields to select
        //
        Object.entries(this.selectExpr.fields).forEach(([key, value]) =>
        {
            const fromAlias = key;
            const splittedFields = (value as string).split(',');
            const entityDefinition = this.findEntityDefinitionFromAlias(fromAlias);

            splittedFields.forEach((fieldName) =>
            {
                const {
                    subAlias,
                    fieldNameAs,
                    fieldNameOriginal,
                } = this.getFieldData(aliasTablesToData, fromAlias, entityDefinition, fieldName);
                /*
                let fieldNameParts = fieldName.split(" as ");

                console.log(fieldNameParts)

                let fieldNameAs = (fieldNameParts.length == 2) ? fieldNameParts[1] : fieldName;
                let fieldNameOriginal = (fieldNameParts.length == 2) ? fieldNameParts[0] : fieldName;

                let entityDefinitionFromField = this.config.findDefinitionFromFieldOrId(entityDefinition, fieldNameOriginal);
                console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrr')
                console.log(entityDefinitionFromField);
                
                let subAlias = aliasTablesToData[fromAlias][entityDefinitionFromField.tableName];
                console.log('subAlias: ' + subAlias)
                console.log(aliasTablesToData[fromAlias]);
                console.log(entityDefinitionFromField.tableName)
*/
                fieldsToSelect.push(`${subAlias}.${fieldNameOriginal} as ${fieldNameAs}`);
            });
        });

        //
        // Where clauses
        //
        if(isString(this.whereExpr))
        {
            whereClause = this.whereExpr;
        }
        else if(isObject(this.whereExpr))
        {
            let whereAnds = [];
            for(const key in this.whereExpr)
            {
                const fromAlias = key;
                const whereValue = this.whereExpr[fromAlias];
                const entityDefinition = this.findEntityDefinitionFromAlias(fromAlias);

                for(const fieldName in whereValue)
                {
                    const {
                        subAlias,
                        fieldNameAs,
                        fieldNameOriginal,
                    } = this.getFieldData(aliasTablesToData, fromAlias, entityDefinition, fieldName);
                    const fieldValue = whereValue[fieldName];

                    let expr = null;
                    if(isString(fieldValue))
                    {
                        expr = `${subAlias}.${fieldNameOriginal} = '${fieldValue}'`;
                    }

                    if(expr == null)
                    {
                        // TODO
                    }
                    whereAnds.push(expr);
                }
            }
            whereClause = whereAnds.join(" AND ");
        }

        sql += 'SELECT ' + fieldsToSelect.join(', ');
        if(fromClauses.length > 0)
        {
            sql += " FROM " + fromClauses.join(', ');
        }
        if(whereClause != null)
        {
            sql += " WHERE " + whereClause;
        }
        console.log('AAAAAAAAAAAAAAAA')
        console.log(sql)
        console.log('BBBBBBBBBBBBBBBB')
        console.log(aliasTablesToData)
        /*
        //
        // Select
        //
        let fieldsToSelect = [];

        Object.entries(this.selectExpr.fields).forEach(([key, value]) =>
        {
            let splittedFields = (value as string).split(',');

            splittedFields.forEach((fieldName) => {
                fieldsToSelect.push(`${key}.${fieldName}`);
            });
        });

        sql += "SELECT " + fieldsToSelect.join(', ');

        //
        // From
        //
        if(this.fromParts.length > 0)
        {
            let fromClauses = [];

            this.fromParts.forEach((from) =>
            {
                let ed = this.config.getEntityDefinition(from.entityName.name);
                let tableName = ed.tableName;
                let fromClause = `\`${dbName}\`.\`${tableName}\` ${from.alias}`;

                //if(this.joinParts[from.alias] !== undefined)
                {
                    fromClause += " INNER JOIN person ON a.id = person.id";
                }

                fromClauses.push(fromClause);

            })
            sql += " FROM " + fromClauses.join(', ');
        }

        //
        // Where
        //
        if(this.whereExpr != null)
        {
            sql += " WHERE " + this.whereExpr;
        }
*/
        return sql;
    }

    private getFieldData(aliasTablesToData, fromAlias, entityDefinition: OrmEntityDefinition, fieldName)
    {
        let fieldNameParts = fieldName.split(" as ");
        let fieldNameAs = (fieldNameParts.length == 2) ? fieldNameParts[1] : fieldName;
        let fieldNameOriginal = (fieldNameParts.length == 2) ? fieldNameParts[0] : fieldName;
        let entityDefinitionFromField = this.config.findDefinitionFromFieldOrId(entityDefinition, fieldNameOriginal);
        let subAlias = aliasTablesToData[fromAlias][entityDefinitionFromField.tableName];

        return {
            subAlias,
            fieldNameAs,
            fieldNameOriginal,
        }
    }

    private findEntityDefinitionFromAlias(fromAlias)
    {
        let from = this.fromParts.find((from) =>
        {
            return from.alias == fromAlias;
        });
        if(!from)
        {
            // TODO
        }
        
        let entityDefinition = this.config.getEntityDefinition(from.entity.name);

        return entityDefinition;
    }
};

class OrmEntityMapper
{
    map<T>(entityClass, result, done)
    {
        let resultEntities: T[] = [];

        //
        // Map rows to entities
        //
        result.forEach((row) =>
        {
            let entity = new entityClass();

            for(const columnName in row)
            {
                entity[columnName] = row[columnName];
            }

            resultEntities.push(entity);
        });
        // Done
        done(resultEntities);
    }
}

async function test_qb(config: OrmConfig)
{
    let qb = new QueryBuilder(config);

    if(false)
    {
    console.log('----------------------------')
    
    qb.select({
        a: 'id,name,type as g'
    })
    .from(Customer, 'a')
    //.where('a.id = 5')
    .where({
        a: {
            id: 'p1'
        }
    })
    ;

    
    qb.select({
        u: 'id,username'
    })
    .from(User, 'u')
    /*
    .where({
        u: {
            id: '1'
        }
    })
    */
    .where("u.id = '1' OR u.id = '2'")
    ;
    
    let sql = qb.getSqlQuery();
    
    console.log(sql);

    await (async () =>
    {
        
        return new Promise((done, reject) =>
        {
            config.con.query(`USE ${config.dbname};`, async function(err, result, fields)
            {
                done(0);
            })
        })
    })();

    //
    // Execute
    //
    config.con.query(sql, async function(err, result, fields)
    {
        if(err)
        {
            console.error(err)
            //reject(err);
        }
        else
        {
            console.log(result);
            /*
            (new OrmEntityMapper()).map(Customer, result, (entities) =>
            {
                console.log(entities)
            })
            */
        }
    });
}

/*
    SELECT u.id,u.username
        FROM User u
*/
/*
    SELECT u{id,username}
        FROM User u
*/

    let qr = new OrmQueryRunner(config);
    let query1 = `
    SELECT u.id,u.username
        FROM User u
    `;
    let query2 = `
    SELECT u{id,username}
        FROM User u
        WHERE u.id == 3 && u.id >= 2
    `;
    let query3 =
    `
    SELECT e{id,employeeField}
        FROM Employee e
    `
    let query4 = `
    SELECT u{id,username}
        FROM User u
        WHERE u.username LIKE '%5'
    `;

    let query10 = `SELECT u{id,username} FROM User u WHERE u.id == 2 + 2`;
    let query11 = `SELECT u{id,username} FROM User u WHERE u.id == 3 - 2`;
    let query7 = `SELECT u{id,username} FROM User u WHERE u.id == 2 * 2`;
    let query8 = `SELECT u{id,username} FROM User u WHERE u.id == 2 / 2`;
    let query9 = `SELECT u{id,username} FROM User u WHERE u.id == 3 % 2`;
    let query5 = `SELECT u{id,username} FROM User u WHERE u.id == 2 << 1`;
    let query6 = `SELECT u{id,username} FROM User u WHERE u.id == 4 >> 1`;
    let query12 = `SELECT u{id,username} FROM User u WHERE u.id == 2 | 1`;
    let query13 = `SELECT u{id,username} FROM User u WHERE u.id == 2 & 2`;
    let query14 = `SELECT u{id,username} FROM User u WHERE u.id < 3`;
    let query15 = `SELECT u{id,username} FROM User u WHERE u.id <= 3`;
    let query16 = `SELECT u{id,username} FROM User u WHERE u.id > 3`;
    let query17 = `SELECT u{id,username} FROM User u WHERE u.id >= 3`;
    let query18 = `SELECT u{id,username} FROM User u WHERE u.id != 3`;
    let query19 = `SELECT u{id,username} FROM User u WHERE u.id == 3`;
    let query20 = `SELECT u{id,username} FROM User u WHERE u.id BETWEEN 2 AND 3`;
    let query21 = `SELECT u{id,username} FROM User u WHERE NOT u.id BETWEEN 2 AND 3`;


    qr.run(query21)
    .then((entities) =>
    {
        console.log(entities)
    })

    /*
    let parser = new Parser(config);

    let sql = parser.parse(query2);
    
    console.log(sql);
    */

    console.log('-----------------------------------------')
}

class OrmQueryRunner
{
    private config: OrmConfig;

    constructor(cfg: OrmConfig)
    {
        this.config = cfg;
    }

    public run(query) : Promise<any>
    {
        return new Promise((done, reject) =>
        {
            let parser = new Parser(this.config);

            let sql = parser.parse(query);
            
            console.log(sql);

            //
            // Execute
            //
            this.config.con.query(sql, async function(err, result, fields)
            {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    (new OrmEntityMapper()).map(Customer, result, (entities) =>
                    {
                        done(entities);
                    })
                }
            });
        });
    }
}
