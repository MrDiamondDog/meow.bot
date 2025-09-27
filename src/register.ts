import { Commands } from "./command";

const guildId = "1295884660131237920";
const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_ID}/guilds/${guildId}/commands`;

export function registerCommands() {
    const commands = Object.values(Commands)
        .map(cmd => ({
            name: cmd.name,
            description: cmd.description,
            type: 1,
            options: cmd.options,
        }));

    fetch(url, {
        body: JSON.stringify(commands),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
        method: "PUT",
    }).then(res => {
        if (res.ok)
            console.log("Commands registered");
        else
            console.error("Failed to register commands", res.status, res.statusText, JSON.stringify(commands, null, 4));
        return res.json();
    });
}

export async function deleteAllCommands() {
    // use bulk overwrite with empty array
    const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_ID}/guilds/${guildId}/commands`;

    await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
        body: JSON.stringify([]),
        method: "PUT",
    }).then(res => {
        if (res.ok)
            console.log("Commands deleted");
        else
            console.error("Failed to delete commands", res.status, res.statusText);
    });
}
