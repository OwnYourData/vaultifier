"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVaultItemMeta = void 0;
exports.parseVaultItemMeta = (data) => ({
    id: data.id,
    accessCount: data.access_count,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    repoId: data.repo_id,
    repoName: data.repo_name,
    dri: data.dri,
    schemaDri: data.schema_dri,
    mimeType: data.mime_type,
    merkleId: data.merkle_id,
    oydHash: data.oyd_hash,
    oydSourcePileId: data.oyd_source_pile_id,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVhLFFBQUEsa0JBQWtCLEdBQUcsQ0FBQyxJQUFTLEVBQWEsRUFBRSxDQUFDLENBQUM7SUFDM0QsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO0lBQ1gsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZO0lBQzlCLFNBQVMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3BDLFNBQVMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3BDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTztJQUNwQixRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVM7SUFDeEIsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO0lBQ2IsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVO0lBQzFCLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUztJQUN4QixRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVM7SUFDeEIsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRO0lBQ3RCLGVBQWUsRUFBRSxJQUFJLENBQUMsa0JBQWtCO0NBQ3pDLENBQUMsQ0FBQyJ9