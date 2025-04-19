import { getSummaryForUrl } from "./ai";
import { PocketBaseClient } from "./pocketbase";

export default {
	async scheduled(event, env, ctx) {
	  let pocketbase = null;

	  // Log the execution start
	  console.log("Scheduled worker running at:", new Date().toISOString());
	  
	  try {
		pocketbase = new PocketBaseClient(env.POCKETBASE_BASE_URL);
		await pocketbase.authenticate(env.POCKETBASE_USERNAME, env.POCKETBASE_PASSWORD);

		// Step 1: Get links that need summaries
		let linksWithMissingSummary = await pocketbase.getLinksWithMissingSummary();
		
		// Check if there are any links to process
		if (!linksWithMissingSummary || linksWithMissingSummary.length === 0) {
		  console.log("No links with missing summaries found. Exiting.");
		  return;
		}
		
		console.log(`Found ${linksWithMissingSummary.length} links that need summaries`);
		
		// Step 2: Process each link
		// TODO: rewrite so this happens sequentially
		// easier to debug and stuff
		const summaryPromises = linksWithMissingSummary.map(async (link) => {
		  try {
			// Get summary for this URL
			const summary = await getSummaryForUrl(env.AI_BASE_URL, env.AI_API_KEY, link.url);
			
			// Return the link with its new summary
			return {
			  ...link,
			  title: summary.title,
			  notes: summary.summary,
			  tags: summary.tags,
			  changed: true,
			};
		  } catch (error) {
			console.error(`Error processing link ${link.url}:`, error);
			// Return the original link without a summary if there was an error
			return {
				...link,
				changed: false,
			};
		  }
		});
		
		// Wait for all summaries to complete
		const processedLinks = await Promise.all(summaryPromises);
		
		// Step 3: Update the links with their new summaries
		await pocketbase.updateLinksWithMissingSummary(processedLinks);
		
		console.log("Successfully processed and updated links with summaries");
	  } catch (error) {
		console.error("Error in scheduled worker:", error);
	  }
	}
  } satisfies ExportedHandler<Env>;
