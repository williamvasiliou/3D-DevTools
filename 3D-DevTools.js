class vec {
	constructor(x = 0, y = 0, z = 0, w = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	['+'] = (v) => new vec(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
	['-'] = (v) => new vec(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
	['*'] = (s) => new vec(this.x * s, this.y * s, this.z * s, this.w * s);
}

const length = (v) => Math.sqrt(dot(v, v));

const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;

const cross = (x, y) => new vec(
	x.y * y.z - y.y * x.z,
	x.z * y.x - y.z * x.x,
	x.x * y.y - y.x * x.y,
);

function normalize(v) {
	const s = length(v);

	if (s > 0) {
		return v['*'](1 / s);
	}
}

class mat {
	constructor(
		v0 = new vec(1, 0, 0, 0),
		v1 = new vec(0, 1, 0, 0),
		v2 = new vec(0, 0, 1, 0),
		v3 = new vec(0, 0, 0, 1),
	) {
		this.m = [v0, v1, v2, v3];
	}

	['*'] = ({ x, y, z, w }) => this.m[0]['*'](x)['+'](this.m[1]['*'](y))['+'](this.m[2]['*'](z))['+'](this.m[3]['*'](w));
}

const translate = ({ m }, { x, y, z }) => new mat(
	m[0],
	m[1],
	m[2],
	m[0]['*'](x)['+'](m[1]['*'](y))['+'](m[2]['*'](z))['+'](m[3]),
);

function roll({ m }, angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);

	return new mat(
		m[0]['*'](c)['+'](m[1]['*'](s)),
		m[0]['*'](-s)['+'](m[1]['*'](c)),
		m[2],
		m[3],
	);
}

function pitch({ m }, angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);

	return new mat(
		m[0],
		m[1]['*'](c)['+'](m[2]['*'](s)),
		m[1]['*'](-s)['+'](m[2]['*'](c)),
		m[3],
	);
}

function yaw({ m }, angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);

	return new mat(
		m[2]['*'](-s)['+'](m[0]['*'](c)),
		m[1],
		m[2]['*'](c)['+'](m[0]['*'](s)),
		m[3],
	);
}

const scale = ({ m }, { x, y, z }) => new mat(
	m[0]['*'](x),
	m[1]['*'](y),
	m[2]['*'](z),
	m[3],
);

function lookAtRH(eye, center, up) {
	const f = normalize(center['-'](eye));
	const s = normalize(cross(f, up));
	const u = cross(s, f);

	const Result = new mat();
	Result.m[0].x = s.x;
	Result.m[1].x = s.y;
	Result.m[2].x = s.z;
	Result.m[0].y = u.x;
	Result.m[1].y = u.y;
	Result.m[2].y = u.z;
	Result.m[0].z =-f.x;
	Result.m[1].z =-f.y;
	Result.m[2].z =-f.z;
	Result.m[3].x =-dot(s, eye);
	Result.m[3].y =-dot(u, eye);
	Result.m[3].z = dot(f, eye);
	return Result;
}

function perspectiveRH_NO(fovy, aspect, zNear, zFar) {
	const tanHalfFovy = Math.tan(fovy / 2);
	const Result = new mat();
	Result.m[0].x = 1 / (aspect * tanHalfFovy);
	Result.m[1].y = 1 / tanHalfFovy;
	Result.m[2].z = -(zFar + zNear) / (zFar - zNear);
	Result.m[2].w = -1;
	Result.m[3].z = -2 * zFar * zNear / (zFar - zNear);
	Result.m[3].w = 0;
	return Result;
}

const mul4x4 = (m1, { m }) => new mat(
	m1['*'](m[0]),
	m1['*'](m[1]),
	m1['*'](m[2]),
	m1['*'](m[3]),
);

class cube {
	static vertices = [
		new vec(-1, -1, 1, 1),
		new vec(1, -1, 1, 1),
		new vec(1, -1, -1, 1),
		new vec(-1, -1, -1, 1),
		new vec(-1, 1, 1, 1),
		new vec(1, 1, 1, 1),
		new vec(1, 1, -1, 1),
		new vec(-1, 1, -1, 1),
	];

	static elements = [
		new vec(0, 3, 2, 'a'),
		new vec(2, 1, 0, 'b'),
		new vec(0, 1, 5, 'c'),
		new vec(5, 4, 0, 'd'),
		new vec(1, 2, 6, 'e'),
		new vec(6, 5, 1, 'f'),
		new vec(2, 3, 7, 'G'),
		new vec(7, 6, 2, 'H'),
		new vec(3, 0, 4, 'I'),
		new vec(4, 7, 3, 'J'),
		new vec(4, 5, 6, 'K'),
		new vec(6, 7, 4, 'L'),
	];
}

class camera {
	constructor(Translate, Rotate, fovy, aspect) {
		this.Projection = perspectiveRH_NO(fovy, aspect, 0.1, 100.0);
		this.View = translate(new mat(), new vec(0, 0, -Translate));
		this.View = pitch(this.View, -Math.PI * Rotate.y);
		this.View = yaw(this.View, Math.PI * Rotate.x);
		this.Model = scale(new mat(), new vec(0.5, 0.5, 0.5));
		this.Model = mul4x4(mul4x4(this.Projection, this.View), this.Model);
	}

	['*'] = (v) => {
		const { x, y, z, w } = this.Model['*'](v);

		return new vec(x / w, y / w, z / w);
	}
}

class viewport {
	#width = 38;
	#height = 9;
	#fovy = Math.PI * 0.1;
	#aspect = 0.4;

	constructor(width = 38, height = 9, fovy = Math.PI * 0.1, aspect = 0.4) {
		this.width = width;
		this.height = height;

		this.fovy = fovy;
		this.aspect = aspect;
		this.clear();
	}

	get width() {
		return this.#width;
	}

	set width(width = 38) {
		this.#width = Math.max(1, parseInt(width) || 1);
	}

	get height() {
		return this.#height;
	}

	set height(height = 9) {
		this.#height = Math.max(1, parseInt(height) || 1);
	}

	get delta() {
		return 2 / Math.max(this.#width, this.#height);
	}

	get fovy() {
		return this.#fovy;
	}

	set fovy(fovy = Math.PI * 0.1) {
		if (fovy > 0 && fovy < Math.PI) {
			this.#fovy = Number(fovy);
		} else {
			this.#fovy = Math.PI * 0.1;
		}
	}

	get aspect() {
		return this.#aspect;
	}

	set aspect(aspect = 0.4) {
		if (isFinite(aspect) && aspect > 0) {
			this.#aspect = Number(aspect);
		} else {
			this.#aspect = 0.4;
		}
	}

	static camera = ({ width, height, fovy, aspect }) => {
		const angle = (Date.now() % 20000) / 10000;
		return new camera(6, new vec(2 * angle, angle), fovy, width * aspect / height);
	};

	clear(w = ' ') {
		this.buffer = new Array(this.height)
			.fill(new Array(this.width).fill(w))
			.map((row) =>
				row.map(() => new vec(0, 0, 1, w)));

		this.camera = viewport.camera(this);
	}

	render = ({ vertices, elements }) => {
		const v = vertices.map(this.camera['*']);

		elements.forEach(({ x, y, z, w }) =>
			this.triangle(v[x], v[y], v[z], w));
	}

	triangle(A, B, C, w) {
		const u = B['-'](A);
		const v = C['-'](A);
		const b = length(u);
		const c = length(v);

		if (b > 0 && c > 0) {
			const dy1 = Math.min(1, this.delta / b);
			const dy2 = Math.min(1, this.delta / c);

			const du = u['*'](dy1);
			const dv = v['*'](dy2);

			let U = A;
			for (let y1 = 0; y1 <= 1; y1 += dy1) {
				let V = U;
				for (let y2 = 0; y1 + y2 <= 1; y2 += dy2) {
					const { x, y, z } = V;

					if (Math.abs(z) <= 1) {
						const row = parseInt(this.height * (1 - y) * 0.5);
						const column = parseInt(this.width * (x + 1) * 0.5);

						if (row >= 0 && row < this.height && column >= 0 && column < this.width && this.buffer[row][column].z >= z) {
							this.buffer[row][column] = new vec(x, y, z, w);
						}
					}

					V = V['+'](dv);
				}

				U = U['+'](du);
			}
		}
	}

	log() {
		console.log(this.buffer.map(
			(row) => row.map(
				({ w }) => `${w}`
			).join('')
		).join('\n'));
	}
}

const view = new viewport();
const geometry = [cube];

const push = ({ vertices, elements }, model) => geometry.push({
	vertices: vertices.map(model['*']),
	elements,
});

const pop = () => geometry.pop();

function main() {
	view.clear();
	geometry.forEach(view.render);
	view.log();
}

setInterval(main, 40);
