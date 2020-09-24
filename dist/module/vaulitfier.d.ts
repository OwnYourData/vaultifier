export interface VaultCredentials {
    appKey: string;
    appSecret: string;
}
export interface VaultItem {
    id: number;
    repoId: number;
    value: any;
    createdAt: Date;
    updatedAt: Date;
    repoName: string;
    accessCount: number;
    merkleId?: string;
}
declare type VaultItemMeta = Pick<VaultItem, 'id'>;
export declare class Vaultifier {
    baseUrl: string;
    repo: string;
    credentials?: VaultCredentials | undefined;
    private publicKey?;
    private urls;
    private communicator;
    /**
     *
     * @param {string} baseUrl The base url of your data vault (e.g. https://data-vault.eu). Communication is only allowed via https
     * @param {string} repo Repository, where to write to. This is defined in your plugin's manifest
     * @param {string} [credentials] "Identifier" (appKey) that was generated after registering the plugin. "Secret" (appSecret) that was generated after registering the plugin.
     */
    constructor(baseUrl: string, repo: string, credentials?: VaultCredentials | undefined);
    /**
     * Initializes Vaultifier (authorizes against data vault)
     *
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * Enables or disables end-to-end encryption (if repository supports it)
     *
     * @param {boolean} [isActive=true]
     *
     * @returns {Promise<void>}
     */
    setEnd2EndEncryption(isActive?: boolean): Promise<void>;
    private get _usesEncryption();
    /**
     * Posts data into the data vault's repository
     *
     * @param {Object} data JSON data to post into the repository
     *
     * @returns {Promise<VaultItemMeta>}
     */
    postItem(data: any): Promise<VaultItemMeta>;
    /**
     * Retrieve data from the data vault's repository
     *
     * @returns {Promise<VaultItem>}
     */
    getItem(itemId: number): Promise<VaultItem>;
    /**
     * Retrieve data from the data vault's repository
     *
     * @returns {Promise<any[]>} array of JSON data
     */
    getItems(): Promise<any[]>;
    /**
     * @returns {boolean} true, if Vaultifier has all necessary data and was initalized correctly.
     */
    isValid(): boolean;
    private _getInstallCodeUrl;
    /**
     * Resolves an install code (usually 6 digits) and returns a set of VaultCredentials, if successful.
     * VaultCredentials are automatically set to the Vaultifier instance as well.
     *
     * @param {string} code Install code, usually 6 digits
     *
     * @returns {Promise<VaultCredentials>}
     */
    resolveInstallCode(code: string): Promise<VaultCredentials>;
    private _authorize;
    /**
     * Creates a valid repo path out of the specified string parameters
     *
     * @param path
     *
     * @returns {string}
     */
    static getRepositoryPath: (...path: Array<string>) => string;
}
export {};
