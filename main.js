const PACKED_SPLAT_LENGTH = (
    3*4 +   // XYZ - Position (Float32)
    3*4 +   // XYZ - Scale (Float32)
    4 +     // RGBA - colors (uint8)
    4 +     // IJKL - quaternion/rot (uint8)
    3*4 +   // XYZ - Normal (Float32)
    3 +     // RGB - PBR base colors (uint8)
    1 +     // ... padding out to 4-byte alignment
    2*4     // RM - PBR materials (Float32)
            // ... padding
);
const PACKED_RENDERABLE_SPLAT_LENGTH = (
    3*4 +   // XYZ - Position (Float32)
    4 +     // ... padding out to BYTES_PER_TEXEL
    6*2 +   // 6 parameters of covariance matrix (Float16)
    4 +     // RGBA - colors (uint8)
    3*4 +   // XYZ - Normal (Float32)
    3 +     // RGB - PBR base colors (uint8)
    1 +     // ... padding out to 4-byte alignment
    2*4     // RM - PBR materials (Float32)
            // ... padding
);
const BYTES_PER_TEXEL = 16; // RGBA32UI = 32 bits per channel * 4 channels = 4*4 bytes
const TEXELS_PER_PACKED_SPLAT = Math.ceil(PACKED_RENDERABLE_SPLAT_LENGTH / BYTES_PER_TEXEL);
const PADDED_RENDERABLE_SPLAT_LENGTH = TEXELS_PER_PACKED_SPLAT * BYTES_PER_TEXEL;
const PADDED_SPLAT_LENGTH = 4 * Math.ceil(PACKED_SPLAT_LENGTH / 4);

const PLY_MAGIC_HEADER = new Uint8Array([112, 108, 121, 10]); // "ply\n"
const LSPLAT_MAGIC_HEADER = new Uint8Array([108, 115, 112, 108, 97, 116, 10]); // "lsplat\n"

let cameras = [
    {
        id: 0,
        img_name: "00001",
        width: 1959,
        height: 1090,
        position: [
            -3.0089893469241797, -0.11086489695181866, -3.7527640949141428,
        ],
        rotation: [
            [0.876134201218856, 0.06925962026449776, 0.47706599800804744],
            [-0.04747421839895102, 0.9972110940209488, -0.057586739349882114],
            [-0.4797239414934443, 0.027805376500959853, 0.8769787916452908],
        ],
        fy: 1164.6601287484507,
        fx: 1159.5880733038064,
    },
    {
        id: 1,
        img_name: "00009",
        width: 1959,
        height: 1090,
        position: [
            -2.5199776022057296, -0.09704735754873686, -3.6247725540304545,
        ],
        rotation: [
            [0.9982731285632193, -0.011928707708098955, -0.05751927260507243],
            [0.0065061360949636325, 0.9955928229282383, -0.09355533724430458],
            [0.058381769258182864, 0.09301955098900708, 0.9939511719154457],
        ],
        fy: 1164.6601287484507,
        fx: 1159.5880733038064,
    },
    {
        id: 2,
        img_name: "00017",
        width: 1959,
        height: 1090,
        position: [
            -0.7737533667465242, -0.3364271945329695, -2.9358969417573753,
        ],
        rotation: [
            [0.9998813418672372, 0.013742375651625236, -0.0069605529394208224],
            [-0.014268370388586709, 0.996512943252834, -0.08220929105659476],
            [0.00580653013657589, 0.08229885200307129, 0.9965907801935302],
        ],
        fy: 1164.6601287484507,
        fx: 1159.5880733038064,
    },
    {
        id: 3,
        img_name: "00025",
        width: 1959,
        height: 1090,
        position: [
            1.2198221749590001, -0.2196687861401182, -2.3183162007028453,
        ],
        rotation: [
            [0.9208648867765482, 0.0012010625395201253, 0.389880004297208],
            [-0.06298204172269357, 0.987319521752825, 0.14571693239364383],
            [-0.3847611242348369, -0.1587410451475895, 0.9092635249821667],
        ],
        fy: 1164.6601287484507,
        fx: 1159.5880733038064,
    },
    {
        id: 4,
        img_name: "00033",
        width: 1959,
        height: 1090,
        position: [
            1.742387858893817, -0.13848225198886954, -2.0566370113193146,
        ],
        rotation: [
            [0.24669889292141334, -0.08370189346592856, -0.9654706879349405],
            [0.11343747891376445, 0.9919082664242816, -0.05700815184573074],
            [0.9624300466054861, -0.09545671285663988, 0.2541976029815521],
        ],
        fy: 1164.6601287484507,
        fx: 1159.5880733038064,
    },
    {
        id: 5,
        img_name: "00041",
        width: 1959,
        height: 1090,
        position: [
            3.6567309419223935, -0.16470990600750707, -1.3458085590422042,
        ],
        rotation: [
            [0.2341293058324528, -0.02968330457755884, -0.9717522161434825],
            [0.10270823606832301, 0.99469554638321, -0.005638106875665722],
            [0.9667649592295676, -0.09848690996657204, 0.2359360976431732],
        ],
        fy: 1164.6601287484507,
        fx: 1159.5880733038064,
    },
    {
        id: 6,
        img_name: "00049",
        width: 1959,
        height: 1090,
        position: [
            3.9013554243203497, -0.2597500978038105, -0.8106154188297828,
        ],
        rotation: [
            [0.6717235545638952, -0.015718162115524837, -0.7406351366386528],
            [0.055627354673906296, 0.9980224478387622, 0.029270992841185218],
            [0.7387104058127439, -0.060861588786650656, 0.6712695459756353],
        ],
        fy: 1164.6601287484507,
        fx: 1159.5880733038064,
    },
    {
        id: 7,
        img_name: "00057",
        width: 1959,
        height: 1090,
        position: [4.742994605467533, -0.05591660945412069, 0.9500365976084458],
        rotation: [
            [-0.17042655709210375, 0.01207080756938, -0.9852964448542146],
            [0.1165090336695526, 0.9931575292530063, -0.00798543433078162],
            [0.9784581921120181, -0.1161568667478904, -0.1706667764862097],
        ],
        fy: 1164.6601287484507,
        fx: 1159.5880733038064,
    },
    {
        id: 8,
        img_name: "00065",
        width: 1959,
        height: 1090,
        position: [4.34676307626522, 0.08168160516967145, 1.0876221470355405],
        rotation: [
            [-0.003575447631888379, -0.044792503246552894, -0.9989899137764799],
            [0.10770152645126597, 0.9931680875192705, -0.04491693593046672],
            [0.9941768441149182, -0.10775333677534978, 0.0012732004866391048],
        ],
        fy: 1164.6601287484507,
        fx: 1159.5880733038064,
    },
    {
        id: 9,
        img_name: "00073",
        width: 1959,
        height: 1090,
        position: [3.264984351114202, 0.078974937336732, 1.0117200284114904],
        rotation: [
            [-0.026919994628162257, -0.1565891128261527, -0.9872968974090509],
            [0.08444552208239385, 0.983768234577625, -0.1583319754069128],
            [0.9960643893290491, -0.0876350978794554, -0.013259786205163005],
        ],
        fy: 1164.6601287484507,
        fx: 1159.5880733038064,
    },
];

let camera = cameras[0];

function getProjectionMatrix(fx, fy, width, height) {
    // Returns a matrix in column-major order.
    // TODO: Why does this look so different from the OpenGL projection matrix?
    const znear = 0.2;
    const zfar = 200;
    return [
        [(2 * fx) / width, 0, 0, 0],
        [0, -(2 * fy) / height, 0, 0],
        [0, 0, zfar / (zfar - znear), 1],
        [0, 0, -(zfar * znear) / (zfar - znear), 0],
    ].flat();
}

function getViewMatrix(camera) {
    // Returns a 4x4 matrix in column-major order.
    const R = camera.rotation.flat();
    const t = camera.position;
    const camToWorld = [
        [R[0], R[1], R[2], 0],
        [R[3], R[4], R[5], 0],
        [R[6], R[7], R[8], 0],
        [
            -t[0] * R[0] - t[1] * R[3] - t[2] * R[6],
            -t[0] * R[1] - t[1] * R[4] - t[2] * R[7],
            -t[0] * R[2] - t[1] * R[5] - t[2] * R[8],
            1,
        ],
    ].flat();
    return camToWorld;
}
function add3(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function sub3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function normalize3(v) {
    const len = Math.max(Math.hypot(v[0], v[1], v[2]), 1e-7);
    return [v[0] / len, v[1] / len, v[2] / len];
}
function cross3(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}
function lookAt(eye, center, up) {
    // Returns a 4x4 matrix in column-major order.
    const forward = normalize3(sub3(center, eye));
    const side = normalize3(cross3(forward, up));
    up = normalize3(cross3(side, forward));
    return multiply4(
        [
            side[0], up[0], -forward[0], 0,
            side[1], up[1], -forward[1], 0,
            side[2], up[2], -forward[2], 0,
            0, 0, 0, 1,
        ],
        translate4(identity4(), -eye[0], -eye[1], -eye[2])
    );
}

function multiply4(a, b) {
    return [
        b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12],
        b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13],
        b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14],
        b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15],
        b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12],
        b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13],
        b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14],
        b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15],
        b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12],
        b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13],
        b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14],
        b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15],
        b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12],
        b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13],
        b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14],
        b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15],
    ];
}

function transform4(T, v) {
    return [
        T[0] * v[0] + T[4] * v[1] + T[8] * v[2] + T[12] * v[3],
        T[1] * v[0] + T[5] * v[1] + T[9] * v[2] + T[13] * v[3],
        T[2] * v[0] + T[6] * v[1] + T[10] * v[2] + T[14] * v[3],
        T[3] * v[0] + T[7] * v[1] + T[11] * v[2] + T[15] * v[3],
    ];
}

function identity4() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

function mat3From4(a) {
    return [
        a[0], a[1], a[2],
        a[4], a[5], a[6],
        a[8], a[9], a[10],
    ];
}

function invert4(a) {
    let b00 = a[0] * a[5] - a[1] * a[4];
    let b01 = a[0] * a[6] - a[2] * a[4];
    let b02 = a[0] * a[7] - a[3] * a[4];
    let b03 = a[1] * a[6] - a[2] * a[5];
    let b04 = a[1] * a[7] - a[3] * a[5];
    let b05 = a[2] * a[7] - a[3] * a[6];
    let b06 = a[8] * a[13] - a[9] * a[12];
    let b07 = a[8] * a[14] - a[10] * a[12];
    let b08 = a[8] * a[15] - a[11] * a[12];
    let b09 = a[9] * a[14] - a[10] * a[13];
    let b10 = a[9] * a[15] - a[11] * a[13];
    let b11 = a[10] * a[15] - a[11] * a[14];
    let det =
        b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return null;
    return [
        (a[5] * b11 - a[6] * b10 + a[7] * b09) / det,
        (a[2] * b10 - a[1] * b11 - a[3] * b09) / det,
        (a[13] * b05 - a[14] * b04 + a[15] * b03) / det,
        (a[10] * b04 - a[9] * b05 - a[11] * b03) / det,
        (a[6] * b08 - a[4] * b11 - a[7] * b07) / det,
        (a[0] * b11 - a[2] * b08 + a[3] * b07) / det,
        (a[14] * b02 - a[12] * b05 - a[15] * b01) / det,
        (a[8] * b05 - a[10] * b02 + a[11] * b01) / det,
        (a[4] * b10 - a[5] * b08 + a[7] * b06) / det,
        (a[1] * b08 - a[0] * b10 - a[3] * b06) / det,
        (a[12] * b04 - a[13] * b02 + a[15] * b00) / det,
        (a[9] * b02 - a[8] * b04 - a[11] * b00) / det,
        (a[5] * b07 - a[4] * b09 - a[6] * b06) / det,
        (a[0] * b09 - a[1] * b07 + a[2] * b06) / det,
        (a[13] * b01 - a[12] * b03 - a[14] * b00) / det,
        (a[8] * b03 - a[9] * b01 + a[10] * b00) / det,
    ];
}

function rotate4(a, rad, x, y, z) {
    let len = Math.hypot(x, y, z);
    x /= len;
    y /= len;
    z /= len;
    let s = Math.sin(rad);
    let c = Math.cos(rad);
    let t = 1 - c;
    let b00 = x * x * t + c;
    let b01 = y * x * t + z * s;
    let b02 = z * x * t - y * s;
    let b10 = x * y * t - z * s;
    let b11 = y * y * t + c;
    let b12 = z * y * t + x * s;
    let b20 = x * z * t + y * s;
    let b21 = y * z * t - x * s;
    let b22 = z * z * t + c;
    return [
        a[0] * b00 + a[4] * b01 + a[8] * b02,
        a[1] * b00 + a[5] * b01 + a[9] * b02,
        a[2] * b00 + a[6] * b01 + a[10] * b02,
        a[3] * b00 + a[7] * b01 + a[11] * b02,
        a[0] * b10 + a[4] * b11 + a[8] * b12,
        a[1] * b10 + a[5] * b11 + a[9] * b12,
        a[2] * b10 + a[6] * b11 + a[10] * b12,
        a[3] * b10 + a[7] * b11 + a[11] * b12,
        a[0] * b20 + a[4] * b21 + a[8] * b22,
        a[1] * b20 + a[5] * b21 + a[9] * b22,
        a[2] * b20 + a[6] * b21 + a[10] * b22,
        a[3] * b20 + a[7] * b21 + a[11] * b22,
        ...a.slice(12, 16),
    ];
}

function translate4(a, x, y, z) {
    return [
        ...a.slice(0, 12),
        a[0] * x + a[4] * y + a[8] * z + a[12],
        a[1] * x + a[5] * y + a[9] * z + a[13],
        a[2] * x + a[6] * y + a[10] * z + a[14],
        a[3] * x + a[7] * y + a[11] * z + a[15],
    ];
}

function createWorker(self) {
    // These constants all need to be redefined because of how the worker is created
    const PACKED_SPLAT_LENGTH = (
        3*4 +   // XYZ - Position (Float32)
        3*4 +   // XYZ - Scale (Float32)
        4 +     // RGBA - colors (uint8)
        4 +     // IJKL - quaternion/rot (uint8)
        3*4 +   // XYZ - Normal (Float32)
        3 +     // RGB - PBR base colors (uint8)
        1 +     // ... padding out to 4-byte alignment
        2*4     // RM - PBR materials (Float32)
                // ... padding
    );
    const PACKED_RENDERABLE_SPLAT_LENGTH = (
        3*4 +   // XYZ - Position (Float32)
        4 +     // ... padding out to BYTES_PER_TEXEL
        6*2 +   // 6 parameters of covariance matrix (Float16)
        4 +     // RGBA - colors (uint8)
        3*4 +   // XYZ - Normal (Float32)
        3 +     // RGB - PBR base colors (uint8)
        1 +     // ... padding out to 4-byte alignment
        2*4     // RM - PBR materials (Float32)
                // ... padding
    );
    const BYTES_PER_TEXEL = 16; // RGBA32UI = 32 bits per channel * 4 channels = 4*4 bytes
    const TEXELS_PER_PACKED_SPLAT = Math.ceil(PACKED_RENDERABLE_SPLAT_LENGTH / BYTES_PER_TEXEL);
    const PADDED_RENDERABLE_SPLAT_LENGTH = TEXELS_PER_PACKED_SPLAT * BYTES_PER_TEXEL;
    const PADDED_SPLAT_LENGTH = 4 * Math.ceil(PACKED_SPLAT_LENGTH / 4);
    const FLOAT32_PER_PADDED_RENDERABLE_SPLAT = PADDED_RENDERABLE_SPLAT_LENGTH / 4;
    const UINT32_PER_PADDED_RENDERABLE_SPLAT = FLOAT32_PER_PADDED_RENDERABLE_SPLAT;
    const FLOAT32_PER_PADDED_SPLAT = PADDED_SPLAT_LENGTH / 4;

    let buffer;
    let gaussianCount = 0;
    let lastProj = [];
    let depthIndex = new Uint32Array();
    let lastGaussianCount = 0;

    var _floatView = new Float32Array(1);
    var _int32View = new Int32Array(_floatView.buffer);

    function floatToHalf(float) {
        _floatView[0] = float;
        var f = _int32View[0];

        var sign = (f >> 31) & 0x0001;
        var exp = (f >> 23) & 0x00ff;
        var frac = f & 0x007fffff;

        var newExp;
        if (exp == 0) {
            newExp = 0;
        } else if (exp < 113) {
            newExp = 0;
            frac |= 0x00800000;
            frac = frac >> (113 - exp);
            if (frac & 0x01000000) {
                newExp = 1;
                frac = 0;
            }
        } else if (exp < 142) {
            newExp = exp - 112;
        } else {
            newExp = 31;
            frac = 0;
        }

        return (sign << 15) | (newExp << 10) | (frac >> 13);
    }

    function packHalf2x16(x, y) {
        return (floatToHalf(x) | (floatToHalf(y) << 16)) >>> 0;
    }

    function generateTexture() {
        if (!buffer) return;
        const f_buffer = new Float32Array(buffer);
        const u_buffer = new Uint8Array(buffer);

        var texwidth = 1024 * TEXELS_PER_PACKED_SPLAT; // Set to your desired width
        var texheight = Math.ceil((TEXELS_PER_PACKED_SPLAT * gaussianCount) / texwidth); // Set to your desired height
        var texdata = new Uint32Array(texwidth * texheight * 4); // 4 Uint32 components per pixel in RGBAUI
        var texdata_c = new Uint8Array(texdata.buffer);
        var texdata_f = new Float32Array(texdata.buffer);
        var hasNormals = false;

        // Here we convert from a .splat file buffer into a texture
        // With a little bit more foresight perhaps this texture file
        // should have been the native format as it'd be very easy to
        // load it into webgl.
        for (let i = 0; i < gaussianCount; i++) {
            // position x, y, z
            texdata_f[FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 0] = f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 0];
            texdata_f[FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 1] = f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 1];
            texdata_f[FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 2] = f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 2];

            // r, g, b, a
            texdata_c[4 * (FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 7) + 0] = u_buffer[PADDED_SPLAT_LENGTH * i + 24 + 0];
            texdata_c[4 * (FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 7) + 1] = u_buffer[PADDED_SPLAT_LENGTH * i + 24 + 1];
            texdata_c[4 * (FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 7) + 2] = u_buffer[PADDED_SPLAT_LENGTH * i + 24 + 2];
            texdata_c[4 * (FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 7) + 3] = u_buffer[PADDED_SPLAT_LENGTH * i + 24 + 3];

            // quaternions
            let scale = [
                f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 3 + 0],
                f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 3 + 1],
                f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 3 + 2],
            ];
            let rot = [
                (u_buffer[PADDED_SPLAT_LENGTH * i + 28 + 0] - 128) / 128,
                (u_buffer[PADDED_SPLAT_LENGTH * i + 28 + 1] - 128) / 128,
                (u_buffer[PADDED_SPLAT_LENGTH * i + 28 + 2] - 128) / 128,
                (u_buffer[PADDED_SPLAT_LENGTH * i + 28 + 3] - 128) / 128,
            ];

            // Compute the matrix product of S and R (M = S * R)
            const M = [
                1.0 - 2.0 * (rot[2] * rot[2] + rot[3] * rot[3]),
                2.0 * (rot[1] * rot[2] + rot[0] * rot[3]),
                2.0 * (rot[1] * rot[3] - rot[0] * rot[2]),

                2.0 * (rot[1] * rot[2] - rot[0] * rot[3]),
                1.0 - 2.0 * (rot[1] * rot[1] + rot[3] * rot[3]),
                2.0 * (rot[2] * rot[3] + rot[0] * rot[1]),

                2.0 * (rot[1] * rot[3] + rot[0] * rot[2]),
                2.0 * (rot[2] * rot[3] - rot[0] * rot[1]),
                1.0 - 2.0 * (rot[1] * rot[1] + rot[2] * rot[2]),
            ].map((k, i) => k * scale[Math.floor(i / 3)]);

            const sigma = [
                M[0] * M[0] + M[3] * M[3] + M[6] * M[6],
                M[0] * M[1] + M[3] * M[4] + M[6] * M[7],
                M[0] * M[2] + M[3] * M[5] + M[6] * M[8],
                M[1] * M[1] + M[4] * M[4] + M[7] * M[7],
                M[1] * M[2] + M[4] * M[5] + M[7] * M[8],
                M[2] * M[2] + M[5] * M[5] + M[8] * M[8],
            ];

            texdata[UINT32_PER_PADDED_RENDERABLE_SPLAT * i + 4] = packHalf2x16(4 * sigma[0], 4 * sigma[1]);
            texdata[UINT32_PER_PADDED_RENDERABLE_SPLAT * i + 5] = packHalf2x16(4 * sigma[2], 4 * sigma[3]);
            texdata[UINT32_PER_PADDED_RENDERABLE_SPLAT * i + 6] = packHalf2x16(4 * sigma[4], 4 * sigma[5]);

            // normal x, y, z
            var n_x = f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 8 + 0];
            var n_y = f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 8 + 1];
            var n_z = f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 8 + 2];
            texdata_f[FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 8 + 0] = n_x;
            texdata_f[FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 8 + 1] = n_y;
            texdata_f[FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 8 + 2] = n_z;
            if (n_x != 0 || n_y != 0 || n_z != 0) {
                hasNormals = true;
            }

            // PBR base colors r, g, b
            texdata_c[4 * (FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 11) + 0] = u_buffer[PADDED_SPLAT_LENGTH * i + 4*11 + 0];
            texdata_c[4 * (FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 11) + 1] = u_buffer[PADDED_SPLAT_LENGTH * i + 4*11 + 1];
            texdata_c[4 * (FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 11) + 2] = u_buffer[PADDED_SPLAT_LENGTH * i + 4*11 + 2];

            // PBR roughness, metallic
            texdata_f[FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 12 + 0] = f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 12 + 0];
            texdata_f[FLOAT32_PER_PADDED_RENDERABLE_SPLAT * i + 12 + 1] = f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 12 + 1];
        }

        self.postMessage({ texdata, texwidth, texheight, hasNormals }, [texdata.buffer]);
    }

    function runSort(viewProj, label) {
        if (!buffer) return;
        const f_buffer = new Float32Array(buffer);
        if (lastGaussianCount == gaussianCount) {
            let dot =
                lastProj[2] * viewProj[2] +
                lastProj[6] * viewProj[6] +
                lastProj[10] * viewProj[10];
            if (Math.abs(dot - 1) < 0.01) {
                return;
            }
        } else {
            generateTexture();
            lastGaussianCount = gaussianCount;
        }

        // console.time("sort");
        let maxDepth = -Infinity;
        let minDepth = Infinity;
        let sizeList = new Int32Array(gaussianCount);
        for (let i = 0; i < gaussianCount; i++) {
            let depth =
                ((viewProj[2] * f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 0] +
                    viewProj[6] * f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 1] +
                    viewProj[10] * f_buffer[FLOAT32_PER_PADDED_SPLAT * i + 2]) *
                    4096) |
                0;
            sizeList[i] = depth;
            if (depth > maxDepth) maxDepth = depth;
            if (depth < minDepth) minDepth = depth;
        }

        // This is a 16 bit single-pass counting sort
        let depthInv = (256 * 256) / (maxDepth - minDepth);
        let counts0 = new Uint32Array(256 * 256);
        for (let i = 0; i < gaussianCount; i++) {
            sizeList[i] = ((sizeList[i] - minDepth) * depthInv) | 0;
            counts0[sizeList[i]]++;
        }
        let starts0 = new Uint32Array(256 * 256);
        for (let i = 1; i < 256 * 256; i++)
            starts0[i] = starts0[i - 1] + counts0[i - 1];
        depthIndex = new Uint32Array(gaussianCount);
        for (let i = 0; i < gaussianCount; i++)
            depthIndex[starts0[sizeList[i]]++] = i;

        // console.timeEnd("sort");

        lastProj = viewProj;
        self.postMessage({ depthIndex, viewProj, gaussianCount, label }, [
            depthIndex.buffer,
        ]);
    }

    function processPlyBuffer(inputBuffer) {
        const ubuf = new Uint8Array(inputBuffer);
        // 10KB ought to be enough for a header...
        const header = new TextDecoder().decode(ubuf.slice(0, 1024 * 10));
        const header_end = "end_header\n";
        const header_end_index = header.indexOf(header_end);
        if (header_end_index < 0)
            throw new Error("Unable to read .ply file header");
        const gaussianCount = parseInt(/element vertex (\d+)\n/.exec(header)[1]);
        console.log("Gaussian Count", gaussianCount);
        let row_offset = 0,
            offsets = {},
            types = {};
        const TYPE_MAP = {
            double: "getFloat64",
            int: "getInt32",
            uint: "getUint32",
            float: "getFloat32",
            short: "getInt16",
            ushort: "getUint16",
            uchar: "getUint8",
        };
        for (let prop of header
            .slice(0, header_end_index)
            .split("\n")
            .filter((k) => k.startsWith("property "))) {
            const [p, type, name] = prop.split(" ");
            const arrayType = TYPE_MAP[type] || "getInt8";
            types[name] = arrayType;
            offsets[name] = row_offset;
            row_offset += parseInt(arrayType.replace(/[^\d]/g, "")) / 8;
        }

        let dataView = new DataView(
            inputBuffer,
            header_end_index + header_end.length,
        );
        let row = 0;
        const attrs = new Proxy(
            {},
            {
                get(target, prop) {
                    if (!types[prop]) throw new Error(prop + " not found");
                    return dataView[types[prop]](
                        row * row_offset + offsets[prop],
                        true,
                    );
                },
            },
        );

        console.time("calculate importance");
        let sizeList = new Float32Array(gaussianCount);
        let sizeIndex = new Uint32Array(gaussianCount);
        for (row = 0; row < gaussianCount; row++) {
            sizeIndex[row] = row;
            if (!types["scale_0"]) continue;
            const size =
                Math.exp(attrs.scale_0) *
                Math.exp(attrs.scale_1) *
                Math.exp(attrs.scale_2);
            const opacity = 1 / (1 + Math.exp(-attrs.opacity));
            sizeList[row] = size * opacity;
        }
        console.timeEnd("calculate importance");

        console.time("sort");
        sizeIndex.sort((b, a) => sizeList[a] - sizeList[b]);
        console.timeEnd("sort");

        const buffer = new ArrayBuffer(PADDED_SPLAT_LENGTH * gaussianCount);

        console.time("build buffer");
        for (let j = 0; j < gaussianCount; j++) {
            row = sizeIndex[j];

            const position = new Float32Array(buffer, j * PADDED_SPLAT_LENGTH, 3);
            const scales = new Float32Array(buffer, j * PADDED_SPLAT_LENGTH + 4 * 3, 3);
            const rgba = new Uint8ClampedArray(
                buffer,
                j*PADDED_SPLAT_LENGTH + 3*4 + 3*4,
                4,
            );
            const rot = new Uint8ClampedArray(
                buffer,
                j*PADDED_SPLAT_LENGTH + 3*4 + 3*4 + 4,
                4,
            );
            const normal = new Float32Array(
                buffer,
                j*PADDED_SPLAT_LENGTH + 3*4 + 3*4 + 4 + 4,
                3,
            );
            const pbrRGB = new Uint8ClampedArray(
                buffer,
                j*PADDED_SPLAT_LENGTH + 3*4 + 3*4 + 4 + 4 + 3*4,
                3,
            );
            const pbrRM = new Float32Array(
                buffer,
                j*PADDED_SPLAT_LENGTH + 3*4 + 3*4 + 4 + 4 + 3*4 + 3 + 1,
                2,
            );

            if (types["scale_0"]) {
                const qlen = Math.sqrt(
                    attrs.rot_0 ** 2 +
                        attrs.rot_1 ** 2 +
                        attrs.rot_2 ** 2 +
                        attrs.rot_3 ** 2,
                );

                rot[0] = (attrs.rot_0 / qlen) * 128 + 128;
                rot[1] = (attrs.rot_1 / qlen) * 128 + 128;
                rot[2] = (attrs.rot_2 / qlen) * 128 + 128;
                rot[3] = (attrs.rot_3 / qlen) * 128 + 128;

                scales[0] = Math.exp(attrs.scale_0);
                scales[1] = Math.exp(attrs.scale_1);
                scales[2] = Math.exp(attrs.scale_2);
            } else {
                scales[0] = 0.01;
                scales[1] = 0.01;
                scales[2] = 0.01;

                rot[0] = 255;
                rot[1] = 0;
                rot[2] = 0;
                rot[3] = 0;
            }

            position[0] = attrs.x;
            position[1] = attrs.y;
            position[2] = attrs.z;

            if (types["f_dc_0"]) {
                const SH_C0 = 0.28209479177387814;
                rgba[0] = (0.5 + SH_C0 * attrs.f_dc_0) * 255;
                rgba[1] = (0.5 + SH_C0 * attrs.f_dc_1) * 255;
                rgba[2] = (0.5 + SH_C0 * attrs.f_dc_2) * 255;
            } else {
                rgba[0] = attrs.red;
                rgba[1] = attrs.green;
                rgba[2] = attrs.blue;
            }
            if (types["opacity"]) {
                rgba[3] = (1 / (1 + Math.exp(-attrs.opacity))) * 255;
            } else {
                rgba[3] = 255;
            }
            if (types["nx"] && types["ny"] && types["nz"]) {
                normal[0] = attrs.nx;
                normal[1] = attrs.ny;
                normal[2] = attrs.nz;
            }
            if (types["base_color_0"] && types["base_color_1"] && types["base_color_2"]) {
                pbrRGB[0] = attrs.base_color_0 * 255;
                pbrRGB[1] = attrs.base_color_1 * 255;
                pbrRGB[2] = attrs.base_color_2 * 255;
            }
            if (types["roughness"] && types["metallic"]) {
                pbrRM[0] = attrs.roughness;
                pbrRM[1] = attrs.metallic;
            }
        }
        console.timeEnd("build buffer");
        return buffer;
    }

    const labelsToSorters = {};
    const getOrCreateThrottledSorter = (label) => {
        if (!labelsToSorters[label]) {
            var currViewProj = null;
            var sortRunning = false;
            const self = {
                resortCurrent: () => {
                    // Call this when something invalidates the current positions or gaussian count,
                    // e.g. progressively loading another chunk of gaussians
                    if (currViewProj) {
                        self.throttledSort(currViewProj);
                    }
                },
                throttledSort: (viewProj) => {
                    currViewProj = viewProj;
                    if (!sortRunning) {
                        sortRunning = true;
                        let lastView = viewProj;
                        runSort(lastView, label);
                        setTimeout(() => {
                            sortRunning = false;
                            if (lastView !== currViewProj) {
                                self.throttledSort(currViewProj);
                            }
                        }, 0);
                    }
                },
            };
            labelsToSorters[label] = self;
        }
        return labelsToSorters[label];
    };

    self.onmessage = (e) => {
        if (e.data.ply) {
            gaussianCount = 0;
            buffer = processPlyBuffer(e.data.ply);
            gaussianCount = Math.floor(buffer.byteLength / PADDED_SPLAT_LENGTH);
            postMessage({ buffer: buffer });
        } else if (e.data.buffer) {
            buffer = e.data.buffer;
            gaussianCount = e.data.gaussianCount;
            Object.keys(labelsToSorters).forEach((k) => {
                labelsToSorters[k].resortCurrent();
            });
        } else if (e.data.gaussianCount) {
            gaussianCount = e.data.gaussianCount;
        } else if (e.data.view) {
            if (!e.data.label) {
                console.error("Expected label for sort");
            } else {
                getOrCreateThrottledSorter(e.data.label).throttledSort(e.data.view);
            }
        }
    };
}

const gaussianVertexSource = `
#version 300 es
precision highp float;
precision highp int;

uniform highp usampler2D u_texture;
uniform mat4 projection, view;
uniform vec2 focal;
uniform vec2 viewport;
uniform int mode;

in vec2 position;
in int index;

out vec4 vColor;
out vec3 vPBRColor;
out vec2 vPosition;
out vec3 vNormal;
out float vRoughness;
out float vMetallic;

void main () {
    uvec4 bytes_00_15 = texelFetch(u_texture, ivec2((uint(index) & 0x3ffu) * uint(${TEXELS_PER_PACKED_SPLAT}), uint(index) >> 10), 0);
    vec4 cam = view * vec4(uintBitsToFloat(bytes_00_15.xyz), 1);
    vec4 pos2d = projection * cam;

    float clip = 1.2 * pos2d.w;
    if (pos2d.z < -clip || pos2d.x < -clip || pos2d.x > clip || pos2d.y < -clip || pos2d.y > clip) {
        gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
        return;
    }

    uvec4 bytes_16_31 = texelFetch(u_texture, ivec2(((uint(index) & 0x3ffu) * uint(${TEXELS_PER_PACKED_SPLAT})) | 1u, uint(index) >> 10), 0);
    vec2    u1 = unpackHalf2x16(bytes_16_31.x),
            u2 = unpackHalf2x16(bytes_16_31.y),
            u3 = unpackHalf2x16(bytes_16_31.z);
    mat3 Vrk = mat3(u1.x, u1.y, u2.x,
                    u1.y, u2.y, u3.x,
                    u2.x, u3.x, u3.y);

    mat3 J = mat3(
        focal.x / cam.z, 0., -(focal.x * cam.x) / (cam.z * cam.z),
        0., -focal.y / cam.z, (focal.y * cam.y) / (cam.z * cam.z),
        0., 0., 0.
    );

    mat3 T = transpose(mat3(view)) * J;
    mat3 cov2d = transpose(T) * Vrk * T;

    float mid = (cov2d[0][0] + cov2d[1][1]) / 2.0;
    float radius = length(
        vec2(
            (cov2d[0][0] - cov2d[1][1]) / 2.0,
            cov2d[0][1]
        )
    );
    float lambda1 = mid + radius, lambda2 = mid - radius;

    if(lambda2 < 0.0) return;
    vec2 diagonalVector = normalize(vec2(cov2d[0][1], lambda1 - cov2d[0][0]));
    vec2 majorAxis = min(sqrt(2.0 * lambda1), 1024.0) * diagonalVector;
    vec2 minorAxis = min(sqrt(2.0 * lambda2), 1024.0) * vec2(diagonalVector.y, -diagonalVector.x);

    uvec4 bytes_32_47 = texelFetch(u_texture, ivec2(((uint(index) & 0x3ffu) * uint(${TEXELS_PER_PACKED_SPLAT})) | 2u, uint(index) >> 10), 0);
    uvec4 bytes_48_63 = texelFetch(u_texture, ivec2(((uint(index) & 0x3ffu) * uint(${TEXELS_PER_PACKED_SPLAT})) | 3u, uint(index) >> 10), 0);
    // TODO handle splat data without normals
    vNormal = normalize(vec3(uintBitsToFloat(bytes_32_47.xyz)));
    uint opacity255 = (bytes_16_31.w >> 24) & 0xffu;

    if (mode == 0) {
        // Color mode
        vColor =
            clamp(pos2d.z/pos2d.w+1.0, 0.0, 1.0) *
            vec4(
                (bytes_16_31.w) & 0xffu,
                (bytes_16_31.w >> 8) & 0xffu,
                (bytes_16_31.w >> 16) & 0xffu,
                opacity255
            ) / 255.0;
        vPBRColor =
            clamp(pos2d.z/pos2d.w+1.0, 0.0, 1.0) *
            vec3(
                (bytes_32_47.w) & 0xffu,
                (bytes_32_47.w >> 8) & 0xffu,
                (bytes_32_47.w >> 16) & 0xffu
            ) / 255.0;
        vRoughness = uintBitsToFloat(bytes_48_63.x);
        vMetallic = uintBitsToFloat(bytes_48_63.y);
    } else {
        // Depth mode
        // TODO(achan): We should compute the depth for each individual fragment based
        // on its position within the rasterized Gaussian quad, rather than pretend all
        // fragments of the quad have the depth of the center.
        //
        // This seems important for getting the correct world-space point of a fragment
        // for accurate lighting.
        float depth = pos2d.w;
        vColor = vec4(
            depth,
            0.,
            length(cam.xyz),
            float(opacity255) / 255.0
        );
    }
    vPosition = position;

    vec2 vCenter = vec2(pos2d) / pos2d.w;
    gl_Position = vec4(
        vCenter
        + position.x * majorAxis / viewport
        + position.y * minorAxis / viewport, 0.0, 1.0);

}
`.trim();

const overlayVertexSource = `
#version 300 es
precision highp float;

uniform mat4 projection, view;
uniform vec3 worldCameraPosition;
uniform vec3 worldCameraUp;
uniform vec2 size;

in vec2 uv;
in vec3 worldCenter;

out vec2 vUv;

void main () {
    vec3 worldP = worldCenter;
    // Overlay quad should always face the camera
    vec3 dirToCamera = normalize(worldCameraPosition - worldP);
    vec3 up = worldCameraUp;
    vec3 right = normalize(cross(up, dirToCamera));

    vec4 world_p = vec4(worldP, 1.) + vec4(size.x * right * (uv.x-0.5) + size.y * up * (uv.y-0.5), 0);
    vec4 eye_p = view * world_p;
    vec4 clip_p = projection * eye_p;

    vUv = uv;
    gl_Position = clip_p;
}
`.trim();

const cubeMapDebugFragmentSource = `
#version 300 es
precision highp float;

uniform samplerCube overlayTexture;

in vec2 vUv;

out vec4 fragColor;

void main () {
    fragColor.rgb = vec3(0.0, 0.0, 0.2);

	vec3 samplePos = vec3(0.0f);

	// Crude statement to visualize different cube map faces based on UV coordinates
	int x = int(floor(vUv.x / 0.25f));
	int y = int(floor(vUv.y / (1.0 / 3.0)));
	if (y == 1) {
		vec2 uv = vec2(vUv.x * 4.0f, (vUv.y - 1.0/3.0) * 3.0);
		uv = 2.0 * vec2(uv.x - float(x) * 1.0, uv.y) - 1.0;
		switch (x) {
			case 0:	// NEGATIVE_X
				samplePos = vec3(-1.0f, uv.y, uv.x);
				break;
			case 1: // POSITIVE_Z
				samplePos = vec3(uv.x, uv.y, 1.0f);
				break;
			case 2: // POSITIVE_X
				samplePos = vec3(1.0, uv.y, -uv.x);
				break;
			case 3: // NEGATIVE_Z
				samplePos = vec3(-uv.x, uv.y, -1.0f);
				break;
		}
	} else {
		if (x == 1) {
			vec2 uv = vec2((vUv.x - 0.25) * 4.0, (vUv.y - float(y) / 3.0) * 3.0);
			uv = 2.0 * uv - 1.0;
			switch (y) {
				case 0: // NEGATIVE_Y
					samplePos = vec3(uv.x, -1.0f, uv.y);
					break;
				case 2: // POSITIVE_Y
					samplePos = vec3(uv.x, 1.0f, -uv.y);
					break;
			}
		}
	}

	if ((samplePos.x != 0.0f) && (samplePos.y != 0.0f)) {
        fragColor = vec4(texture(overlayTexture, samplePos).r, 0., 0., 1.);
	}
}

`.trim();

const overlayFragmentSource = `
#version 300 es
precision highp float;

uniform sampler2D overlayTexture;

in vec2 vUv;

out vec4 fragColor;

void main () {
    fragColor = texture(overlayTexture, vUv);
}

`.trim();

const colorFragmentSource = `
#version 300 es
precision highp float;
precision highp int;

uniform int mode;
uniform float alphaThreshold;

in vec4 vColor;
in vec2 vPosition;

out vec4 fragColor;

void main () {
    if (vColor.a < alphaThreshold) discard;
    float A = -dot(vPosition, vPosition);
    if (A < -4.0) discard;
    float B = exp(A) * vColor.a;
    fragColor = vec4(B * vColor.rgb, B);
}

`.trim();

const MAX_LIGHTS = 8;
const lightingFragmentSource = `
#version 300 es
precision highp float;
precision highp int;

#define M_PI 3.1415926535897932384626433832795

uniform vec2 screenSize;
uniform int usePseudoNormals;
uniform int usePBR;
uniform sampler2D depthTexture;
uniform mat4 invProjection, invView;
uniform vec3 lightPositions[${MAX_LIGHTS}];
uniform mat4 lightViewProjMatrices[${MAX_LIGHTS}];
uniform samplerCube shadowMaps[${MAX_LIGHTS}];
uniform int numLights;

in vec4 vColor;
in vec2 vPosition;
in vec3 vNormal;
in vec3 vPBRColor;
in float vMetallic;
in float vRoughness;

out vec4 fragColor;

float computeShadow(samplerCube shadowMap, vec3 lightToPoint) {
    float depth = length(lightToPoint);

    float shadow = 1.0;
    float bias = 0.05;
    float shadowDepth = texture(shadowMap, vec3(lightToPoint.x, -lightToPoint.y, -lightToPoint.z)).b;
    if (depth - bias <= shadowDepth) {
        shadow = 0.0;
    }
    return shadow;
}

vec3 computePBR(float radiance, vec3 normal, vec3 pointToLight, vec3 pointToCamera, vec3 albedo, float roughness, float metallic) {
    vec3 halfVector = normalize(pointToLight + pointToCamera);
    vec3 fd = (1. - metallic) * albedo / M_PI;

    // D
    float r2 = max(roughness * roughness, 0.0000001);
    float amp = 1.0 / (r2 * M_PI);
    float sharp = 2.0 / r2;
    float D = amp * exp(sharp * (dot(halfVector, normal) - 1.0));

    // F
    vec3 F_0 = 0.04 * (1.0 - metallic) + albedo * metallic;
    vec3 F = F_0 + (1.0f - F_0) * pow(1.0 - dot(halfVector, pointToCamera), 5.0);

    r2 = pow(1.0 + roughness, 2.0) / 8.0;
    float V =
        (0.5 / max(dot(pointToLight, normal) * (1. - r2) + r2, 0.0000001)) *
        (0.5 / max(dot(pointToCamera, normal) * (1. - r2) + r2, 0.0000001));
    vec3 fs = D * F * V;
    float transport = radiance * (2.0 * M_PI * dot(normal, pointToLight));

    return (fd + fs) * transport;
}

void main () {
    float A = -dot(vPosition, vPosition);
    if (A < -4.0) discard;
    float B = exp(A) * vColor.a;

    float du = 1.0 / float(textureSize(depthTexture, 0).x);
    float dv = 1.0 / float(textureSize(depthTexture, 0).y);
    vec2 uv0 = gl_FragCoord.xy / screenSize;
    vec2 uv1 = uv0 + vec2(du, 0.);
    vec2 uv2 = uv0 + vec2(0., dv);
    // Reconstruct clip-space points.
    float clip_w0 = texture(depthTexture, uv0).r;
    float clip_w1 = texture(depthTexture, uv1).r;
    float clip_w2 = texture(depthTexture, uv2).r;
    vec2 ndc0 = 2.0 * uv0 - 1.0;
    vec2 ndc1 = 2.0 * uv1 - 1.0;
    vec2 ndc2 = 2.0 * uv2 - 1.0;

    float zfar = 200.;
    float znear = 0.2;
    float zw = zfar/(zfar - znear);
    float zb = -zfar*znear/(zfar - znear);

    vec4 clip_p0 = clip_w0 * vec4(ndc0, zw, 1.) + vec4(0., 0., zb, 0.);
    vec4 clip_p1 = clip_w1 * vec4(ndc1, zw, 1.) + vec4(0., 0., zb, 0.);
    vec4 clip_p2 = clip_w2 * vec4(ndc2, zw, 1.) + vec4(0., 0., zb, 0.);

    vec4 world_p0 = invView * invProjection * clip_p0;
    vec4 world_p1 = invView * invProjection * clip_p1;
    vec4 world_p2 = invView * invProjection * clip_p2;

    vec4 world_camera = invView * vec4(0., 0., 0., 1.);
    vec3 pointToCamera = world_camera.xyz - world_p0.xyz;

    vec3 normal = vec3(0., 0., 0.);
    if (usePseudoNormals == 1) {
        normal = normalize(cross(world_p1.xyz - world_p0.xyz, world_p2.xyz - world_p0.xyz));
    } else {
        normal = vNormal;
    }
    vec3 albedo = vColor.rgb;
    if (usePBR == 1) {
        albedo = vPBRColor;
    }
    vec3 result = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < numLights; i++) {
        vec3 pointToLight = lightPositions[i] - world_p0.xyz;
        float shadow = 0.;
        switch(i) {
        ${
            // Due to GLSL stupidity we can only index into sampler arrays with constants and so need to
            // codegen this switch statement to allow using the loop counter as array index.
            new Array(MAX_LIGHTS).fill(0).map((_, i) =>
                `case ${i}: shadow = computeShadow(shadowMaps[${i}], -pointToLight); break;`
            ).join("\n")
        }}
        float lightDistance = length(pointToLight);
        float R = 4.0;
        float attenuation = 1. / (pow(lightDistance / R, 2.) + 1.);
        float radiance = (1. - shadow) * attenuation;
        if (usePBR == 1) {
            result += computePBR(
                radiance, normal, normalize(pointToLight),
                normalize(pointToCamera), albedo,
                vRoughness, vMetallic
            );
        } else {
            result += radiance * albedo * max(dot(normal, normalize(pointToLight)), 0.0);
        }
    }
    if (usePBR == 1) {
        // gamma correct
        // TODO: this should use the learned gamma parameter from R3DG if available.
        result = result / (result + vec3(1.0));
        result = pow(result, vec3(1.0/2.2));
    } else {
        float ambient = 0.2;
        result += ambient * albedo;
    }

    fragColor = vec4(B * result, B);
}

`.trim();

const filterVertexSource = `
#version 300 es
precision highp float;

in vec2 uv;

out vec2 vUv;

void main () {
    vUv = uv;
    gl_Position = vec4(2.*uv.x - 1., 2.*uv.y - 1., 0., 1.);
}
`.trim();

const filterFragmentSource = `
#version 300 es
precision highp float;

uniform sampler2D tex;
uniform int kernelSize;
uniform float sigma_range;
uniform float sigma_domain;

in vec2 vUv;

out vec4 fragColor;

vec4 sampleBilateralFiltered(sampler2D tex, vec2 uv) {
    vec2 duv = 1.0 / vec2(textureSize(tex, 0));
    float sigma_range_sq = sigma_range * sigma_range;
    float sigma_domain_sq = sigma_domain * sigma_domain;
    vec4 s0 = texture(tex, uv);

    vec4 result = vec4(0.);
    vec4 totalWeight = vec4(0.);
    for (int i = -kernelSize; i <= kernelSize; i++) {
        for (int j = -kernelSize; j <= kernelSize; j++) {
            vec2 delta = vec2(i, j) * duv;
            float uvSqDist = dot(delta, delta);
            vec2 uvi = uv + delta;
            vec4 si = texture(tex, uvi);
            vec4 rangeSqDist = (si - s0) * (si - s0);
            vec4 wi = exp(- vec4(uvSqDist / (2. * sigma_domain_sq)) - rangeSqDist / (2. * sigma_range_sq));
            result += si * wi;
            totalWeight += wi;
        }
    }
    result = result / totalWeight;
    return result;
}

void main () {
    fragColor = sampleBilateralFiltered(tex, vUv);
}

`.trim();

let defaultViewMatrix = [
    0.47, 0.04, 0.88, 0, -0.11, 0.99, 0.02, 0, -0.88, -0.11, 0.47, 0, 0.07,
    0.03, 6.55, 1,
];
let viewMatrix = defaultViewMatrix;
const MODES = {
    "COLOR": 0,
    "DEPTH": 1,
    "LIGHTING": 2,
};

async function main() {
    let carousel = true;
    const params = new URLSearchParams(location.search);
    try {
        viewMatrix = JSON.parse(decodeURIComponent(location.hash.slice(1)));
        carousel = false;
    } catch (err) {}
    const url = new URL(
        params.get("url") || "lego.lsplat",
        "https://raw.githubusercontent.com/KaranBalakumar/WebGL_relightable_splat/main/assets/"
    );
    const req = await fetch(url, {
        mode: "cors", // no-cors, *cors, same-origin
        credentials: "omit", // include, *same-origin, omit
    });
    console.log(req);
    if (req.status != 200)
        throw new Error(req.status + " Unable to load " + req.url);

    const reader = req.body.getReader();
    let splatData = new Uint8Array(req.headers.get("content-length") - LSPLAT_MAGIC_HEADER.length);

    const downsample =
        splatData.length / PADDED_SPLAT_LENGTH > 500000 ? 1 : 1 / devicePixelRatio;
    console.log(splatData.length / PADDED_SPLAT_LENGTH, downsample);

    const worker = new Worker(
        URL.createObjectURL(
            new Blob(["(", createWorker.toString(), ")(self)"], {
                type: "application/javascript",
            }),
        ),
    );

    const canvas = document.getElementById("canvas");
    const fps = document.getElementById("fps");
    const camid = document.getElementById("camid");
    const addLightButton = document.getElementById("add-light");

    let projectionMatrix;

    const gl = canvas.getContext("webgl2", {
        antialias: false,
    });
    gl.getExtension('EXT_color_buffer_float');

    let LAST_TEX_ID = 0;
    function createTextureObject(filter, textureType) {
        const texId = LAST_TEX_ID++;
        gl.activeTexture(gl.TEXTURE0 + texId);
        let texture = gl.createTexture();
        gl.bindTexture(textureType, texture);
        gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (textureType == gl.TEXTURE_CUBE_MAP) {
            gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        }
        return {
            texture,
            texId,
            textureType,
        };
    }
    function createFBO(w, h, internalFormat, format, type, filter, textureType) {
        let fbo = gl.createFramebuffer();
        var { texture, texId } = createTextureObject(filter, textureType);
        gl.activeTexture(gl.TEXTURE0 + texId);
        gl.bindTexture(textureType, texture);
        if (textureType == gl.TEXTURE_2D) {
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                internalFormat,
                w,
                h,
                0,
                format,
                type,
                null,
            );
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            gl.viewport(0, 0, w, h);
            gl.clear(gl.COLOR_BUFFER_BIT);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            for (let i = 0; i < 6; i++) {
                gl.texImage2D(
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                    0,
                    internalFormat,
                    w,
                    h,
                    0,
                    format,
                    type,
                    null,
                )
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, texture, 0);
            }
        }
        return {
            texture,
            textureType,
            fbo,
            texId,
        };
    }

    var gaussianDataTexture = createTextureObject(gl.NEAREST, gl.TEXTURE_2D);

    const depthWidth = 640;
    const depthHeight = 480;
    let depthFBO = createFBO(depthWidth, depthHeight, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR, gl.TEXTURE_2D);
    let filteredDepthFBO = createFBO(depthWidth, depthHeight, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR, gl.TEXTURE_2D);

    const shadowMapSize = 400;
    let shadowMapFBOs = [];
    let lights = [];
    const DUMMY_SHADOW_MAP_FBO = createFBO(shadowMapSize, shadowMapSize, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR, gl.TEXTURE_CUBE_MAP);

    var lightPositions = new Float32Array(MAX_LIGHTS * 3); // Fixed length for easy upload to GPU
    var ndcSpaceLightBoundingBoxes = []; // At the end of each frame, is guaranteed to have `numLights` elements
    var numLights = 0;
    var selectedLight = -1;
    function addLight() {
        if (numLights >= MAX_LIGHTS) return;
        const i = numLights++;
        shadowMapFBOs.push(createFBO(shadowMapSize, shadowMapSize, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR, gl.TEXTURE_CUBE_MAP));
        const light = {
            position: null,
            faces: {},
            needsShadowMapUpdate: false,
        }
        for (let i = 0; i < 6; i++) {
            light.faces[i] = {
                viewMatrix: null,
                projMatrix: null,
                viewProj: null,
                indexBuffer: gl.createBuffer(),
            };
        }
        lights.push(light);
        updateLightPosition(i, [0, 0, 0]);
        addLightButton.innerHTML = `💡 Add Light (${numLights}/${MAX_LIGHTS})`;
    }
    function updateLightPosition(i, position) {
        const light = lights[i];
        light.position = position;
        light.needsShadowMapUpdate = true;
        for (let f = 0; f < 6; f++) {
            switch (f) {
                case 0: {
                    // positive x
                    light.faces[f].viewMatrix = lookAt(position, add3(position, [-1, 0, 0]), [0, -1, 0]);
                    break;
                }
                case 1: {
                    // negative x
                    light.faces[f].viewMatrix = lookAt(position, add3(position, [1, 0, 0]), [0, -1, 0]);
                    break;
                }
                case 2: {
                    // positive y
                    light.faces[f].viewMatrix = lookAt(position, add3(position, [0, 1, 0]), [0, 0, 1]);
                    break;
                }
                case 3: {
                    // negative y
                    light.faces[f].viewMatrix = lookAt(position, add3(position, [0, -1, 0]), [0, 0, -1]);
                    break;
                }
                case 4: {
                    // positive z
                    light.faces[f].viewMatrix = lookAt(position, add3(position, [0, 0, 1]), [0, -1, 0]);
                    break;
                }
                case 5: {
                    // negative z
                    light.faces[f].viewMatrix = lookAt(position, add3(position, [0, 0, -1]), [0, -1, 0]);
                    break;
                }
            }
            light.faces[f].projMatrix = getProjectionMatrix(shadowMapSize / 2, shadowMapSize / 2, shadowMapSize, shadowMapSize);
            light.faces[f].viewProj = multiply4(light.faces[f].projMatrix, light.faces[f].viewMatrix);
            worker.postMessage({ view: light.faces[f].viewProj, label: `light-${i}-${f}` });
        }
        lightPositions[i * 3] = position[0];
        lightPositions[i * 3 + 1] = position[1];
        lightPositions[i * 3 + 2] = position[2];
    }
    addLightButton.addEventListener("click", addLight);

    const lightOverlayTexture = createTextureObject(gl.LINEAR, gl.TEXTURE_2D);
    const image = new Image();
    image.src = "./lightbulb.png";
    image.onload = function() {
        gl.activeTexture(gl.TEXTURE0 + lightOverlayTexture.texId);
        gl.bindTexture(gl.TEXTURE_2D, lightOverlayTexture.texture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    };

    const indexBuffer = gl.createBuffer();

    const GAUSSIAN_QUAD_VERTICES = new Float32Array([
        -2, -2,
        2, -2,
        2, 2,
        -2, 2
    ]);
    const gaussianQuadVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gaussianQuadVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, GAUSSIAN_QUAD_VERTICES, gl.STATIC_DRAW);

    const QUAD_UVS = new Float32Array([
        0, 1,
        1, 1,
        1, 0,
        0, 0
    ]);
    const quadUVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadUVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD_UVS, gl.STATIC_DRAW);

    const gaussianVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gaussianVertexShader, gaussianVertexSource);
    gl.compileShader(gaussianVertexShader);
    if (!gl.getShaderParameter(gaussianVertexShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(gaussianVertexShader));
    }

    const colorFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(colorFragmentShader, colorFragmentSource);
    gl.compileShader(colorFragmentShader);
    if (!gl.getShaderParameter(colorFragmentShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(colorFragmentShader));
    }

    const lightingFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(lightingFragmentShader, lightingFragmentSource);
    gl.compileShader(lightingFragmentShader);
    if (!gl.getShaderParameter(lightingFragmentShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(lightingFragmentShader));
    }

    const overlayVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(overlayVertexShader, overlayVertexSource);
    gl.compileShader(overlayVertexShader);
    if (!gl.getShaderParameter(overlayVertexShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(overlayVertexShader));
    }

    const overlayFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(overlayFragmentShader, overlayFragmentSource);
    gl.compileShader(overlayFragmentShader);
    if (!gl.getShaderParameter(overlayFragmentShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(overlayFragmentShader));
    }

    const filterVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(filterVertexShader, filterVertexSource);
    gl.compileShader(filterVertexShader);
    if (!gl.getShaderParameter(filterVertexShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(filterVertexShader));
    }

    const filterFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(filterFragmentShader, filterFragmentSource);
    gl.compileShader(filterFragmentShader);
    if (!gl.getShaderParameter(filterFragmentShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(filterFragmentShader));
    }

    const colorProgram = gl.createProgram();
    gl.attachShader(colorProgram, gaussianVertexShader);
    gl.attachShader(colorProgram, colorFragmentShader);
    gl.linkProgram(colorProgram);
    gl.useProgram(colorProgram);
    if (!gl.getProgramParameter(colorProgram, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(colorProgram));
    }
    const colorProgramUniforms = {
        u_viewport: gl.getUniformLocation(colorProgram, "viewport"),
        u_projection: gl.getUniformLocation(colorProgram, "projection"),
        u_view: gl.getUniformLocation(colorProgram, "view"),
        u_focal: gl.getUniformLocation(colorProgram, "focal"),
        u_textureLocation: gl.getUniformLocation(colorProgram, "u_texture"),
        u_mode: gl.getUniformLocation(colorProgram, "mode"),
        u_alphaThreshold: gl.getUniformLocation(colorProgram, "alphaThreshold"),
    };
    const colorProgramAttributes = {
        a_position: gl.getAttribLocation(colorProgram, "position"),
        a_index: gl.getAttribLocation(colorProgram, "index"),
    };

    const lightingProgram = gl.createProgram();
    gl.attachShader(lightingProgram, gaussianVertexShader);
    gl.attachShader(lightingProgram, lightingFragmentShader);
    gl.linkProgram(lightingProgram);
    gl.useProgram(lightingProgram);
    if (!gl.getProgramParameter(lightingProgram, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(lightingProgram));
    }
    const lightingProgramUniforms = {
        u_viewport: gl.getUniformLocation(lightingProgram, "viewport"),
        u_projection: gl.getUniformLocation(lightingProgram, "projection"),
        u_view: gl.getUniformLocation(lightingProgram, "view"),
        u_focal: gl.getUniformLocation(lightingProgram, "focal"),
        u_textureLocation: gl.getUniformLocation(lightingProgram, "u_texture"),
        u_depthTextureLocation: gl.getUniformLocation(lightingProgram, "depthTexture"),
        u_mode: gl.getUniformLocation(lightingProgram, "mode"),
        u_screenSize: gl.getUniformLocation(lightingProgram, "screenSize"),
        u_invProjection: gl.getUniformLocation(lightingProgram, "invProjection"),
        u_invView: gl.getUniformLocation(lightingProgram, "invView"),
        u_lightPositions: gl.getUniformLocation(lightingProgram, "lightPositions"),
        u_lightViewProjMatrices: gl.getUniformLocation(lightingProgram, "lightViewProjMatrices"),
        u_shadowMaps: gl.getUniformLocation(lightingProgram, "shadowMaps"),
        u_numLights: gl.getUniformLocation(lightingProgram, "numLights"),
        u_sigma_range: gl.getUniformLocation(lightingProgram, "sigma_range"),
        u_sigma_domain: gl.getUniformLocation(lightingProgram, "sigma_domain"),
        u_kernelSize: gl.getUniformLocation(lightingProgram, "kernelSize"),
        u_usePseudoNormals: gl.getUniformLocation(lightingProgram, "usePseudoNormals"),
        u_usePBR: gl.getUniformLocation(lightingProgram, "usePBR"),
    };
    let alphaThreshold = 0.0;
    let usePseudoNormals = 0;
    let usePBR = 0;
    const lightingProgramAttributes = {
        a_position: gl.getAttribLocation(lightingProgram, "position"),
        a_index: gl.getAttribLocation(lightingProgram, "index"),
    };

    const filterProgram = gl.createProgram();
    gl.attachShader(filterProgram, filterVertexShader);
    gl.attachShader(filterProgram, filterFragmentShader);
    gl.linkProgram(filterProgram);
    gl.useProgram(filterProgram);
    if (!gl.getProgramParameter(filterProgram, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(filterProgram));
    }
    const filterProgramUniforms = {
        u_tex: gl.getUniformLocation(filterProgram, "tex"),
        u_sigma_range: gl.getUniformLocation(filterProgram, "sigma_range"),
        u_sigma_domain: gl.getUniformLocation(filterProgram, "sigma_domain"),
        u_kernelSize: gl.getUniformLocation(filterProgram, "kernelSize"),
    };
    const sigma_range_step = 0.01;
    const sigma_domain_step = 1.0 / 640;
    let sigma_range = 0.1;
    let sigma_domain = 0.1;
    let kernelSize = 1;
    const filterProgramAttributes = {
        a_uv: gl.getAttribLocation(filterProgram, "uv"),
    };

    const overlayProgram = gl.createProgram();
    gl.attachShader(overlayProgram, overlayVertexShader);
    gl.attachShader(overlayProgram, overlayFragmentShader);
    gl.linkProgram(overlayProgram);
    gl.useProgram(overlayProgram);
    if (!gl.getProgramParameter(overlayProgram, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(overlayProgram));
    }
    const overlayProgramUniforms = {
        u_texture: gl.getUniformLocation(overlayProgram, "overlayTexture"),
        u_projection: gl.getUniformLocation(overlayProgram, "projection"),
        u_view: gl.getUniformLocation(overlayProgram, "view"),
        u_worldCameraPosition: gl.getUniformLocation(overlayProgram, "worldCameraPosition"),
        u_worldCameraUp: gl.getUniformLocation(overlayProgram, "worldCameraUp"),
        u_size: gl.getUniformLocation(overlayProgram, "size"),
    };
    const overlayProgramAttributes = {
        a_uv: gl.getAttribLocation(overlayProgram, "uv"),
        a_worldCenter: gl.getAttribLocation(overlayProgram, "worldCenter"),
    };
    // Setup attributes for overlay center positions and allocate space for an array of light overlays
    const lightOverlayCenterBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lightOverlayCenterBuffer);
    // Just allocate, don't upload yet
    gl.bufferData(gl.ARRAY_BUFFER, lightPositions.byteLength, gl.DYNAMIC_DRAW); // DYNAMIC_DRAW because we will change this often

    gl.disable(gl.DEPTH_TEST); // Disable depth testing

    // Enable blending
    gl.enable(gl.BLEND);

    var currentMode = params.get('mode') == 'color' ? MODES.COLOR : MODES.LIGHTING;

    const resize = () => {
        projectionMatrix = getProjectionMatrix(
            camera.fx,
            camera.fy,
            innerWidth,
            innerHeight,
        );

        gl.canvas.width = Math.round(innerWidth / downsample);
        gl.canvas.height = Math.round(innerHeight / downsample);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    };

    window.addEventListener("resize", resize);
    resize();

    worker.onmessage = (e) => {
        if (e.data.buffer) {
            splatData = new Uint8Array(e.data.buffer);
            const exportedSplatData = new Uint8Array(LSPLAT_MAGIC_HEADER.length + splatData.length);
            exportedSplatData.set(LSPLAT_MAGIC_HEADER, 0);
            exportedSplatData.set(splatData, LSPLAT_MAGIC_HEADER.length);
            const blob = new Blob([exportedSplatData.buffer], {
                type: "application/octet-stream",
            });
            const link = document.createElement("a");
            link.download = "model.lsplat";
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            worker.postMessage({
                buffer: splatData.buffer,
                gaussianCount: Math.floor(splatData.length / PADDED_SPLAT_LENGTH),
            });
        } else if (e.data.texdata) {
            const { texdata, texwidth, texheight, hasNormals } = e.data;
            gl.activeTexture(gl.TEXTURE0 + gaussianDataTexture.texId);
            gl.bindTexture(gl.TEXTURE_2D, gaussianDataTexture.texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA32UI,
                texwidth,
                texheight,
                0,
                gl.RGBA_INTEGER,
                gl.UNSIGNED_INT,
                texdata,
            );
            if (!hasNormals && !usePseudoNormals) {
                usePseudoNormals = true;
            }
        } else if (e.data.depthIndex) {
            const { depthIndex, label } = e.data;
            if (!label) {
                console.error("Expected label for sort result");
            } else if (label == "main") {
                gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, depthIndex, gl.DYNAMIC_DRAW);
            } else if (label.startsWith("light-")) {
                // looks like `light-{i}-{face}`
                const i = parseInt(label.slice(`light-`.length, `light-`.length + 1));
                const face = parseInt(label.slice(`light-0-`.length, `light-0-`.length + 1));
                const light = lights[i];
                gl.bindBuffer(gl.ARRAY_BUFFER, light.faces[face].indexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, depthIndex, gl.DYNAMIC_DRAW);
                light.needsShadowMapUpdate = true;
            }
            gaussianCount = e.data.gaussianCount;
        }
    };

    let activeKeys = [];
    let currentCameraIndex = 0;

    window.addEventListener("keydown", (e) => {
        // if (document.activeElement != document.body) return;
        carousel = false;
        if (!activeKeys.includes(e.code)) activeKeys.push(e.code);
        if (/\d/.test(e.key)) {
            currentCameraIndex = parseInt(e.key)
            camera = cameras[currentCameraIndex];
            viewMatrix = getViewMatrix(camera);
        }
        if (['-', '_'].includes(e.key)){
            currentCameraIndex = (currentCameraIndex + cameras.length - 1) % cameras.length;
            viewMatrix = getViewMatrix(cameras[currentCameraIndex]);
        }
        if (['+', '='].includes(e.key)){
            currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
            viewMatrix = getViewMatrix(cameras[currentCameraIndex]);
        }
        if (['m', 'M'].includes(e.key)) {
            if (currentMode == MODES.LIGHTING) {
                currentMode = MODES.COLOR;
            } else {
                currentMode = MODES.LIGHTING;
            }
        }
        if (['['].includes(e.key)) {
            sigma_range = Math.max(0, sigma_range - sigma_range_step);
            console.log("bilateral filter sigma_range:", sigma_range);
        }
        if ([']'].includes(e.key)) {
            sigma_range += sigma_range_step;
            console.log("bilateral filter sigma_range:", sigma_range);
        }
        if ([',','<'].includes(e.key)) {
            alphaThreshold = Math.max(0, alphaThreshold - 0.01);
            console.log("alphaThreshold:", alphaThreshold);
        }
        if (['.','>'].includes(e.key)) {
            alphaThreshold = Math.min(1, alphaThreshold + 0.01);
            console.log("alphaThreshold:", alphaThreshold);
        }
        if ([';'].includes(e.key)) {
            kernelSize = Math.max(0, kernelSize - 1);
            console.log("kernelSize:", kernelSize);
        }
        if (["'"].includes(e.key)) {
            kernelSize += 1;
            console.log("kernelSize:", kernelSize);
        }
        if (["n", "N"].includes(e.key)) {
            usePseudoNormals = 1 - usePseudoNormals;
            console.log("usePseudoNormals:", usePseudoNormals);
        }
        if (["|", "\\"].includes(e.key)) {
            usePBR = 1 - usePBR;
            console.log("usePBR:", usePBR);
        }
        camid.innerText = "cam  " + currentCameraIndex;
        if (e.code == "KeyV") {
            location.hash =
                "#" +
                JSON.stringify(
                    viewMatrix.map((k) => Math.round(k * 100) / 100),
                );
                camid.innerText =""
        } else if (e.code === "KeyP") {
            carousel = true;
            camid.innerText =""
        }
    });
    window.addEventListener("keyup", (e) => {
        activeKeys = activeKeys.filter((k) => k !== e.code);
    });
    window.addEventListener("blur", () => {
        activeKeys = [];
    });

    window.addEventListener(
        "wheel",
        (e) => {
            carousel = false;
            e.preventDefault();
            const lineHeight = 10;
            const scale =
                e.deltaMode == 1
                    ? lineHeight
                    : e.deltaMode == 2
                    ? innerHeight
                    : 1;
            let inv = invert4(viewMatrix);
            if (e.shiftKey) {
                inv = translate4(
                    inv,
                    (e.deltaX * scale) / innerWidth,
                    (e.deltaY * scale) / innerHeight,
                    0,
                );
            } else if (e.ctrlKey || e.metaKey) {
                // inv = rotate4(inv,  (e.deltaX * scale) / innerWidth,  0, 0, 1);
                // inv = translate4(inv,  0, (e.deltaY * scale) / innerHeight, 0);
                // let preY = inv[13];
                inv = translate4(
                    inv,
                    0,
                    0,
                    (-10 * (e.deltaY * scale)) / innerHeight,
                );
                // inv[13] = preY;
            } else {
                let d = 4;
                inv = translate4(inv, 0, 0, d);
                inv = rotate4(inv, -(e.deltaX * scale) / innerWidth, 0, 1, 0);
                inv = rotate4(inv, (e.deltaY * scale) / innerHeight, 1, 0, 0);
                inv = translate4(inv, 0, 0, -d);
            }

            viewMatrix = invert4(inv);
        },
        { passive: false },
    );

    let startX, startY, down;
    canvas.addEventListener("mousedown", (e) => {
        carousel = false;
        startX = e.clientX;
        startY = e.clientY;
        const ndcX = 2.0 * (e.clientX / innerWidth) - 1.0;
        const ndcY = 2.0 * (1.0 - e.clientY / innerHeight) - 1.0;
        selectedLight = getSelectedLight(ndcX, ndcY);
        down = e.ctrlKey || e.metaKey ? 2 : 1;
    });
    canvas.addEventListener("contextmenu", (e) => {
        carousel = false;
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        down = 2;
    });

    function getSelectedLight(ndcX, ndcY) {
        // TODO break ties with distance from camera
        for (let i = 0; i < ndcSpaceLightBoundingBoxes.length; i++) {
            const [minX, maxY, maxX, minY] = ndcSpaceLightBoundingBoxes[i];
            if (ndcX >= minX && ndcX <= maxX && ndcY >= minY && ndcY <= maxY) {
                return i;
            }
        }
        return -1;
    }

    canvas.addEventListener("mousemove", (e) => {
        e.preventDefault();
        let useHoverCursor = false;
        if (down == 0) {
            const ndcX = 2.0 * (e.clientX / innerWidth) - 1.0;
            const ndcY = 2.0 * (1.0 - e.clientY / innerHeight) - 1.0;
            useHoverCursor = getSelectedLight(ndcX, ndcY) >= 0;
        } else if (down == 1) {
            if (selectedLight >= 0) {
                let lightPos = lightPositions.slice(selectedLight * 3, selectedLight * 3 + 3);
                // Reposition light to the projection of the mouse cursor on the XY-plane at the light's current depth in camera space
                const viewProj = multiply4(projectionMatrix, viewMatrix);
                let invViewProj = invert4(viewProj);
                const lightPosClip = transform4(viewProj, [...lightPos, 1]);
                const ndcCursor = [2.0 * (e.clientX / innerWidth) - 1.0, 2.0 * (1.0 - e.clientY / innerHeight) - 1.0];
                const clipCursor = [lightPosClip[3] * ndcCursor[0], lightPosClip[3] * ndcCursor[1], lightPosClip[2], lightPosClip[3]];
                const worldCursor = transform4(invViewProj, clipCursor);
                updateLightPosition(selectedLight, worldCursor);
            } else {
                let inv = invert4(viewMatrix);
                let dx = (5 * (e.clientX - startX)) / innerWidth;
                let dy = (5 * (e.clientY - startY)) / innerHeight;
                let d = 4;

                inv = translate4(inv, 0, 0, d);
                inv = rotate4(inv, dx, 0, 1, 0);
                inv = rotate4(inv, -dy, 1, 0, 0);
                inv = translate4(inv, 0, 0, -d);
                viewMatrix = invert4(inv);

                startX = e.clientX;
                startY = e.clientY;
            }
        } else if (down == 2) {
            let inv = invert4(viewMatrix);
            if (selectedLight >= 0) {
                // Translate light on Z-axis in camera-space
                let lightPos = lightPositions.slice(selectedLight * 3, selectedLight * 3 + 3);
                let delta = [
                    0,
                    0,
                    (5 * (e.clientY - startY)) / innerHeight,
                    1,
                ];
                delta = transform4([...inv.slice(0, 12), 0, 0, 0, 1], delta);
                lightPos[0] += delta[0];
                lightPos[1] += delta[1];
                lightPos[2] += delta[2];
                updateLightPosition(selectedLight, lightPos);
            } else {
                // Translate camera on XZ-plane in camera-space
                inv = translate4(
                    inv,
                    (-10 * (e.clientX - startX)) / innerWidth,
                    0,
                    (10 * (e.clientY - startY)) / innerHeight,
                );
                viewMatrix = invert4(inv);
            }
            startX = e.clientX;
            startY = e.clientY;
        }
        if (useHoverCursor) {
            document.documentElement.style.cursor = 'grab';
        } else {
            document.documentElement.style.cursor = 'default';
        }
    });
    canvas.addEventListener("mouseup", (e) => {
        e.preventDefault();
        down = 0;
        selectedLight = -1;
        startX = 0;
        startY = 0;
    });

    let altX = 0,
        altY = 0;
    canvas.addEventListener(
        "touchstart",
        (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                carousel = false;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                down = 1;
            } else if (e.touches.length === 2) {
                // console.log('beep')
                carousel = false;
                startX = e.touches[0].clientX;
                altX = e.touches[1].clientX;
                startY = e.touches[0].clientY;
                altY = e.touches[1].clientY;
                down = 1;
            }
        },
        { passive: false },
    );
    canvas.addEventListener(
        "touchmove",
        (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && down) {
                let inv = invert4(viewMatrix);
                let dx = (4 * (e.touches[0].clientX - startX)) / innerWidth;
                let dy = (4 * (e.touches[0].clientY - startY)) / innerHeight;

                let d = 4;
                inv = translate4(inv, 0, 0, d);
                inv = rotate4(inv, dx, 0, 1, 0);
                inv = rotate4(inv, -dy, 1, 0, 0);
                inv = translate4(inv, 0, 0, -d);

                viewMatrix = invert4(inv);

                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dtheta =
                    Math.atan2(startY - altY, startX - altX) -
                    Math.atan2(
                        e.touches[0].clientY - e.touches[1].clientY,
                        e.touches[0].clientX - e.touches[1].clientX,
                    );
                const dscale =
                    Math.hypot(startX - altX, startY - altY) /
                    Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY,
                    );
                const dx =
                    (e.touches[0].clientX +
                        e.touches[1].clientX -
                        (startX + altX)) /
                    2;
                const dy =
                    (e.touches[0].clientY +
                        e.touches[1].clientY -
                        (startY + altY)) /
                    2;
                let inv = invert4(viewMatrix);
                inv = rotate4(inv, dtheta, 0, 0, 1);

                inv = translate4(inv, -dx / innerWidth, -dy / innerHeight, 0);

                inv = translate4(inv, 0, 0, 3 * (1 - dscale));

                viewMatrix = invert4(inv);

                startX = e.touches[0].clientX;
                altX = e.touches[1].clientX;
                startY = e.touches[0].clientY;
                altY = e.touches[1].clientY;
            }
        },
        { passive: false },
    );
    canvas.addEventListener(
        "touchend",
        (e) => {
            e.preventDefault();
            down = 0;
            selectedLight = -1;
            startX = 0;
            startY = 0;
        },
        { passive: false },
    );

    let jumpDelta = 0;
    let gaussianCount = 0;

    let lastFrame = 0;
    let avgFps = 0;
    let start = 0;

    window.addEventListener("gamepadconnected", (e) => {
        const gp = navigator.getGamepads()[e.gamepad.index];
        console.log(
            `Gamepad connected at index ${gp.index}: ${gp.id}. It has ${gp.buttons.length} buttons and ${gp.axes.length} axes.`,
        );
    });
    window.addEventListener("gamepaddisconnected", (e) => {
        console.log("Gamepad disconnected");
    });

    let leftGamepadTrigger, rightGamepadTrigger;

    const frame = (now) => {
        let inv = invert4(viewMatrix);
        let shiftKey = activeKeys.includes("Shift") || activeKeys.includes("ShiftLeft") || activeKeys.includes("ShiftRight")

        if (activeKeys.includes("ArrowUp")) {
            if (shiftKey) {
                inv = translate4(inv, 0, -0.03, 0);
            } else {
                inv = translate4(inv, 0, 0, 0.1);
            }
        }
        if (activeKeys.includes("ArrowDown")) {
            if (shiftKey) {
                inv = translate4(inv, 0, 0.03, 0);
            } else {
                inv = translate4(inv, 0, 0, -0.1);
            }
        }
        if (activeKeys.includes("ArrowLeft"))
            inv = translate4(inv, -0.03, 0, 0);
        //
        if (activeKeys.includes("ArrowRight"))
            inv = translate4(inv, 0.03, 0, 0);
        // inv = rotate4(inv, 0.01, 0, 1, 0);
        if (activeKeys.includes("KeyA")) inv = rotate4(inv, -0.01, 0, 1, 0);
        if (activeKeys.includes("KeyD")) inv = rotate4(inv, 0.01, 0, 1, 0);
        if (activeKeys.includes("KeyQ")) inv = rotate4(inv, 0.01, 0, 0, 1);
        if (activeKeys.includes("KeyE")) inv = rotate4(inv, -0.01, 0, 0, 1);
        if (activeKeys.includes("KeyW")) inv = rotate4(inv, 0.005, 1, 0, 0);
        if (activeKeys.includes("KeyS")) inv = rotate4(inv, -0.005, 1, 0, 0);

        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        let isJumping = activeKeys.includes("Space");
        for (let gamepad of gamepads) {
            if (!gamepad) continue;

            const axisThreshold = 0.1; // Threshold to detect when the axis is intentionally moved
            const moveSpeed = 0.06;
            const rotateSpeed = 0.02;

            // Assuming the left stick controls translation (axes 0 and 1)
            if (Math.abs(gamepad.axes[0]) > axisThreshold) {
                inv = translate4(inv, moveSpeed * gamepad.axes[0], 0, 0);
                carousel = false;
            }
            if (Math.abs(gamepad.axes[1]) > axisThreshold) {
                inv = translate4(inv, 0, 0, -moveSpeed * gamepad.axes[1]);
                carousel = false;
            }
            if(gamepad.buttons[12].pressed || gamepad.buttons[13].pressed){
                inv = translate4(inv, 0, -moveSpeed*(gamepad.buttons[12].pressed - gamepad.buttons[13].pressed), 0);
                carousel = false;
            }

            if(gamepad.buttons[14].pressed || gamepad.buttons[15].pressed){
                inv = translate4(inv, -moveSpeed*(gamepad.buttons[14].pressed - gamepad.buttons[15].pressed), 0, 0);
                carousel = false;
            }

            // Assuming the right stick controls rotation (axes 2 and 3)
            if (Math.abs(gamepad.axes[2]) > axisThreshold) {
                inv = rotate4(inv, rotateSpeed * gamepad.axes[2], 0, 1, 0);
                carousel = false;
            }
            if (Math.abs(gamepad.axes[3]) > axisThreshold) {
                inv = rotate4(inv, -rotateSpeed * gamepad.axes[3], 1, 0, 0);
                carousel = false;
            }

            let tiltAxis = gamepad.buttons[6].value - gamepad.buttons[7].value;
            if (Math.abs(tiltAxis) > axisThreshold) {
                inv = rotate4(inv, rotateSpeed * tiltAxis, 0, 0, 1);
                carousel = false;
            }
            if (gamepad.buttons[4].pressed && !leftGamepadTrigger) {
                camera = cameras[(cameras.indexOf(camera)+1)%cameras.length]
                inv = invert4(getViewMatrix(camera));
                carousel = false;
            }
            if (gamepad.buttons[5].pressed && !rightGamepadTrigger) {
                camera = cameras[(cameras.indexOf(camera)+cameras.length-1)%cameras.length]
                inv = invert4(getViewMatrix(camera));
                carousel = false;
            }
            leftGamepadTrigger = gamepad.buttons[4].pressed;
            rightGamepadTrigger = gamepad.buttons[5].pressed;
            if (gamepad.buttons[0].pressed) {
                isJumping = true;
                carousel = false;
            }
            if(gamepad.buttons[3].pressed){
                carousel = true;
            }
        }

        if (
            ["KeyJ", "KeyK", "KeyL", "KeyI"].some((k) => activeKeys.includes(k))
        ) {
            let d = 4;
            inv = translate4(inv, 0, 0, d);
            inv = rotate4(
                inv,
                activeKeys.includes("KeyJ")
                    ? -0.05
                    : activeKeys.includes("KeyL")
                    ? 0.05
                    : 0,
                0,
                1,
                0,
            );
            inv = rotate4(
                inv,
                activeKeys.includes("KeyI")
                    ? 0.05
                    : activeKeys.includes("KeyK")
                    ? -0.05
                    : 0,
                1,
                0,
                0,
            );
            inv = translate4(inv, 0, 0, -d);
        }

        viewMatrix = invert4(inv);

        if (carousel) {
            let inv = invert4(defaultViewMatrix);

            const t = Math.sin((Date.now() - start) / 5000);
            inv = translate4(inv, 2.5 * t, 0, 6 * (1 - Math.cos(t)));
            inv = rotate4(inv, -0.6 * t, 0, 1, 0);

            viewMatrix = invert4(inv);
        }

        if (isJumping) {
            jumpDelta = Math.min(1, jumpDelta + 0.05);
        } else {
            jumpDelta = Math.max(0, jumpDelta - 0.05);
        }

        let inv2 = invert4(viewMatrix);
        inv2 = translate4(inv2, 0, -jumpDelta, 0);
        inv2 = rotate4(inv2, -0.1 * jumpDelta, 1, 0, 0);
        let actualViewMatrix = invert4(inv2);

        const viewProj = multiply4(projectionMatrix, actualViewMatrix);
        worker.postMessage({ view: viewProj, label: "main" });

        // Hit-test light overlays
        ndcSpaceLightBoundingBoxes = [];
        const BBOX_WIDTH = 0.05;
        const BBOX_HEIGHT = 0.1;
        for (let i = 0; i < numLights; i++) {
            const lightPosition = [lightPositions[i * 3], lightPositions[i * 3 + 1], lightPositions[i * 3 + 2], 1.];
            const clipLightPosition = transform4(viewProj, lightPosition);
            const ndcLightPositionXY = [
                clipLightPosition[0] / clipLightPosition[3], clipLightPosition[1] / clipLightPosition[3]
            ];
            ndcSpaceLightBoundingBoxes.push([
                // top-left
                ndcLightPositionXY[0] - BBOX_WIDTH, ndcLightPositionXY[1] + BBOX_HEIGHT,
                // bottom-right
                ndcLightPositionXY[0] + BBOX_WIDTH, ndcLightPositionXY[1] - BBOX_HEIGHT,
            ]);
        }

        const currentFps = 1000 / (now - lastFrame) || 0;
        avgFps = avgFps * 0.9 + currentFps * 0.1;

        gl.useProgram(colorProgram);
        gl.uniform1i(colorProgramUniforms.u_textureLocation, gaussianDataTexture.texId);
        gl.uniform2fv(colorProgramUniforms.u_focal, new Float32Array([camera.fx, camera.fy]));
        gl.uniform2fv(colorProgramUniforms.u_viewport, new Float32Array([innerWidth, innerHeight]));
        gl.uniformMatrix4fv(colorProgramUniforms.u_projection, false, projectionMatrix);
        // See eqn. 3 of the 3D gaussian splats paper for alpha blending.
        // Note in the fragment shader we also pre-multiply the color by the source alpha.
        gl.blendFunc(
            gl.ONE_MINUS_DST_ALPHA,
            gl.ONE,
        );
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
        if (gaussianCount > 0) {
            document.getElementById("spinner").style.display = "none";

            // 1. write to depth framebuffer which will be used for surface normal reconstruction
            gl.uniformMatrix4fv(colorProgramUniforms.u_view, false, actualViewMatrix);
            gl.uniform1i(colorProgramUniforms.u_mode, MODES.DEPTH);
            gl.uniform1f(colorProgramUniforms.u_alphaThreshold, alphaThreshold);

            gl.enableVertexAttribArray(colorProgramAttributes.a_position);
            gl.bindBuffer(gl.ARRAY_BUFFER, gaussianQuadVertexBuffer);
            gl.vertexAttribPointer(colorProgramAttributes.a_position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(colorProgramAttributes.a_index);
            gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
            gl.vertexAttribIPointer(colorProgramAttributes.a_index, 1, gl.INT, false, 0, 0);
            gl.vertexAttribDivisor(colorProgramAttributes.a_index, 1);

            gl.bindFramebuffer(gl.FRAMEBUFFER, depthFBO.fbo);
            gl.viewport(0, 0, depthWidth, depthHeight);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, gaussianCount);

            // Filter depth bilaterally
            gl.useProgram(filterProgram);

            gl.uniform1i(filterProgramUniforms.u_tex, depthFBO.texId);
            gl.uniform1i(filterProgramUniforms.u_kernelSize, kernelSize);
            gl.uniform1f(filterProgramUniforms.u_sigma_domain, sigma_domain);
            gl.uniform1f(filterProgramUniforms.u_sigma_range, sigma_range);

            gl.enableVertexAttribArray(filterProgramAttributes.a_uv);
            gl.bindBuffer(gl.ARRAY_BUFFER, quadUVBuffer);
            gl.vertexAttribPointer(filterProgramAttributes.a_uv, 2, gl.FLOAT, false, 0, 0);

            gl.bindFramebuffer(gl.FRAMEBUFFER, filteredDepthFBO.fbo);
            gl.viewport(0, 0, depthWidth, depthHeight);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

            if (currentMode == MODES.LIGHTING) {
                // 2. draw to shadow maps
                for (let i = 0; i < numLights; i++) {
                    const light = lights[i];
                    if (!light.needsShadowMapUpdate) {
                        continue;
                    }
                    const shadowMapFBO = shadowMapFBOs[i];
                    for (let f = 0; f < 6; f++) {
                        gl.useProgram(colorProgram);

                        gl.uniformMatrix4fv(colorProgramUniforms.u_view, false, light.faces[f].viewMatrix);
                        gl.uniform2fv(colorProgramUniforms.u_focal, new Float32Array([shadowMapSize / 2, shadowMapSize / 2]));
                        gl.uniform2fv(colorProgramUniforms.u_viewport, new Float32Array([shadowMapSize, shadowMapSize]));
                        gl.uniformMatrix4fv(colorProgramUniforms.u_projection, false, light.faces[f].projMatrix);
                        gl.uniform1i(colorProgramUniforms.u_mode, MODES.DEPTH);

                        gl.enableVertexAttribArray(colorProgramAttributes.a_position);
                        gl.bindBuffer(gl.ARRAY_BUFFER, gaussianQuadVertexBuffer);
                        gl.vertexAttribPointer(colorProgramAttributes.a_position, 2, gl.FLOAT, false, 0, 0);
                        gl.enableVertexAttribArray(colorProgramAttributes.a_index);
                        gl.bindBuffer(gl.ARRAY_BUFFER, light.faces[f].indexBuffer);
                        gl.vertexAttribIPointer(colorProgramAttributes.a_index, 1, gl.INT, false, 0, 0);
                        gl.vertexAttribDivisor(colorProgramAttributes.a_index, 1);

                        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFBO.fbo);
                        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + f, shadowMapFBO.texture, 0);
                        gl.viewport(0, 0, shadowMapSize, shadowMapSize);
                        gl.clear(gl.COLOR_BUFFER_BIT);
                        gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, gaussianCount);
                    }
                    light.needsShadowMapUpdate = false;
                }

                // 3. draw scene with lighting
                gl.useProgram(lightingProgram);
                gl.uniformMatrix4fv(lightingProgramUniforms.u_view, false, actualViewMatrix);
                gl.uniform1i(lightingProgramUniforms.u_textureLocation, gaussianDataTexture.texId);
                gl.uniform2fv(lightingProgramUniforms.u_focal, new Float32Array([camera.fx, camera.fy]));
                gl.uniform2fv(lightingProgramUniforms.u_viewport, new Float32Array([innerWidth, innerHeight]));
                gl.uniformMatrix4fv(lightingProgramUniforms.u_projection, false, projectionMatrix);
                gl.uniform2fv(lightingProgramUniforms.u_screenSize, new Float32Array([gl.canvas.width, gl.canvas.height]));
                gl.uniform1i(lightingProgramUniforms.u_depthTextureLocation, filteredDepthFBO.texId);
                gl.uniformMatrix4fv(lightingProgramUniforms.u_invProjection, false, invert4(projectionMatrix));
                gl.uniformMatrix4fv(lightingProgramUniforms.u_invView, false, invert4(actualViewMatrix));
                gl.uniform3fv(lightingProgramUniforms.u_lightPositions, lightPositions);
                gl.uniformMatrix4fv(lightingProgramUniforms.u_lightViewProjMatrices, false, new Float32Array(lights.map(l => l.viewProj).flat()));
                gl.uniform1iv(lightingProgramUniforms.u_shadowMaps, new Int32Array(new Array(MAX_LIGHTS).fill(0).map((_, i) => {
                    if (i < shadowMapFBOs.length) {
                        return shadowMapFBOs[i].texId;
                    } else {
                        // Pad with a dummy sampler unit that won't get used
                        return DUMMY_SHADOW_MAP_FBO.texId;
                    }
                })));
                gl.uniform1i(lightingProgramUniforms.u_numLights, numLights);
                gl.uniform1f(lightingProgramUniforms.u_sigma_range, sigma_range);
                gl.uniform1f(lightingProgramUniforms.u_sigma_domain, sigma_domain);
                gl.uniform1i(lightingProgramUniforms.u_kernelSize, kernelSize);
                gl.uniform1i(lightingProgramUniforms.u_usePseudoNormals, usePseudoNormals);
                gl.uniform1i(lightingProgramUniforms.u_usePBR, usePBR);

                gl.enableVertexAttribArray(lightingProgramAttributes.a_position);
                gl.bindBuffer(gl.ARRAY_BUFFER, gaussianQuadVertexBuffer);
                gl.vertexAttribPointer(lightingProgramAttributes.a_position, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(lightingProgramAttributes.a_index);
                gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
                gl.vertexAttribIPointer(lightingProgramAttributes.a_index, 1, gl.INT, false, 0, 0);
                gl.vertexAttribDivisor(lightingProgramAttributes.a_index, 1);

                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, gaussianCount);

                // 4. draw overlays
                gl.useProgram(overlayProgram);

                gl.uniform1i(overlayProgramUniforms.u_texture, lightOverlayTexture.texId);
                gl.uniformMatrix4fv(overlayProgramUniforms.u_projection, false, projectionMatrix);
                gl.uniformMatrix4fv(overlayProgramUniforms.u_view, false, actualViewMatrix);
                gl.uniform3fv(overlayProgramUniforms.u_worldCameraPosition, new Float32Array([inv2[12], inv2[13], inv2[14]]));
                gl.uniform3fv(overlayProgramUniforms.u_worldCameraUp, new Float32Array([inv2[4], inv2[5], inv2[6]]));
                gl.uniform2fv(overlayProgramUniforms.u_size, new Float32Array([0.2, 0.2]));
                // Use normal over blending
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.blendEquation(gl.FUNC_ADD);

                gl.enableVertexAttribArray(overlayProgramAttributes.a_uv);
                gl.bindBuffer(gl.ARRAY_BUFFER, quadUVBuffer);
                gl.vertexAttribPointer(overlayProgramAttributes.a_uv, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(overlayProgramAttributes.a_worldCenter);
                gl.bindBuffer(gl.ARRAY_BUFFER, lightOverlayCenterBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, lightPositions);
                const bytesPerOverlayCenter = 4 * 3;
                gl.vertexAttribPointer(overlayProgramAttributes.a_worldCenter, 3, gl.FLOAT, false, bytesPerOverlayCenter, 0);
                gl.vertexAttribDivisor(overlayProgramAttributes.a_worldCenter, 1);

                gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, numLights);
            } else {
                // 2. If not in lighting mode, just draw scene with color shader
                gl.useProgram(colorProgram);

                gl.uniform1i(colorProgramUniforms.u_mode, currentMode);
                gl.uniform1f(colorProgramUniforms.u_alphaThreshold, alphaThreshold);

                gl.enableVertexAttribArray(colorProgramAttributes.a_position);
                gl.bindBuffer(gl.ARRAY_BUFFER, gaussianQuadVertexBuffer);
                gl.vertexAttribPointer(colorProgramAttributes.a_position, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(colorProgramAttributes.a_index);
                gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
                gl.vertexAttribIPointer(colorProgramAttributes.a_index, 1, gl.INT, false, 0, 0);
                gl.vertexAttribDivisor(colorProgramAttributes.a_index, 1);

                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, gaussianCount);

                // ... and draw the overlays too
                gl.useProgram(overlayProgram);

                gl.uniform1i(overlayProgramUniforms.u_texture, lightOverlayTexture.texId);
                gl.uniformMatrix4fv(overlayProgramUniforms.u_projection, false, projectionMatrix);
                gl.uniformMatrix4fv(overlayProgramUniforms.u_view, false, actualViewMatrix);
                gl.uniform3fv(overlayProgramUniforms.u_worldCameraPosition, new Float32Array([inv2[12], inv2[13], inv2[14]]));
                gl.uniform3fv(overlayProgramUniforms.u_worldCameraUp, new Float32Array([inv2[4], inv2[5], inv2[6]]));
                gl.uniform2fv(overlayProgramUniforms.u_size, new Float32Array([0.2, 0.2]));
                // Use normal over blending
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.blendEquation(gl.FUNC_ADD);

                gl.enableVertexAttribArray(overlayProgramAttributes.a_uv);
                gl.bindBuffer(gl.ARRAY_BUFFER, quadUVBuffer);
                gl.vertexAttribPointer(overlayProgramAttributes.a_uv, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(overlayProgramAttributes.a_worldCenter);
                gl.bindBuffer(gl.ARRAY_BUFFER, lightOverlayCenterBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, lightPositions);
                const bytesPerOverlayCenter = 4 * 3;
                gl.vertexAttribPointer(overlayProgramAttributes.a_worldCenter, 3, gl.FLOAT, false, bytesPerOverlayCenter, 0);
                gl.vertexAttribDivisor(overlayProgramAttributes.a_worldCenter, 1);

                gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, numLights);
            }
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT);
            document.getElementById("spinner").style.display = "";
            start = Date.now() + 2000;
        }
        const progress = (100 * gaussianCount) / (splatData.length / PADDED_SPLAT_LENGTH);
        if (progress < 100) {
            document.getElementById("progress").style.width = progress + "%";
        } else {
            document.getElementById("progress").style.display = "none";
        }
        fps.innerText = Math.round(avgFps) + " fps";
        if (isNaN(currentCameraIndex)){
            camid.innerText = "";
        }
        lastFrame = now;
        requestAnimationFrame(frame);
    };

    frame();

    const selectFile = (file) => {
        const fr = new FileReader();
        if (/\.json$/i.test(file.name)) {
            fr.onload = () => {
                cameras = JSON.parse(fr.result);
                viewMatrix = getViewMatrix(cameras[0]);
                projectionMatrix = getProjectionMatrix(
                    camera.fx / downsample,
                    camera.fy / downsample,
                    canvas.width,
                    canvas.height,
                );

                console.log("Loaded Cameras");
            };
            fr.readAsText(file);
        } else {
            stopLoading = true;
            fr.onload = () => {
                splatData = new Uint8Array(fr.result);
                console.log("Loaded", Math.floor(splatData.length / PADDED_SPLAT_LENGTH));

                if (
                    splatData.length >= PLY_MAGIC_HEADER.length &&
                    PLY_MAGIC_HEADER.every((v, i) => splatData[i] === v)
                ) {
                    // .ply file
                    worker.postMessage({ ply: splatData.buffer });
                } else if (
                    splatData.length >= LSPLAT_MAGIC_HEADER.length &&
                    LSPLAT_MAGIC_HEADER.every((v, i) => splatData[i] === v)
                ) {
                    splatData = splatData.slice(LSPLAT_MAGIC_HEADER.length);
                    // .lsplat file
                    worker.postMessage({
                        buffer: splatData.buffer,
                        gaussianCount: Math.floor(splatData.length / PADDED_SPLAT_LENGTH),
                    });
                } else {
                    throw new Error("Unsupported file format");
                }
            };
            fr.readAsArrayBuffer(file);
        }
    };

    window.addEventListener("hashchange", (e) => {
        try {
            viewMatrix = JSON.parse(decodeURIComponent(location.hash.slice(1)));
            carousel = false;
        } catch (err) {}
    });

    const preventDefault = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    document.addEventListener("dragenter", preventDefault);
    document.addEventListener("dragover", preventDefault);
    document.addEventListener("dragleave", preventDefault);
    document.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectFile(e.dataTransfer.files[0]);
    });

    let bytesRead = 0;
    let lastGaussianCount = -1;
    let stopLoading = false;

    while (true) {
        const { done, value } = await reader.read();
        if (done || stopLoading) break;

        if (bytesRead + value.length > LSPLAT_MAGIC_HEADER.length) {
            splatData.set(value.subarray(Math.max(0, LSPLAT_MAGIC_HEADER.length - bytesRead)), Math.max(0, bytesRead - LSPLAT_MAGIC_HEADER.length));
        }
        bytesRead += value.length;

        if (gaussianCount > lastGaussianCount) {
            worker.postMessage({
                buffer: splatData.buffer,
                gaussianCount: Math.floor(bytesRead / PADDED_SPLAT_LENGTH),
            });
            lastGaussianCount = gaussianCount;
        }
    }
    if (!stopLoading) {
        worker.postMessage({
            buffer: splatData.buffer,
            gaussianCount: Math.floor(bytesRead / PADDED_SPLAT_LENGTH),
        });
    }
    addLight(); // add a light in after everything finishes loading
}

main().catch((err) => {
    document.getElementById("spinner").style.display = "none";
    document.getElementById("message").innerText = err.toString();
    throw err;
});
