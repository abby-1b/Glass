
/**
 * Requests a module, which is loaded through a callback function.
 * @param moduleName The name of the module to be loaded (without file extensions)
 * @param found The function to be ran if the module is found
 * @param notFound The function to be ran if the module is not found
 */
declare function require(moduleName: string, found: (m: {[key: string]: any}) => any, notFound: (err: string) => any): string;
