import { NetworkAdapter } from './communicator';
export interface VaultCredentials {
    appKey: string;
    appSecret: string;
}
export interface VaultItem {
    id: number;
    value: any;
    createdAt: Date;
    updatedAt: Date;
    repoId: number;
    repoName: string;
    accessCount: number;
    dri?: string;
    schemaDri?: string;
    mimeType?: string;
    merkleId?: string;
    oydHash?: string;
    oydSourcePileId?: string;
}
export interface VaultItemQuery {
    id?: number;
    dri?: string;
}
export interface VaultPostItem {
    content: any;
    dri: string;
    schemaDri: string;
    mimeType: string;
    repo?: string;
}
declare type VaultMinMeta = Pick<VaultItem, 'id'>;
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
     * This enables to intercept all network calls made by Vaultifier
     * This is helpful, if you are already using a library for all your network calls
     * If "setNetworkAdapter" is called without providing an adapter, Vaultifier's default adapter is used
     *
     * @param {NetworkAdapter} [adapter]
     *
     * @returns {NetworkAdapter} the network adapter that will be used by Vaultifier
     */
    setNetworkAdapter: (adapter?: NetworkAdapter | undefined) => NetworkAdapter;
    /**
     * Enables or disables end-to-end encryption (if repository supports it)
     *
     * @param {boolean} [isActive=true]
     *
     * @returns {Promise<void>}
     */
    setEnd2EndEncryption(isActive?: boolean): Promise<void>;
    private get _usesEncryption();
    private encryptOrNot;
    /**
     * Posts a value into the data vault's repository, without any metadata
     *
     * @param {Object} value JSON data to post into the repository
     *
     * @returns {Promise<VaultMinMeta>}
     */
    postValue(value: any): Promise<VaultMinMeta>;
    /**
     * Get a specified value from the vault's repository, without any metadata
     *
     * @param {VaultItemQuery} query Query parameters to specify the record that has to be queried
     *
     * @returns {Promise<VaultMinMeta>} the value of the specified item
     */
    getValue(query: VaultItemQuery): Promise<VaultMinMeta>;
    /**
     * Posts an item into the data vault's repository, including any metadata
     *
     * @param item data that is going to be passed to the data vault
     *
     * @returns {Promise<VaultMinMeta>}
     */
    postItem(item: VaultPostItem): Promise<VaultMinMeta>;
    /**
     * Retrieve data from the data vault's repository including its metadata
     *
     * @param {VaultItemQuery} query Query parameters to specify the record that has to be queried
     *
     * @returns {Promise<VaultItem>}
     */
    getItem(query: VaultItemQuery): Promise<VaultItem>;
    /**
     * Retrieve data from the data vault's repository without metadata
     *
     * @returns {Promise<VaultMinMeta[]>} array of JSON data
     */
    getValues(): Promise<VaultMinMeta[]>;
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
