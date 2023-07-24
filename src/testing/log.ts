import colors from 'colors';

export function logError(message: string)
{
    console.log(colors.bgRed("[ERROR]:") + " " + message);
}

export function logTrace(message: string)
{
    console.log(colors.bgCyan("[TRACE]:") + " " + message);
}

export function logQuery(message: string, on: boolean)
{
    if(on)
        console.log(colors.bgBlue("[QUERY]:") + " " + message);
}

export function logOrmEntity(message: string)
{
    console.log(colors.bgGreen("[ORM ENTITY]:") + " " + message);
}

export function logOrmField(message: string)
{
    console.log(colors.bgMagenta("[ORM FIELD]:") + " " + message);
}

export function logOrmExtends(message: string)
{
    console.log(colors.bgCyan("[ORM EXTENDS]:") + " " + message);
}
