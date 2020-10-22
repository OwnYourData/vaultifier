"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultifierUrls = void 0;
// TODO: User should be able to change repo on the fly
class VaultifierUrls {
    constructor(baseUrl, repo) {
        // TODO: re-enable this security barrier
        // don't allow insecure builds for production mode
        // if (process.env.NODE_ENV === 'production' && new URL(baseUrl).protocol !== 'https:')
        //   throw Error('Protocol of baseUrl is not "https".');
        this.baseUrl = baseUrl;
        this.repo = repo;
        this.getItem = (query) => query.id
            ? `${this.baseUrl}/api/data/${query.id}?p=id&f=full`
            : `${this.baseUrl}/api/data/${query.dri}?p=dri&f=full`;
        this.getMetaItems = (query) => query
            ? `${this.baseUrl}/api/data?schema_dri=${query.schemaDri}&f=meta`
            : `${this.baseUrl}/api/data?repo_id=${this.repo}&f=meta`;
        this.getItems = (query) => query
            ? `${this.baseUrl}/api/data?schema_dri=${query.schemaDri}&f=full`
            : `${this.baseUrl}/api/data?repo_id=${this.repo}&f=full`;
        this.getValue = (query) => query.dri
            ? `${this.baseUrl}/api/data/${query.dri}?p=dri&f=plain`
            : `${this.baseUrl}/api/data/${query.id}/p=id&f=plain`;
        this.deleteItem = (query) => query.dri
            ? `${this.baseUrl}/api/data/${query.dri}?p=dri`
            : `${this.baseUrl}/api/data/${query.id}?p=id`;
        this.getSchemas = () => `${this.baseUrl}/api/meta/schemas`;
        this.token = `${baseUrl}/oauth/token`;
        this.postValue = `${baseUrl}/api/data`;
        this.postItem = `${baseUrl}/api/data`;
        this.publicKey = `${baseUrl}/api/repos/${repo}/pub_key`;
        this.privateKey = `${baseUrl}/api/users/current`;
        this.getRepos = `${baseUrl}/api/repos/index`;
    }
}
exports.VaultifierUrls = VaultifierUrls;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91cmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHNEQUFzRDtBQUN0RCxNQUFhLGNBQWM7SUFRekIsWUFBb0IsT0FBZSxFQUFVLElBQVk7UUFDdkQsd0NBQXdDO1FBQ3hDLGtEQUFrRDtRQUNsRCx1RkFBdUY7UUFDdkYsd0RBQXdEO1FBSnRDLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFRO1FBY3pELFlBQU8sR0FBRyxDQUFDLEtBQXFCLEVBQVUsRUFBRSxDQUMxQyxLQUFLLENBQUMsRUFBRTtZQUNOLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGFBQWEsS0FBSyxDQUFDLEVBQUUsY0FBYztZQUNwRCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxHQUFHLGVBQWUsQ0FBQztRQUUzRCxpQkFBWSxHQUFHLENBQUMsS0FBdUIsRUFBVSxFQUFFLENBQ2pELEtBQUs7WUFDSCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyx3QkFBd0IsS0FBSyxDQUFDLFNBQVMsU0FBUztZQUNqRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDO1FBRzdELGFBQVEsR0FBRyxDQUFDLEtBQXVCLEVBQVUsRUFBRSxDQUM3QyxLQUFLO1lBQ0gsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sd0JBQXdCLEtBQUssQ0FBQyxTQUFTLFNBQVM7WUFDakUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8scUJBQXFCLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQztRQUU3RCxhQUFRLEdBQUcsQ0FBQyxLQUFxQixFQUFFLEVBQUUsQ0FDbkMsS0FBSyxDQUFDLEdBQUc7WUFDUCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxHQUFHLGdCQUFnQjtZQUN2RCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxFQUFFLGVBQWUsQ0FBQztRQUUxRCxlQUFVLEdBQUcsQ0FBQyxLQUFxQixFQUFFLEVBQUUsQ0FDckMsS0FBSyxDQUFDLEdBQUc7WUFDUCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxHQUFHLFFBQVE7WUFDL0MsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sYUFBYSxLQUFLLENBQUMsRUFBRSxPQUFPLENBQUM7UUFFbEQsZUFBVSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sbUJBQW1CLENBQUM7UUFsQ3BELElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxPQUFPLGNBQWMsQ0FBQztRQUN0QyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsT0FBTyxXQUFXLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLE9BQU8sV0FBVyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxPQUFPLGNBQWMsSUFBSSxVQUFVLENBQUM7UUFDeEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLE9BQU8sb0JBQW9CLENBQUM7UUFDakQsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLE9BQU8sa0JBQWtCLENBQUM7SUFDL0MsQ0FBQztDQTZCRjtBQWpERCx3Q0FpREMifQ==