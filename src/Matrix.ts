type FastMatrix = Float32Array

class FastMatrixHelper {
	static multiply3x3InPlace(mat: FastMatrix, mlt: [number, number, number, number, number, number, number, number, number]) {
		const a = mat[0], b = mat[1]
			, c = mat[2], d = mat[3]
			, e = mat[4], f = mat[5]
			, g = mat[6], h = mat[7]
			, i = mat[8], j = mlt[0]
			, k = mlt[1], l = mlt[2]
			, m = mlt[3], n = mlt[4]
			, o = mlt[5], p = mlt[6]
			, q = mlt[7], r = mlt[8]
		mat[0] = j * a + k * d + l * g
		mat[1] = j * b + k * e + l * h
		mat[2] = j * c + k * f + l * i
		mat[3] = m * a + n * d + o * g
		mat[4] = m * b + n * e + o * h
		mat[5] = m * c + n * f + o * i
		mat[6] = p * a + q * d + r * g
		mat[7] = p * b + q * e + r * h
		mat[8] = p * c + q * f + r * i
	}
}
