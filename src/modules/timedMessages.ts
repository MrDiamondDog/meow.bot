import { ComponentTypes } from "oceanic.js";
import { send } from "../utils";
import { feederFullName, feederMessage } from "../utils/feeder";
import { getFeeder, randomFeeder } from "./api";
import { createStore } from "./dataStore";

export const feederStore = createStore<{ 
    channel?: string, 
    time?: number, 
    trackers: {
        feederId: string,
        lastMessage: number,
        users: { userId: string, notify?: boolean }[]
    }[],
}>("feeder", { trackers: [] });

let currentInterval: NodeJS.Timeout | null = null;
let currentTrackerInterval: NodeJS.Timeout | null = null;

export function initTimedMessages() {
    feederStore.load();

    if (!feederStore.data.channel || !feederStore.data.time)
        return;

    if (currentInterval)
        clearInterval(currentInterval);

    currentInterval = setInterval(async () => {
        const feeder = await randomFeeder();

        if (!feeder)
            return void send(feederStore.data.channel!, "Could not fetch random feeder 3:");

        const feederDetails = await getFeeder(feeder.id);

        if (!feederDetails)
            return void send(feederStore.data.channel!, "Could not fetch random feeder 3:");

        send(feederStore.data.channel!, await feederMessage(feeder.id, feederDetails) ?? { content: "Failed to fetch 3:" });
    }, 1000 * 60 * feederStore.data.time);
}

export function initTrackerMessages() {
    feederStore.load();

    if (!feederStore.data.channel || !feederStore.data.time)
        return;

    if (currentTrackerInterval)
        clearInterval(currentTrackerInterval);

    currentTrackerInterval = setInterval(async () => {
        for (const tracker of feederStore.data.trackers) {
            if (tracker.lastMessage >= Date.now() - 1000 * 60 * 60 || !tracker.users.length)
                continue;

            const feeder = await getFeeder(tracker.feederId);

            if (!feeder)
                continue;

            if (!feeder.catPresent)
                continue;

            tracker.lastMessage = Date.now();
            
            const message = await feederMessage(tracker.feederId, feeder);

            if (!message)
                continue;

            message.components!.unshift({
                type: ComponentTypes.TEXT_DISPLAY,
                content: `A cat has been spotted at ${feederFullName(feeder)}!\n-# ${tracker.users.map(user => user.notify ? `<@${user.userId}>` : "").filter(Boolean).join(" ")}`
            })

            send(feederStore.data.channel!, message);
        }
    }, 1000 * 60);
}