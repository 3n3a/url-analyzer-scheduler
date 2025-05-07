
export type AiLinkSummary = {
    url: string,
    title: string,
    summary: string,
    tags: string[],
};

export type AiLinkError = {
    message: string,
    status: number,
}

export async function getSummaryForUrl(env: Env, aiBaseUrl: string, aiApiKey: string, url: string): Promise<AiLinkSummary> {
    const request = new Request(aiBaseUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${aiApiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
    });
    const response = await env.URL_ANALYZER.fetch(request);

    if (!response.ok) {
        const output = await response.json<{ message: string }>();
        throw new Error('failed to get summary for url: ' + url + '; reason: ' + output.message);
    }

    const json = await response.json();
    console.log("got res: ", json);
    return json as AiLinkSummary;
}