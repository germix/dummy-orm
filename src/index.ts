import { OrmConfig } from "./orm/OrmConfig";
import { OrmSchemaBuilder } from "./orm/OrmSchemaBuilder";
import { Test, Person, Customer, Employee, Box } from "./testing/entity/Test";
import { CustomTableFieldJson } from "./testing/fieldtype/TableFieldJson";
import { test_0 } from "./testing/test_0";
import { test_qb } from "./testing/test_qb";
import { test_one_to_many } from "./testing/test_one_to_many";
import { Objekt } from "./app/Objekt";
import { User } from "./app/User";
import { Video } from "./app/Video";
import { Playlist } from "./app/Playlist";
import { PlaylistHasVideo } from "./app/PlaylistHasVideo";
import { Comment } from "./app/Comment";
import { OrmManager } from "./orm/OrmManager";
import { OrmReference } from "./orm/OrmReference";
import { ConfigDriverType } from "./orm/types";
import { logError, logTrace } from "./testing/log";

interface IConfigDB
{
    type: string;
    port: number;
    host: string;
    user: string;
    password: string;
    database: string;
}
const configMYSQL: IConfigDB =
{
    type: 'mysql',
    port: 3307,
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'test-orm',
}
const configMARIADB: IConfigDB =
{
    type: 'mariadb',
    port: 3307,
    host: 'localhost',
    user: '',
    password: '',
    database: 'test-orm',
}
const configPOSTGRESQL: IConfigDB =
{
    type: 'postgresql',
    port: 5532,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test-orm',
}
const configDB = configMYSQL;
//const configDB = configPOSTGRESQL;

async function install(cfg: OrmConfig)
{
    let osb = (new OrmSchemaBuilder(cfg));

    //
    // Drop database
    //
    try
    {
        logTrace("Drop database");
        await osb.drop();
    }
    catch (error)
    {
        logError(error.toString());
    }

    //
    // Create database and generate schema
    //
    try
    {
        logTrace("Build database");
        await osb.create();
        await osb.generate();
    }
    catch (error)
    {
        logError(error.toString());
    }

    logTrace("Connect");
    await cfg.connect();

    let omgr = new OrmManager(cfg);

    let user = new User();
    user.username = 'ger';
    user.password = '123';
    await omgr.persistAndFlush(user)

    console.log('User id: ' + user.id)

    const userFound = await omgr.findOneBy(User, {
        id: 1
    });
    console.log("userFound", userFound);

    await omgr.deleteAndFlush(userFound);

    console.log("POST DELETE")

    let video = new Video();
    video.title = 'Mi video';
    video.source = 'http://example.com/videos/1';

    await omgr.persistAndFlush(video)

    for(let i = 1; i <= 5; i++)
    {
        let comment = new Comment();
        comment.message = "message " + i;
        comment.user = new OrmReference(user);
        comment.parent = new OrmReference(video);
        await omgr.persistAndFlush(comment)
    }
}


async function main()
{
    let cfg = new OrmConfig();

    try
    {
        await cfg.init({
            type: configDB.type as ConfigDriverType,
            port: configDB.port,
            host: configDB.host,
            dbname: configDB.database,
            user: configDB.user,
            password: configDB.password,
            entities: [
                Test,

                Objekt,
                User,
                Video,
                Comment,
                Playlist,
                PlaylistHasVideo,

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
    }
    catch (error)
    {
    }

    await install(cfg);

    const em = new OrmManager(cfg);

    await createUser("User 1");
    await createUser("User 2");
    await createUser("User 3");
    await createUser("User 4");
    await createCustomer("Customer 1");
    await createCustomer("Customer 2");
    await createCustomer("Customer 3");
    await createCustomer("Customer 4");

    async function createUser(name: string) {
        const u = new User();
        u.username = name;
        u.password = "123";
        await em.persistAndFlush(u);
    }
    async function createCustomer(name: string) {
        const c = new Customer();
        c.name = name;
        c.customerField = (new Date()).getTime() ^ (new Date()).getTime() + (new Date()).getTime(),
        await em.persistAndFlush(c);
    }

    /*
    await cfg.con.query(`USE \`${cfg.dbname}\``);

    //test_0(cfg);
    */
    test_qb(cfg);
    /*
    //test_one_to_many(cfg);
    */
}

try
{
    main();
}
catch(error)
{
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    console.log(error);
}

//--------------------------------------------------------------------------------------------------
