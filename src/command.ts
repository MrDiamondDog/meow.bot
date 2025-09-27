import { ApplicationCommandOptionTypes, CommandInteraction, InteractionOptionsWrapper } from "oceanic.js";

export interface CommandOption {
    name: string;
    description: string;
    required?: boolean;
    type?: ApplicationCommandOptionTypes;
    choices?: { name: string, value: string }[];
    options?: CommandOption[];
}

export interface SlashCommand {
    name: string;
    description: string;
    usage?: string;
    options?: CommandOption[];
    execute(interaction: CommandInteraction, args: InteractionOptionsWrapper): Promise<any> | any;
}

export const Commands = {} as Record<string, SlashCommand>;

export function defineCommand(c: SlashCommand): void {
    const cmd = c as any as SlashCommand;
    Commands[cmd.name] = cmd;
}
