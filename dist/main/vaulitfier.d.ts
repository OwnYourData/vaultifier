import { NetworkAdapter } from './communicator';
import { PrivateKeyCredentials, VaultCredentials, VaultEncryptionSupport, VaultItem, VaultItemQuery, VaultItemsQuery, VaultMeta, VaultMinMeta, VaultPostItem, VaultRepo, VaultSchema, VaultValue } from './interfaces';
interface VaultSupport {
    repos: boolean;
    authentication: boolean;
}
export declare class Vaultifier {
    baseUrl: string;
    repo: string;
    credentials?: VaultCredentials | undefined;
    privateKeyCredentials?: PrivateKeyCredentials | undefined;
    private publicKey?;
    private privateKey?;
    private urls;
    private communicator;
    private supports?;
    /**
     *
     * @param baseUrl The base url of your data vault (e.g. https://data-vault.eu).
     * @param repo Repository, where to write to. This is defined in your plugin's manifest
     * @param credentials "Identifier" (appKey) that was generated after registering the plugin. "Secret" (appSecret) that was generated after registering the plugin.
     */
    constructor(baseUrl: string, repo: string, credentials?: VaultCredentials | undefined, privateKeyCredentials?: PrivateKeyCredentials | undefined);
    /**
     * Returns an object that can be checked for supported features of the provided endpoint
     */
    getVaultSupport(): Promise<VaultSupport>;
    /**
     * Sets the vault's credentials
     *
     * @param credentials Object containing credentials
     */
    setCredentials(credentials: VaultCredentials): void;
    /**
     * Returns true, if vault has (probably) valid credentials
     * This does not indicate, whether the vault will accept the credentials or not!
     */
    hasCredentials(): boolean;
    /**
     * Initializes Vaultifier (authorizes against data vault if necessary)
     *
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * This switches to the given repository name
     * As the data vault also provides the functionality to have public keys per repo
     * this function could be used to create a new instance of Vaultifier
     * But as this functionality is not yet active, it just changes the repo without doing anything further
     *
     * @param repoName Repository that should be used in the returned instance of Vaultifier
     */
    fromRepo(repoName: string): Promise<Vaultifier>;
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
     * Enables or disables end-to-end encryption
     *
     * @param isActive
     */
    setEnd2EndEncryption(isActive?: boolean): Promise<VaultEncryptionSupport>;
    getEncryptionSupport(): VaultEncryptionSupport;
    private get _usesEncryption();
    private encryptOrNot;
    private decryptOrNot;
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
     * @returns {Promise<VaultValue>} the value of the specified item
     */
    getValue(query: VaultItemQuery): Promise<VaultValue>;
    /**
     * Contains all necessary transformations and checks for posting/putting data to the data vault
     *
     * @param item Data to be posted/put to the data vault
     */
    private getPutPostValue;
    /**
     * Posts an item into the data vault's repository, including any metadata
     *
     * @param item data that is going to be passed to the data vault
     *
     * @returns {Promise<VaultMinMeta>}
     */
    postItem(item: VaultPostItem): Promise<VaultMinMeta>;
    /**
     * Puts an item into the data vault's repository (update), including any metadata
     *
     * @param item data that is going to be passed to the data vault for updating the record
     */
    updateItem(item: VaultPostItem): Promise<VaultMinMeta>;
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
     * @param {VaultItemsQuery} [query] Query parameters to specify the records that have to be queried
     *
     * @returns {Promise<VaultMinMeta[]>} array of JSON data
     */
    getValues(query?: VaultItemsQuery): Promise<VaultMinMeta[]>;
    /**
     * Deletes one item
     *
     * @param query Query parameter to specify the records that have to be deleted
     *
     * @returns {Promise<VaultMinMeta>}
     */
    deleteItem(query: VaultItemQuery): Promise<VaultMinMeta>;
    /**
     * Returns a list of vault items, but only with metadata (no content)
     *
     * @param query Query parameter to specify the records that have to be deleted
     */
    getMetaItems(query?: VaultItemsQuery): Promise<VaultMeta[]>;
    /**
     * Gets all repositories for the current plugin credentials
     *
     * @returns {Promise<VaultRepo[]}
     */
    getRepos(): Promise<VaultRepo[] | undefined>;
    /**
     * Queries all OCA schemas that are available within the user's vault
     *
     * @returns {Promise<VaultSchema[]}
     */
    getSchemas(): Promise<VaultSchema[]>;
    /**
     * At this time, vaultifier always needs appKey and appSecret. This might change in the future.
     *
     * @returns true, if Vaultifier has all minimum necessary data and was initalized correctly.
     */
    isValid(): Promise<boolean>;
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
