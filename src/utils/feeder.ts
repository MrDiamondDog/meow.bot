import { ComponentTypes, CreateMessageOptions, Message, MessageFlags } from "oceanic.js";
import { BasicFeederInfo, FeederInfo } from "../modules/api";
import { spawn } from "child_process";
import { sleep } from "../utils";

export function feederFullName(feeder: BasicFeederInfo): string {
    return `${feeder.englishName ?? feeder.name}${!feeder.englishName && feeder.translatedName ? ` (${feeder.translatedName})`: ""}`;
}

export async function feederMessage(id: string, feeder: FeederInfo): Promise<CreateMessageOptions | null> {
    const image = await feederImage(id);

    if (!image)
        return null;

    return {
        flags: MessageFlags.IS_COMPONENTS_V2,
        components: [
            {
                type: ComponentTypes.CONTAINER,
                components: [
                    {
                        type: ComponentTypes.TEXT_DISPLAY,
                        content: `# ${feederFullName(feeder)}`
                    },
                    {
                        type: ComponentTypes.TEXT_DISPLAY,
                        content: `:clock3: ${new Date().toLocaleTimeString("en-US", { timeZone: feeder.timeZone })}`
                    },
                    {
                        type: ComponentTypes.TEXT_DISPLAY,
                        content: `:canned_food: ${feeder.stock.kibble}`
                    },
                    {
                        type: ComponentTypes.TEXT_DISPLAY,
                        content: `:fish: ${feeder.stock.snack}`
                    },
                    {
                        type: ComponentTypes.TEXT_DISPLAY,
                        content: `:eye: ${feeder.viewers.jiemao + feeder.viewers.local + feeder.viewers.purrrr}`
                    },
                    {
                        type: ComponentTypes.TEXT_DISPLAY,
                        content: `[View on meow.camera](https://meow.camera/#${id})`
                    },
                    {
                        type: ComponentTypes.MEDIA_GALLERY,
                        items: [
                            {
                                media: {
                                    url: "attachment://uploaded.jpeg"
                                }
                            }
                        ]
                    }
                ]
            }
        ],
        attachments: [
            {
                id: 0,
                filename: "uploaded.jpeg",
                description: "Feeder camera image"
            }
        ],
        files: [
            {
                index: 0,
                contents: image,
                name: "uploaded.jpeg"
            }
        ]
    }
}

export async function feederImage(id: string): Promise<Buffer | null> {
    const pingRes = await fetch(`https://api.meow.camera/catHouse/${id}/ping/front`);

    if (!pingRes.ok)
        return null;

    const ping = await pingRes.json();

    await fetch(ping.url);

    const ffmpeg = spawn("ffmpeg", [
        "-i", ping.url,
        "-frames:v", "1",
        "-f", "image2",
        "-q:v", "2",
        "pipe:1"
    ]);

    let chunks: any[] = [];
    ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));
    // ffmpeg.stderr.on("data", console.log);

    const buffer = await new Promise<Buffer>(resolve => ffmpeg.on("close", () => {
        resolve(Buffer.concat(chunks));
    }));

    return buffer;
}