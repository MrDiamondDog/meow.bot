import { defineCommand } from "../command";
import { getFeeder, randomFeeder } from "../modules/api";
import { feederMessage } from "../utils/feeder";

defineCommand({
    name: "random",
    description: "Get a random feeder!",

    async execute(interaction, args) {
        const feeder = await randomFeeder();

        if (!feeder)
            return void interaction.reply({ content: "Could not fetch random feeder 3:" });

        const feederDetails = await getFeeder(feeder.id);

        if (!feederDetails)
            return void interaction.reply({ content: "Could not fetch random feeder 3:" });

        interaction.reply(await feederMessage(feeder.id, feederDetails) ?? { content: "Failed to fetch 3:" });
    },
})