
import PocketBase, { RecordAuthResponse, RecordModel } from 'pocketbase';

export type Link = {
    id: string,
    notes: string,
    status: string,
    tags: string[],
    title: string,
    url: string,
    changed?: boolean,
}

export type Tag = {
    id: string;
    name: string;
}

export class PocketBaseClient {
    client: PocketBase;
    userData!: RecordAuthResponse<RecordModel>;
    tags: Tag[] = [];

    constructor(apiBaseUrl: string) {
        this.client = new PocketBase(apiBaseUrl); 
    }

    async authenticate(username: string, password: string) {
        this.userData = await this.client.collection('users').authWithPassword(username, password);
    }

    private async getTags() {
        return this.client.collection('tags').getFullList<Tag>();
    }

    // These are placeholders for your actual implementation
    async getLinksWithMissingSummary() {
        return this.client.collection('links').getFullList<Link>({
            filter: '(notes:lower = "" || notes:lower ~ "this link provides information about" || tags:length = 0)',
        });
    }

    async updateLinkWithMissingSummary(link: Link) {
        // make sure new tags exist
        this.tags = await this.getTags();
        const nonExistantTags: string[] = [];

        if (!link.changed) return;    
        const currentNonExistantTags = link.tags
            .filter((tagName: string) => this.tags.find((el) => el.name === tagName.toLowerCase()) === undefined)
        nonExistantTags.push(...currentNonExistantTags);

        const tagBatch = this.client.createBatch();
        nonExistantTags.forEach((tagName) => {
            tagBatch.collection('tags').create({
                name: tagName.toLowerCase(),
            });
        });
        if (nonExistantTags.length > 0) {
            await tagBatch.send();
        }

        this.tags = await this.getTags();

        // transform tag names into tag ids
        const tagIds = link.tags
                .map((tagName) => this.tags.find((el) => el.name === tagName.toLowerCase()))
                .filter((el) => !!el)
                .map((tag) => tag.id);

        // update link
        const linkUpdateResponse = await this.client.collection('links').update(link.id, {
            title: link.title,
            notes: link.notes,
            tags: tagIds,
        })

        console.log('link updated: ', linkUpdateResponse.id);
        return true;
    }
}