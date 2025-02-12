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

function length(v) {
	return Math.sqrt(dot(v, v));
}

function dot(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
}

function cross(x, y) {
	return new vec(
		x.y * y.z - y.y * x.z,
		x.z * y.x - y.z * x.x,
		x.x * y.y - y.x * x.y,
		0,
	);
}

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
	Result.m[0].x = 1 / aspect * tanHalfFovy;
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
	constructor(width = 38, height = 9, fovy = Math.PI * 0.1, aspect = 0.011) {
		this.width = width;
		this.height = height;
		this.aspect = aspect;
		this.delta = 2 / Math.max(this.width, this.height);

		this.buffer = new Array(height)
			.fill(new Array(width).fill(' '))
			.map((row) =>
				row.map((column) =>
					new vec(column, 0, 1, ' ')));

		const angle = Math.PI * (Date.now() % 100000) / 50000;
		this.camera = new camera(6, new vec(2 * angle, angle), fovy, width * aspect / height);
	}

	render() {
		const vertices = cube.vertices.map(this.camera['*']);

		cube.elements.forEach(({ x, y, z, w }) => this.triangle(
			vertices[x], vertices[y], vertices[z], w));
	}

	triangle(a, b, c, w) {
		const u = b['-'](a);
		const v = c['-'](a);
		const d = length(u);
		const e = length(v);

		if (d > 0 && e > 0) {
			const f = Math.min(this.delta, this.delta / d);
			const g = Math.min(this.delta, this.delta / e);

			const m = u['*'](f);
			const n = v['*'](g);

			let q = new vec();
			for (let i = 0; i < 1; i += f) {
				let r = a['+'](q);
				for (let j = 0; i + j < 1; j += g) {
					const { x, y, z } = r;

					if (Math.abs(z) <= 1) {
						const row = parseInt(this.height * (1 - y) * 0.5);
						const column = parseInt(this.width * (x + 1) * 0.5);

						if (row >= 0 && row < this.height && column >= 0 && column < this.width && this.buffer[row][column].z >= z) {
							this.buffer[row][column].z = z;
							this.buffer[row][column].w = w;
						}
					}

					r = r['+'](n);
				}

				q = q['+'](m);
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

function main() {
	const view = new viewport();
	view.render();
	view.log();
}

setInterval(main, 40);
