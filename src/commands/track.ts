import { ApplicationCommandOptionTypes, InteractionOptionsWithValue } from "oceanic.js";
import { defineCommand } from "../command";
import { getFeeder, searchFeeders } from "../modules/api";
import { feederStore, initTrackerMessages } from "../modules/timedMessages";

defineCommand({
    name: "track",
    description: "Track a feeder and get notifications when there are cats",

    options: [
        {
            name: "name",
            description: "Name of the feeder to track",
            type: ApplicationCommandOptionTypes.STRING,
            required: true
        },
        {
            name: "notify",
            description: "If you should be pinged",
            type: ApplicationCommandOptionTypes.BOOLEAN,
            required: true
        }
    ],

    async execute(interaction, args) {
        const name = args.getString("name")!;
        const notify = args.getBoolean("notify")!;
                    
        const foundFeeders = await searchFeeders(name)

        if (!foundFeeders || !foundFeeders.length)
            return void interaction.reply({ content: `No feeders found with name ${name}.` });

        if (foundFeeders.length > 1)
            return void interaction.reply({ content: "More than one feeder found! Please narrow your search." })

        const feederDetails = await getFeeder(foundFeeders[0].id);

        if (!feederDetails)
            return void interaction.reply({ content: `No feeders found with name ${name}.` });

        const existingTracker = feederStore.data.trackers.find(tracker => tracker.feederId === foundFeeders[0].id);
        if (existingTracker) {
            const existingUser = existingTracker.users.find(user => user.userId === interaction.user.id);
            if (existingUser)
                existingTracker.users = existingTracker.users.filter(user => user.userId !== interaction.user.id);
            else
                existingTracker.users.push({ userId: interaction.user.id, notify });
        } else {
            feederStore.data.trackers.push({ feederId: foundFeeders[0].id, users: [{ userId: interaction.user.id, notify }], lastMessage: 0 });
        }

        feederStore.save();

        initTrackerMessages();

        return void interaction.reply({ content: "You will be notified whenever there is a cat at this feeder. Run this command again to undo." });
    },
})