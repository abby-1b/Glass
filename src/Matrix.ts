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
			, g = mat21[0], h = mat21[1]
		mat21[0] = g * a + h * b + c
		mat21[1] = g * d + h * e + f
	}

	static getInverse33(mat: FastMatrix) {
		const det = mat[0] * mat[4] * mat[8] + mat[1] * mat[5] * mat[6] + mat[2] * mat[3] * mat[7] - (mat[2] * mat[4] * mat[6] + mat[1] * mat[3] * mat[8] + mat[0] * mat[5] * mat[7])
		const a = (mat[4] * mat[8] - mat[5] * mat[7]) / det
			, b =-(mat[3] * mat[8] - mat[5] * mat[6]) / det
			, c = (mat[3] * mat[7] - mat[4] * mat[6]) / det
			, d =-(mat[1] * mat[8] - mat[2] * mat[7]) / det
			, e = (mat[0] * mat[8] - mat[2] * mat[6]) / det
			, f =-(mat[0] * mat[7] - mat[1] * mat[6]) / det
			, g = (mat[1] * mat[5] - mat[2] * mat[4]) / det
			, h =-(mat[0] * mat[5] - mat[3] * mat[2]) / det
			, i = (mat[0] * mat[4] - mat[1] * mat[3]) / det
		return new Float32Array([
			a, d, g,
			b, e, h,
			c, f, i,
		])
	}
}
