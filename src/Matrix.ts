type FastMatrix = Float32Array

class FastMat {
	static mult33x33InPlace(
		mat: FastMatrix,
		mlt0: number, mlt1: number, mlt2: number,
		mlt3: number, mlt4: number, mlt5: number,
		mlt6: number, mlt7: number, mlt8: number
	) {
		const a = mat[0]
			, b = mat[1]
			, c = mat[2]
			, d = mat[3]
			, e = mat[4]
			, f = mat[5]
			, g = mat[6]
			, h = mat[7]
			, i = mat[8]
		mat[0] = a * mlt0 + b * mlt3 + c * mlt6
		mat[1] = a * mlt1 + b * mlt4 + c * mlt7
		mat[2] = a * mlt2 + b * mlt5 + c * mlt8
		mat[3] = d * mlt0 + e * mlt3 + f * mlt6
		mat[4] = d * mlt1 + e * mlt4 + f * mlt7
		mat[5] = d * mlt2 + e * mlt5 + f * mlt8
		mat[6] = g * mlt0 + h * mlt3 + i * mlt6
		mat[7] = g * mlt1 + h * mlt4 + i * mlt7
		mat[8] = g * mlt2 + h * mlt5 + i * mlt8
	}

	static mult21x33InPlace(mat21: [number, number], mat: FastMatrix) {
		const a = mat[0], b = mat[1]
			, c = mat[2], d = mat[3]
			, e = mat[4], f = mat[5]
			, g = mat21[0], h = mat21[0]
		mat21[0] = g * a + h * b + c
		mat21[1] = g * d + h * e + f
	}
}
