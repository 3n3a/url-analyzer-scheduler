
export type AiLinkSummary = {
    url: string,
    title: string,
    summary: string,
    tags: string[],
};

export async function getSummaryForUrl(aiBaseUrl: string, aiApiKey: string, url: string) {
    const response = await fetch(aiBaseUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${aiApiKey}`,
            'Accepts': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
    });
    return response.json<AiLinkSummary>();
    
}