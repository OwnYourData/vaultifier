// TODO: User should be able to change repo on the fly
export class VaultifierUrls {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91cmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLHNEQUFzRDtBQUN0RCxNQUFNLE9BQU8sY0FBYztJQVV6QixZQUFvQixPQUFlLEVBQVUsSUFBWTtRQUN2RCx3Q0FBd0M7UUFDeEMsa0RBQWtEO1FBQ2xELHVGQUF1RjtRQUN2Rix3REFBd0Q7UUFKdEMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUFVLFNBQUksR0FBSixJQUFJLENBQVE7UUFnQnpELFlBQU8sR0FBRyxDQUFDLEtBQXFCLEVBQVUsRUFBRSxDQUMxQyxLQUFLLENBQUMsRUFBRTtZQUNOLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGFBQWEsS0FBSyxDQUFDLEVBQUUsY0FBYztZQUNwRCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxHQUFHLGVBQWUsQ0FBQztRQUUzRCxpQkFBWSxHQUFHLENBQUMsS0FBdUIsRUFBVSxFQUFFLENBQ2pELEtBQUs7WUFDSCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyx3QkFBd0IsS0FBSyxDQUFDLFNBQVMsU0FBUztZQUNqRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDO1FBRzdELGFBQVEsR0FBRyxDQUFDLEtBQXVCLEVBQVUsRUFBRSxDQUM3QyxLQUFLO1lBQ0gsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sd0JBQXdCLEtBQUssQ0FBQyxTQUFTLFNBQVM7WUFDakUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8scUJBQXFCLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQztRQUU3RCxhQUFRLEdBQUcsQ0FBQyxLQUFxQixFQUFFLEVBQUUsQ0FDbkMsS0FBSyxDQUFDLEdBQUc7WUFDUCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxHQUFHLGdCQUFnQjtZQUN2RCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxFQUFFLGVBQWUsQ0FBQztRQUUxRCxlQUFVLEdBQUcsQ0FBQyxLQUFxQixFQUFFLEVBQUUsQ0FDckMsS0FBSyxDQUFDLEdBQUc7WUFDUCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxHQUFHLFFBQVE7WUFDL0MsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sYUFBYSxLQUFLLENBQUMsRUFBRSxPQUFPLENBQUM7UUFFbEQsZUFBVSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sbUJBQW1CLENBQUM7UUFDdEQsdUJBQWtCLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sZ0JBQWdCLElBQUksRUFBRSxDQUFDO1FBQzdFLGNBQVMsR0FBRyxHQUFHLEVBQUU7UUFDZiw4REFBOEQ7UUFDOUQsR0FBRyxJQUFJLENBQUMsT0FBTyxjQUFjLElBQUksQ0FBQyxJQUFJLElBQUksY0FBYyxVQUFVLENBQUM7UUFDckUseUJBQW9CLEdBQUcsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUVyRSxZQUFPLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBM0MzQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsT0FBTyxhQUFhLENBQUM7UUFDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLE9BQU8sY0FBYyxDQUFBO1FBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxPQUFPLGNBQWMsQ0FBQztRQUN0QyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsT0FBTyxXQUFXLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLE9BQU8sV0FBVyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxPQUFPLFdBQVcsQ0FBQztRQUNyQyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsT0FBTyxvQkFBb0IsQ0FBQztRQUNqRCxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsT0FBTyxrQkFBa0IsQ0FBQztJQUMvQyxDQUFDO0NBb0NGIn0=