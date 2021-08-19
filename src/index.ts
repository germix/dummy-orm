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

async function install(cfg: OrmConfig)
{
    let osb = (new OrmSchemaBuilder(cfg));

    await osb.drop();
    await osb.build();

    let omgr = new OrmManager(cfg);

    let user = new User();
    user.username = 'ger';
    user.password = '123';
    await omgr.persistAndFlush(user)

    console.log('User id: ' + user.id)

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
    let cfg = await (new OrmConfig()).init({
        type: 'mysql',
        dbname: 'db_000',
        user: '',
        password: '',
        entities: [
            Test,

            Objekt,
            User,
            Video,
            Comment,
            Playlist,
            PlaylistHasVideo,

            /*
            Box,
            Person,
            Customer,
            Employee,
            */
        ],
        customTypes: [
            {
                name: 'json',
                type: CustomTableFieldJson,
            }
        ]
    });

    await install(cfg);

    //test_0(cfg);
    test_qb(cfg);
    //test_one_to_many(cfg);
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
