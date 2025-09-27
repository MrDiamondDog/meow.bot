import { randomFrom } from "../utils";

export const apiUrl = "https://api.meow.camera";

export type BasicFeederInfo = {
	id: string;
	name: string;
	englishName: string | null;
	translatedName: string | null;
}

export type FeederInfo = BasicFeederInfo & {
	images: string[];
	subscribeCount: number;
	todayFeedCount: number;
	todayShowCount: number;
	timeZone: string;
	catPresent: boolean;
	lightTurnedOn: boolean;
	deviceTemperatureCelsius: number;
	stock: {
		kibble: string;
		snack: string;
	};
	hasSnacks: boolean;
	viewers: {
		local: number;
		jiemao: number;
		purrrr: number;
	};
}

export type FeederError = {
    status: string;
    message: string;
}

export async function getFeeder(id: string): Promise<FeederInfo | null> {
    const res = await fetch(`${apiUrl}/catHouse/${id}`);

    if (!res.ok)
        return null;

	const data: FeederInfo | FeederError = await res.json();

	if ((data as FeederError).status === "error")
		return null;

	return data as FeederInfo;
}

export async function randomFeeder(): Promise<BasicFeederInfo | null> {
    const res = await fetch(`${apiUrl}/catHouses/random`);

    if (!res.ok)
        return null;

	const data: BasicFeederInfo[] = await res.json();

	return randomFrom(data);
}

export async function searchFeeders(query: string): Promise<BasicFeederInfo[] | null> {
    const res = await fetch(`${apiUrl}/catHouses/search`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ query })
	});

    if (!res.ok)
        return null;

	return await res.json();
}