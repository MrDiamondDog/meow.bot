import { ApplicationCommandOptionTypes, ComponentInteraction, ComponentTypes, InteractionOptionsWithValue, InteractionTypes, MessageFlags } from "oceanic.js";
import { defineCommand } from "../command";
import { getFeeder, searchFeeders } from "../modules/api";
import { feederFullName, feederMessage } from "../utils/feeder";
import { MeowBot } from "../client";

defineCommand({
    name: "feeder",
    description: "Get a specific feeder by name",

    options: [
        {
            type: ApplicationCommandOptionTypes.STRING,
            name: "name",
            description: "The name of the feeder as seen on meow.camera",
            required: false
        },
        {
            type: ApplicationCommandOptionTypes.STRING,
            name: "id",
            description: "ID of the feeder as seen in the URL on meow.camera",
            required: false
        },
    ],

    async execute(interaction, args) {
        if (args.raw.length !== 1)
            return void interaction.reply({ content: "Must specify only one of `name` or `id` to search.", flags: MessageFlags.EPHEMERAL });

        if (args.raw[0].name === "name") {
            const name = (args.raw[0] as InteractionOptionsWithValue).value as string;
            
            const foundFeeders = await searchFeeders(name)

            if (!foundFeeders || !foundFeeders.length)
                return void interaction.reply({ content: `No feeders found with name ${name}.` });

            if (foundFeeders.length > 1)
                return void interaction.reply({
                    flags: MessageFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: ComponentTypes.TEXT_DISPLAY,
                            content: "Multiple feeders found! Please select the one you would like to view:"
                        },
                        {
                            type: ComponentTypes.ACTION_ROW,
                            components: [
                                {
                                    type: ComponentTypes.STRING_SELECT,
                                    customID: `searchresultpicker-${interaction.user.id}`,
                                    options: foundFeeders.map(feeder => ({ label: feederFullName(feeder), value: feeder.id }))
                                }
                            ]
                        }
                    ]
                })

            const feederDetails = await getFeeder(foundFeeders[0].id);

            if (!feederDetails)
                return void interaction.reply({ content: `No feeders found with name ${name}.` });

            return void interaction.reply(await feederMessage(foundFeeders[0].id, feederDetails) ?? { content: `No feeders found with name ${name}.` })
        } else {
            const id = (args.raw[0] as InteractionOptionsWithValue).value as string;

            const feederDetails = await getFeeder(id);

            if (!feederDetails)
                return void interaction.reply({ content: `No feeders found with id ${id}.` });

            return void interaction.reply(await feederMessage(id, feederDetails) ?? { content: `No feeders found with name ${id}.` })
        }
    },
})

MeowBot.addListener("interactionCreate", async interaction => {
    if (!interaction.isComponentInteraction())
        return;

    const compInteraction = interaction as ComponentInteraction;

    if (!compInteraction.data.customID.startsWith("searchresultpicker-"))
        return;

    const [_, userId] = compInteraction.data.customID.split("-");

    if (userId !== interaction.user.id)
        return compInteraction.reply({ content: "Not your search!", flags: MessageFlags.EPHEMERAL });

    interaction.deferUpdate();

    const id = (compInteraction as ComponentInteraction<ComponentTypes.STRING_SELECT>).data.values.raw[0];

    const feederDetails = await getFeeder(id);

    if (!feederDetails)
        return compInteraction.editOriginal({ content: `No feeders found with id ${id}.` });

    return compInteraction.editOriginal(await feederMessage(id, feederDetails) ?? { content: `No feeders found with id ${id}.` })
});