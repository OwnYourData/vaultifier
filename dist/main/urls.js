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
        this.resolveInstallCode = (code) => `${this.baseUrl}/api/install/${code}`;
        this.publicKey = () => 
        // oyd.settings is the default repo for storing the public key
        `${this.baseUrl}/api/repos/${this.repo || 'oyd.settings'}/pub_key`;
        this.getEncryptedPassword = (nonce) => `${this.support}/${nonce}`;
        this.setRepo = (repo) => this.repo = repo;
        this.info = `${baseUrl}/api/active`;
        this.support = `${baseUrl}/api/support`;
        this.token = `${baseUrl}/oauth/token`;
        this.postValue = `${baseUrl}/api/data`;
        this.postItem = `${baseUrl}/api/data`;
        this.putItem = `${baseUrl}/api/data`;
        this.privateKey = `${baseUrl}/api/users/current`;
        this.getRepos = `${baseUrl}/api/repos/index`;
    }
}
exports.VaultifierUrls = VaultifierUrls;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91cmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHNEQUFzRDtBQUN0RCxNQUFhLGNBQWM7SUFVekIsWUFBb0IsT0FBZSxFQUFVLElBQVk7UUFDdkQsd0NBQXdDO1FBQ3hDLGtEQUFrRDtRQUNsRCx1RkFBdUY7UUFDdkYsd0RBQXdEO1FBSnRDLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFRO1FBZ0J6RCxZQUFPLEdBQUcsQ0FBQyxLQUFxQixFQUFVLEVBQUUsQ0FDMUMsS0FBSyxDQUFDLEVBQUU7WUFDTixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxFQUFFLGNBQWM7WUFDcEQsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sYUFBYSxLQUFLLENBQUMsR0FBRyxlQUFlLENBQUM7UUFFM0QsaUJBQVksR0FBRyxDQUFDLEtBQXVCLEVBQVUsRUFBRSxDQUNqRCxLQUFLO1lBQ0gsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sd0JBQXdCLEtBQUssQ0FBQyxTQUFTLFNBQVM7WUFDakUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8scUJBQXFCLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQztRQUc3RCxhQUFRLEdBQUcsQ0FBQyxLQUF1QixFQUFVLEVBQUUsQ0FDN0MsS0FBSztZQUNILENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLHdCQUF3QixLQUFLLENBQUMsU0FBUyxTQUFTO1lBQ2pFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLHFCQUFxQixJQUFJLENBQUMsSUFBSSxTQUFTLENBQUM7UUFFN0QsYUFBUSxHQUFHLENBQUMsS0FBcUIsRUFBRSxFQUFFLENBQ25DLEtBQUssQ0FBQyxHQUFHO1lBQ1AsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sYUFBYSxLQUFLLENBQUMsR0FBRyxnQkFBZ0I7WUFDdkQsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sYUFBYSxLQUFLLENBQUMsRUFBRSxlQUFlLENBQUM7UUFFMUQsZUFBVSxHQUFHLENBQUMsS0FBcUIsRUFBRSxFQUFFLENBQ3JDLEtBQUssQ0FBQyxHQUFHO1lBQ1AsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sYUFBYSxLQUFLLENBQUMsR0FBRyxRQUFRO1lBQy9DLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGFBQWEsS0FBSyxDQUFDLEVBQUUsT0FBTyxDQUFDO1FBRWxELGVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLG1CQUFtQixDQUFDO1FBQ3RELHVCQUFrQixHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztRQUM3RSxjQUFTLEdBQUcsR0FBRyxFQUFFO1FBQ2YsOERBQThEO1FBQzlELEdBQUcsSUFBSSxDQUFDLE9BQU8sY0FBYyxJQUFJLENBQUMsSUFBSSxJQUFJLGNBQWMsVUFBVSxDQUFDO1FBQ3JFLHlCQUFvQixHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxFQUFFLENBQUM7UUFFckUsWUFBTyxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQTNDM0MsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLE9BQU8sYUFBYSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxPQUFPLGNBQWMsQ0FBQTtRQUN2QyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsT0FBTyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLE9BQU8sV0FBVyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxPQUFPLFdBQVcsQ0FBQztRQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsT0FBTyxXQUFXLENBQUM7UUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLE9BQU8sb0JBQW9CLENBQUM7UUFDakQsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLE9BQU8sa0JBQWtCLENBQUM7SUFDL0MsQ0FBQztDQW9DRjtBQTVERCx3Q0E0REMifQ==