
class Utils {
	public static map(v: number, min: number, max: number, low: number, high: number): number {
		return (v - min) * (high - low) / (max - min) + low
	}

	public static dist(x1: number, y1: number, x2: number, y2: number): number {
		return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
	}
}
