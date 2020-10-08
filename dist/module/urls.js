// TODO: User should be able to change repo on the fly
export class VaultifierUrls {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91cmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLHNEQUFzRDtBQUN0RCxNQUFNLE9BQU8sY0FBYztJQU96QixZQUFvQixPQUFlLEVBQVUsSUFBWTtRQUFyQyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBUTtRQVd6RCxZQUFPLEdBQUcsQ0FBQyxLQUFxQixFQUFVLEVBQUUsQ0FDMUMsS0FBSyxDQUFDLEVBQUU7WUFDTixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxjQUFjLEtBQUssQ0FBQyxFQUFFLFVBQVU7WUFDakQsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sWUFBWSxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUM7UUFFckQsYUFBUSxHQUFHLENBQUMsS0FBdUIsRUFBVSxFQUFFLENBQzdDLEtBQUs7WUFDSCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyx3QkFBd0IsS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUMxRCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxjQUFjLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQztRQUVyRCxhQUFRLEdBQUcsQ0FBQyxLQUFxQixFQUFFLEVBQUUsQ0FDbkMsS0FBSyxDQUFDLEdBQUc7WUFDUCxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxpQkFBaUIsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUM3QyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxnQkFBZ0IsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBRWhELGVBQVUsR0FBRyxDQUFDLEtBQXFCLEVBQUUsRUFBRSxDQUNyQyxLQUFLLENBQUMsR0FBRztZQUNQLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGlCQUFpQixLQUFLLENBQUMsR0FBRyxFQUFFO1lBQzdDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGdCQUFnQixLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7UUFFaEQsZUFBVSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sbUJBQW1CLENBQUM7UUE5QnBELElBQUksSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVE7WUFDeEMsTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsT0FBTyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLE9BQU8sY0FBYyxJQUFJLFFBQVEsQ0FBQztRQUN0RCxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsT0FBTyxXQUFXLENBQUM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLE9BQU8sY0FBYyxJQUFJLFVBQVUsQ0FBQztRQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsT0FBTyxvQkFBb0IsQ0FBQztJQUNuRCxDQUFDO0NBdUJGIn0=