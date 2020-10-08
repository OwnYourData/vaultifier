"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultifierUrls = void 0;
// TODO: User should be able to change repo on the fly
class VaultifierUrls {
    constructor(baseUrl, repo) {
        this.baseUrl = baseUrl;
        this.repo = repo;
        this.getItem = (query) => query.id
            ? `${this.baseUrl}/api/items/${query.id}/details`
            : `${this.baseUrl}/api/dri/${query.dri}/details`;
        this.getItems = (query) => query
            ? `${this.baseUrl}/api/data?schema_dri=${query.schemaDri}`
            : `${this.baseUrl}/api/repos/${this.repo}/items`;
        this.getValue = (query) => query.dri
            ? `${this.baseUrl}/api/data?dri=${query.dri}`
            : `${this.baseUrl}/api/data?id=${query.id}`;
        this.deleteItem = (query) => query.dri
            ? `${this.baseUrl}/api/data?dri=${query.dri}`
            : `${this.baseUrl}/api/data?id=${query.id}`;
        this.getSchemas = () => `${this.baseUrl}/api/meta/schemas`;
        if (new URL(baseUrl).protocol !== 'https:')
            throw Error('Protocol of baseUrl is not "https".');
        this.token = `${baseUrl}/oauth/token`;
        this.postValue = `${baseUrl}/api/repos/${repo}/items`;
        this.postItem = `${baseUrl}/api/data`;
        this.publicKey = `${baseUrl}/api/repos/${repo}/pub_key`;
        this.privateKey = `${baseUrl}/api/users/current`;
    }
}
exports.VaultifierUrls = VaultifierUrls;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91cmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHNEQUFzRDtBQUN0RCxNQUFhLGNBQWM7SUFPekIsWUFBb0IsT0FBZSxFQUFVLElBQVk7UUFBckMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUFVLFNBQUksR0FBSixJQUFJLENBQVE7UUFXekQsWUFBTyxHQUFHLENBQUMsS0FBcUIsRUFBVSxFQUFFLENBQzFDLEtBQUssQ0FBQyxFQUFFO1lBQ04sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sY0FBYyxLQUFLLENBQUMsRUFBRSxVQUFVO1lBQ2pELENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLFlBQVksS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDO1FBRXJELGFBQVEsR0FBRyxDQUFDLEtBQXVCLEVBQVUsRUFBRSxDQUM3QyxLQUFLO1lBQ0gsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sd0JBQXdCLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDMUQsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sY0FBYyxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUM7UUFFckQsYUFBUSxHQUFHLENBQUMsS0FBcUIsRUFBRSxFQUFFLENBQ25DLEtBQUssQ0FBQyxHQUFHO1lBQ1AsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8saUJBQWlCLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDN0MsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sZ0JBQWdCLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUVoRCxlQUFVLEdBQUcsQ0FBQyxLQUFxQixFQUFFLEVBQUUsQ0FDckMsS0FBSyxDQUFDLEdBQUc7WUFDUCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxpQkFBaUIsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUM3QyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxnQkFBZ0IsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBRWhELGVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLG1CQUFtQixDQUFDO1FBOUJwRCxJQUFJLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRO1lBQ3hDLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFFckQsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLE9BQU8sY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxPQUFPLGNBQWMsSUFBSSxRQUFRLENBQUM7UUFDdEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLE9BQU8sV0FBVyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxPQUFPLGNBQWMsSUFBSSxVQUFVLENBQUM7UUFDeEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLE9BQU8sb0JBQW9CLENBQUM7SUFDbkQsQ0FBQztDQXVCRjtBQXZDRCx3Q0F1Q0MifQ==