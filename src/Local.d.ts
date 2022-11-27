
/**
 * Provides an interface with the local saving/loading server.
 */
declare class Local {
	public static getText(path: string): Promise<string>;
}
