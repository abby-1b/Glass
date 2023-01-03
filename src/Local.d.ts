/**
 * Provides an interface with the local saving/loading implementation.
 */
declare class Local {
	/**
	 * Gets a text file from the local file system.
	 * @param path The file to fetch the text from
	 */
	public static getText(path: string): Promise<string>;
	/**
	 * Writes a text file to the local file system.
	 * @param path The file to write text into
	 * @param txt The text to write into the file
	 * @param reason A reason why the text file was written (optional)
	 */
	static writeText(path: string, txt: string, reason?: string): Promise<void>;
}
