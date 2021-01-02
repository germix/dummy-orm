import { OrmTableFieldType } from "./types/OrmTableFieldType";

export class OrmTableBuilder
{
    private name;
    private dbname;
    private allFields = [];

    constructor(dbname)
    {
        this.dbname = dbname;
    }

    public setName(name)
    {
        this.name = name;
    }

    public addField(field)
    {
        this.allFields.push(field);
    }

    public toSqlString()
    {
        let sql = `CREATE TABLE IF NOT EXISTS \`${this.dbname}\`.\`${this.name}\`(`;
        let first = true;
        let hasPrimaryKeys = false;

        //
        // Column definitions
        //
        this.allFields.forEach((field) =>
        {
            if(!first)
                sql += ',';
            first = false;
            if(field.getPrimaryKey())
            {
                hasPrimaryKeys = true;
            }

            sql += field.toString();
        });

        //
        // Primary key definitions
        //
        if(hasPrimaryKeys)
        {
            sql += ", " + this.generatePrimaryKey();
        }

        //
        // Foreign keys definitions
        //
        this.allFields.forEach((field) =>
        {
            if(field.getForeignKeyTable() != null)
            {
                sql += ", " + this.generateForeignKey(field);
            }
        });

        sql += ") ENGINE = InnoDB DEFAULT CHARACTER SET = utf8 COLLATE = utf8_bin;";

        return sql;
    }

    private generatePrimaryKey()
    {
        let sql = "PRIMARY KEY (";
        let first = true;
        this.allFields.forEach((field) =>
        {
            if(field.getPrimaryKey())
            {
                if(!first)
                    sql += ',';
                first = false;
                let fieldName = field.getName();

                sql += `\`${fieldName}\``;
            }
        });
        sql += ")";
        return sql;
    }

    private generateForeignKey(field: OrmTableFieldType)
    {
        let column = field.getName();
        let foreignTable = field.getForeignKeyTable();
        let foreignColumn = field.getForeignKeyColumn();
        if(foreignColumn == null)
        {
            foreignColumn = column;
        }
        return `FOREIGN KEY (\`${column}\`) REFERENCES \`${foreignTable}\`(\`${foreignColumn}\`)`;
    }
}
