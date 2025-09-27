import fs from "fs";
import { ActivityTypes, Client, InteractionTypes } from "oceanic.js";

import { Commands } from "./command";
import { codeblock, send } from "./utils";
import { deleteAllCommands, registerCommands } from "./register";
import { initTimedMessages, initTrackerMessages } from "./modules/timedMessages";

process.env.TZ = "America/Denver"

export const PREFIX = "/";

export const MeowBot = new Client({
    auth: `Bot ${process.env.DISCORD_TOKEN}`,
    gateway: { intents: ["ALL"] },
    allowedMentions: {
        everyone: true,
        repliedUser: true,
        roles: true,
        users: true,
    },
});

MeowBot.once("ready", async() => {
    console.log(`Connected as ${MeowBot.user.tag} (${MeowBot.user.id})`);
    console.log(`I am in ${MeowBot.guilds.size} guilds`);

    registerCommands();

    MeowBot.editStatus("online", [
        {
            name: "custom",
            state: "finding kitties :3",
            type: ActivityTypes.CUSTOM,
        },
    ]);

    initTimedMessages();
    initTrackerMessages();

    if (fs.existsSync("./data/assets/restart-data.json")) {
        const restartData = JSON.parse(fs.readFileSync("./data/assets/restart-data.json", "utf8"));
        fs.rmSync("./data/assets/restart-data.json");
        send(restartData.channelID, `im back :3${restartData.files ? `\n\`${restartData.files}\`` : ""}`);
    }
});

MeowBot.on("interactionCreate", async interaction => {
    switch (interaction.type) {
    case InteractionTypes.APPLICATION_COMMAND: {
        interaction.defer();

        const cmd = Commands[interaction.data.name];
        if (!cmd)
            return;

        try {
            console.log("Running", cmd.name);
            await cmd.execute(interaction, interaction.data.options);
        } catch (error: any) {
            console.error(
                `Failed to run ${cmd.name}`,
                `\n> ${interaction.data.name}\n`,
                error
            );

            if (error.code === "ERR_BAD_REQUEST" || error.code === "ERR_BAD_RESPONSE") {
                interaction.reply({ content: `https://http.cat/${error.response.status}.jpg` });
            } else {
                interaction.reply({ content: "https://tenor.com/view/brain-damage-gif-25961554" });
            }

            send(
                interaction.channelID,
                `Error while executing command ${cmd.name}\n${codeblock(error || error.message || "Unknown error")}`
            );
        }
    }
    }
});

// TechieBot.on("messageCreate", async message => {
//     if (!message.content.startsWith(PREFIX))
//         return;

//     const content = message.content.slice(PREFIX.length).trim();
//     const args = content.split(" ");

//     const cmdName = args.shift()!;
//     const cmd = Commands[cmdName];
//     if (!cmd)
//         return;

//     if (!message.channel)
//         await message.client.rest.channels.get(message.channelID);

//     if (cmd.ownerOnly && message.author.id !== "523338295644782592") {
//         return reply(message, "You are not allowed to use this command");
//     }

//     try {
//         console.log("Running", cmd.name, "with args", args);
//         await cmd.execute(message as Message<AnyTextableChannel>, ...args);
//     } catch (error: any) {
//         console.error(
//             `Failed to run ${cmd.name}`,
//             `\n> ${message.content}\n`,
//             error
//         );

//         if (error.code === "ERR_BAD_REQUEST" || error.code === "ERR_BAD_RESPONSE") {
//             reply(message, `https://http.cat/${error.response.status}.jpg`);
//         } else {
//             reply(message, "https://tenor.com/view/brain-damage-gif-25961554");
//         }

//       send(message.channelID, `Error while executing command ${cmd.name}\n${codeblock(error || error.message || "Unknown error")}`);
//     }
// });
