import { ButtonStyles, ComponentTypes, MessageActionRow, MessageActionRowComponent, MessageComponent, NullablePartialEmoji } from "oceanic.js";

export function row(...components: MessageActionRowComponent[]): MessageActionRow {
    return {
        type: ComponentTypes.ACTION_ROW,
        components,
    };
}

export function button(
    customID: string,
    label: string,
    style: number = ButtonStyles.PRIMARY,
    disabled?: boolean,
    emoji?: NullablePartialEmoji
): MessageActionRowComponent {
    return {
        type: ComponentTypes.BUTTON,
        style,
        emoji,
        customID,
        label,
        disabled,
    };
}
