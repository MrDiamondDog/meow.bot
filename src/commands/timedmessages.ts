import { ApplicationCommandOptionTypes } from "oceanic.js";
import { defineCommand } from "../command";
import { feederStore, initTimedMessages } from "../modules/timedMessages";

defineCommand({
    name: "timedmessages",
    description: "Set a channel for random cat posting",

    options: [
        {
            name: "channel",
            description: "The channel",
            type: ApplicationCommandOptionTypes.CHANNEL,
            required: true
        },
        {
            name: "time",
            description: "Time between random cats (minutes)",
            type: ApplicationCommandOptionTypes.NUMBER,
            required: true,
        }
    ],

    execute(interaction, args) {
        const channel = args.getChannel("channel")!;
        const time = args.getNumber("time")!;

        feederStore.data.channel = channel.id;
        feederStore.data.time = time;

        feederStore.save();

        interaction.reply({ content: `Random cats will now be posted in <#${channel.id}> every ${time} minutes.` });

        initTimedMessages();
    }
})