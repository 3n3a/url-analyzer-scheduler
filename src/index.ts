import { getSummaryForUrl } from "./ai";
import { PocketBaseClient } from "./pocketbase";

export default {
	async scheduled(event, env, ctx) {
		let pocketbase = null;

		console.log("Scheduled worker running at:", new Date().toISOString());

		try {
			pocketbase = new PocketBaseClient(env.POCKETBASE_BASE_URL);
			await pocketbase.authenticate(env.POCKETBASE_USERNAME, env.POCKETBASE_PASSWORD);

			// Step 1: Get links that need summaries
			let linksWithMissingSummary = await pocketbase.getLinksWithMissingSummary();

			if (!linksWithMissingSummary || linksWithMissingSummary.length === 0) {
				console.log("No links with missing summaries found. Exiting.");
				return;
			}

			console.log(`Found ${linksWithMissingSummary.length} links that need summaries`);

			// Step 2: Process each link
			for (const linkWithMissingSummary of linksWithMissingSummary) {
				try {
					console.log('Starting updating link: ', linkWithMissingSummary.url);
					const updatedLinkSummary = await getSummaryForUrl(env.AI_BASE_URL, env.AI_API_KEY, linkWithMissingSummary.url);
					const updatedLink = {
						...linkWithMissingSummary,
						title: updatedLinkSummary.title,
						notes: updatedLinkSummary.summary,
						tags: updatedLinkSummary.tags,
						changed: true,
					};
					await pocketbase.updateLinkWithMissingSummary(updatedLink);
					console.log('Finished updating link: ', linkWithMissingSummary.url);
				} catch (errorUpdateLink) {
					console.log('Failed to update link: ', linkWithMissingSummary.url, '; ', errorUpdateLink)
				}
			}

			console.log("Successfully processed and updated links with summaries");
		} catch (error) {
			console.error("Error in scheduled worker:", error);
		}
	}
} satisfies ExportedHandler<Env>;
