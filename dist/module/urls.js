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
        this.token = `${baseUrl}/oauth/token`;
        this.postValue = `${baseUrl}/api/data`;
        this.postItem = `${baseUrl}/api/data`;
        this.publicKey = `${baseUrl}/api/repos/${repo}/pub_key`;
        this.privateKey = `${baseUrl}/api/users/current`;
        this.getRepos = `${baseUrl}/api/repos/index`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91cmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLHNEQUFzRDtBQUN0RCxNQUFNLE9BQU8sY0FBYztJQVF6QixZQUFvQixPQUFlLEVBQVUsSUFBWTtRQUN2RCx3Q0FBd0M7UUFDeEMsa0RBQWtEO1FBQ2xELHVGQUF1RjtRQUN2Rix3REFBd0Q7UUFKdEMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUFVLFNBQUksR0FBSixJQUFJLENBQVE7UUFjekQsWUFBTyxHQUFHLENBQUMsS0FBcUIsRUFBVSxFQUFFLENBQzFDLEtBQUssQ0FBQyxFQUFFO1lBQ04sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sYUFBYSxLQUFLLENBQUMsRUFBRSxjQUFjO1lBQ3BELENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGFBQWEsS0FBSyxDQUFDLEdBQUcsZUFBZSxDQUFDO1FBRTNELGlCQUFZLEdBQUcsQ0FBQyxLQUF1QixFQUFVLEVBQUUsQ0FDakQsS0FBSztZQUNILENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLHdCQUF3QixLQUFLLENBQUMsU0FBUyxTQUFTO1lBQ2pFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLHFCQUFxQixJQUFJLENBQUMsSUFBSSxTQUFTLENBQUM7UUFHN0QsYUFBUSxHQUFHLENBQUMsS0FBdUIsRUFBVSxFQUFFLENBQzdDLEtBQUs7WUFDSCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyx3QkFBd0IsS0FBSyxDQUFDLFNBQVMsU0FBUztZQUNqRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDO1FBRTdELGFBQVEsR0FBRyxDQUFDLEtBQXFCLEVBQUUsRUFBRSxDQUNuQyxLQUFLLENBQUMsR0FBRztZQUNQLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGFBQWEsS0FBSyxDQUFDLEdBQUcsZ0JBQWdCO1lBQ3ZELENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGFBQWEsS0FBSyxDQUFDLEVBQUUsZUFBZSxDQUFDO1FBRTFELGVBQVUsR0FBRyxDQUFDLEtBQXFCLEVBQUUsRUFBRSxDQUNyQyxLQUFLLENBQUMsR0FBRztZQUNQLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGFBQWEsS0FBSyxDQUFDLEdBQUcsUUFBUTtZQUMvQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQztRQUVsRCxlQUFVLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxtQkFBbUIsQ0FBQztRQWxDcEQsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLE9BQU8sY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxPQUFPLFdBQVcsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsT0FBTyxXQUFXLENBQUM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLE9BQU8sY0FBYyxJQUFJLFVBQVUsQ0FBQztRQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsT0FBTyxvQkFBb0IsQ0FBQztRQUNqRCxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsT0FBTyxrQkFBa0IsQ0FBQztJQUMvQyxDQUFDO0NBNkJGIn0=