/**
 * Builds the Hair Diary mark (an open journal with a strand of hair that is also its bookmark
 * ribbon) as SVG, then renders the PNGs the app uses with headless Chrome.
 *
 * Usage: node assets/brand/build.mjs [--svg-only]
 *
 * The strand is drawn from a centerline and a width profile, so its shape can be tuned by editing
 * the numbers below instead of hand-editing hundreds of path points.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(HERE, "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const PALETTE = {
    blush: "#EAD9D1",
    cocoa: "#61524A",
    rose: "#D7B5A6",
    darkBackground: "#2B2320",
};

/** Space cut out between overlapping shapes, in canvas units (canvas is 1024). */
const GAP = 22;

// ---------------------------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------------------------

/** Back cover, seen as a frame around the pages. */
const COVER = { x: 200, y: 300, width: 624, height: 312, radius: 28 };

/** Left page outline; the right page mirrors it around x = 512. */
const LEFT_PAGE = [
    "M 250 236",
    "C 340 232 452 250 504 318", // top edge, dipping toward the spine
    "L 512 470", // spine edge (leaves a tapered gap between the pages)
    "L 512 572",
    "C 452 530 340 520 250 536", // bottom edge
    "Z",
].join(" ");

/** Centerline of the strand, from the forked ribbon end inside the book to the tip of the curl. */
const STRAND_PATH = [
    [
        [668, 484],
        [660, 384],
        [652, 262],
        [604, 224],
    ],
    [
        [604, 224],
        [562, 192],
        [518, 228],
        [527, 292],
    ],
    [
        [527, 292],
        [540, 382],
        [520, 472],
        [466, 546],
    ],
    [
        [466, 546],
        [404, 628],
        [380, 702],
        [410, 766],
    ],
    [
        [410, 766],
        [442, 832],
        [542, 846],
        [586, 790],
    ],
    [
        [586, 790],
        [621, 744],
        [596, 690],
        [550, 695],
    ],
    [
        [550, 695],
        [524, 698],
        [511, 718],
        [521, 740],
    ],
];

/** Strand width along its length (s = 0 at the ribbon end, 1 at the curl tip). */
const WIDTH = [
    [0, 52],
    [0.22, 46],
    [0.42, 60],
    [0.58, 74],
    [0.74, 58],
    [0.9, 30],
    [1, 4],
];

/**
 * Share of the strand's width, measured from its outer edge, that is rose (the ribbon). The top of
 * the strand is all ribbon; it turns into cocoa hair as it leaves the book, keeping a rose
 * highlight along the outside until the curl.
 */
const RIBBON_SHARE = [
    [0, 1],
    [0.52, 1],
    [0.64, 0.36],
    [0.7, 0.3],
    [0.8, 0],
    [1, 0],
];

/** Depth of the V notch cut into the ribbon end, like a bookmark ribbon. */
const NOTCH_DEPTH = 26;

// ---------------------------------------------------------------------------------------------
// Strand outline
// ---------------------------------------------------------------------------------------------

function cubic([p0, p1, p2, p3], t) {
    const u = 1 - t;
    return [0, 1].map(
        (i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i],
    );
}

function interpolate(profile, s) {
    for (let i = 1; i < profile.length; i++) {
        const [s1, v1] = profile[i];
        const [s0, v0] = profile[i - 1];
        if (s <= s1) {
            const k = (s - s0) / (s1 - s0);
            // Smoothstep so the width changes without visible kinks.
            const e = k * k * (3 - 2 * k);
            return v0 + (v1 - v0) * e;
        }
    }
    return profile[profile.length - 1][1];
}

/** Samples the centerline evenly by arc length. */
function sampleCenterline(count) {
    const dense = [];
    for (const segment of STRAND_PATH) {
        for (let i = dense.length ? 1 : 0; i <= 400; i++) dense.push(cubic(segment, i / 400));
    }
    const lengths = [0];
    for (let i = 1; i < dense.length; i++) {
        const [dx, dy] = [dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]];
        lengths.push(lengths[i - 1] + Math.hypot(dx, dy));
    }
    const total = lengths[lengths.length - 1];
    const points = [];
    let j = 0;
    for (let i = 0; i < count; i++) {
        const target = (total * i) / (count - 1);
        while (j < lengths.length - 2 && lengths[j + 1] < target) j++;
        const k = (target - lengths[j]) / (lengths[j + 1] - lengths[j] || 1);
        points.push([
            dense[j][0] + (dense[j + 1][0] - dense[j][0]) * k,
            dense[j][1] + (dense[j + 1][1] - dense[j][1]) * k,
        ]);
    }
    return points;
}

/**
 * Returns, for each centerline sample, the point at `offset(s, width)` along the normal. The
 * normal points to the strand's outer edge (up-left where it leaves the book, outside the curl).
 */
function offsetLine(points, offset) {
    return points.map((p, i) => {
        const a = points[Math.max(0, i - 1)];
        const b = points[Math.min(points.length - 1, i + 1)];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const normal = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
        const s = i / (points.length - 1);
        const d = offset(s, interpolate(WIDTH, s));
        return [p[0] + normal[0] * d, p[1] + normal[1] * d];
    });
}

const fmt = ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`;

function polygon(points) {
    return `M ${points.map(fmt).join(" L ")} Z`;
}

function strandShapes() {
    const center = sampleCenterline(700);
    const outer = offsetLine(center, (s, w) => w / 2);
    const inner = offsetLine(center, (s, w) => -w / 2);
    const split = offsetLine(center, (s, w) => w / 2 - w * interpolate(RIBBON_SHARE, s));

    // The V notch at the ribbon end points along the strand, into it.
    const [c0, c1] = [center[0], center[4]];
    const len = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]);
    const notch = [
        c0[0] + ((c1[0] - c0[0]) / len) * NOTCH_DEPTH,
        c0[1] + ((c1[1] - c0[1]) / len) * NOTCH_DEPTH,
    ];

    const whole = polygon([notch, ...outer, ...inner.slice().reverse()]);
    // The hair is the part of the strand the ribbon doesn't cover. It reaches slightly under the
    // ribbon so the seam between them doesn't show the background through anti-aliasing.
    const hairEdge = offsetLine(center, (s, w) => {
        const share = interpolate(RIBBON_SHARE, s);
        return w / 2 - w * share + 1.5 * (1 - share);
    });
    const hair = polygon([...hairEdge, ...inner.slice().reverse()]);
    const ribbonEnd = RIBBON_SHARE.find(([, share]) => share === 0)[0];
    const last = Math.ceil(ribbonEnd * (center.length - 1));
    const ribbon = polygon([
        notch,
        ...outer.slice(0, last + 1),
        ...split.slice(0, last + 1).reverse(),
    ]);
    return { whole, hair, ribbon };
}

// ---------------------------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------------------------

const RIGHT_PAGE = `<path d="${LEFT_PAGE}" transform="translate(1024 0) scale(-1 1)"/>`;
const PAGES = `<path d="${LEFT_PAGE}"/>${RIGHT_PAGE}`;

/**
 * Builds one SVG of the mark.
 *
 * @param {object} options
 * @param {string|null} options.background Full-bleed background color, or null for transparent.
 * @param {string|null} options.book Book color, or null to leave the book out.
 * @param {string|null} options.hair Strand (hair) color, or null to leave it out.
 * @param {string|null} options.ribbon Ribbon/highlight color, or null to leave it out.
 * @param {number} [options.scale] Scale of the mark around the canvas center.
 * @returns {string} SVG markup, 1024×1024.
 */
export function markSvg({ background, book, hair, ribbon, scale = 1 }) {
    const { whole, hair: hairPath, ribbon: ribbonPath } = strandShapes();
    const knockout = `stroke="#000" stroke-width="${GAP * 2}" stroke-linejoin="round"`;
    const parts = [];
    if (book) {
        parts.push(
            `<g mask="url(#no-strand)" fill="${book}">`,
            `<rect x="${COVER.x}" y="${COVER.y}" width="${COVER.width}" height="${COVER.height}" rx="${COVER.radius}" mask="url(#no-pages)"/>`,
            PAGES,
            `</g>`,
        );
    }
    if (hair) parts.push(`<path d="${hairPath}" fill="${hair}"/>`);
    if (ribbon) parts.push(`<path d="${ribbonPath}" fill="${ribbon}"/>`);

    const t = (512 * (1 - scale)).toFixed(2);
    return [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">`,
        `<defs>`,
        `<mask id="no-strand" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">`,
        `<rect width="1024" height="1024" fill="#fff"/>`,
        `<path d="${whole}" fill="#000" ${knockout}/>`,
        `</mask>`,
        `<mask id="no-pages" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">`,
        `<rect width="1024" height="1024" fill="#fff"/>`,
        `<g fill="#000" ${knockout}>${PAGES}</g>`,
        `</mask>`,
        `</defs>`,
        background ? `<rect width="1024" height="1024" fill="${background}"/>` : "",
        `<g transform="translate(${t} ${t}) scale(${scale})">`,
        ...parts,
        `</g>`,
        `</svg>`,
    ].join("\n");
}

// ---------------------------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------------------------

const { blush, cocoa, rose, darkBackground } = PALETTE;

/** Every file this script writes, relative to assets/. */
const OUTPUTS = {
    // Sources and previews
    "brand/mark.svg": { background: null, book: cocoa, hair: cocoa, ribbon: rose },
    "brand/icon-light.svg": { background: blush, book: cocoa, hair: cocoa, ribbon: rose },
    "brand/icon-dark.svg": { background: darkBackground, book: blush, hair: rose, ribbon: blush },
    // Approximation of the tinted appearance: iOS turns each layer into a shade of the tint.
    "brand/icon-tinted.svg": { background: "#1C1C1E", book: "#E5E5EA", hair: "#E5E5EA", ribbon: "#8E8E93" },
    // Icon Composer layers, recolored per appearance in AppIcon.icon/icon.json
    "AppIcon.icon/Assets/book.png": { background: null, book: cocoa, hair: null, ribbon: null },
    "AppIcon.icon/Assets/hair.png": { background: null, book: null, hair: cocoa, ribbon: null },
    "AppIcon.icon/Assets/ribbon.png": { background: null, book: null, hair: null, ribbon: rose },
    // App assets
    "icon.png": { background: blush, book: cocoa, hair: cocoa, ribbon: rose },
    "splash-icon.png": { background: null, book: cocoa, hair: cocoa, ribbon: rose },
    "splash-icon-dark.png": { background: null, book: blush, hair: rose, ribbon: blush },
    // Android adaptive icons keep their content inside the central 66% safe zone.
    "adaptive-icon.png": { background: null, book: cocoa, hair: cocoa, ribbon: rose, scale: 0.72 },
    "favicon.png": { background: blush, book: cocoa, hair: cocoa, ribbon: rose, size: 48 },
};

function render(svgFile, pngFile, size) {
    // Chrome screenshots the page at the window size; a transparent default background keeps
    // the alpha channel for layers without a background.
    const html = join(dirname(svgFile), ".render.html");
    writeFileSync(
        html,
        `<html><body style="margin:0"><img src="${svgFile}" width="${size}" height="${size}" style="display:block"></body></html>`,
    );
    execFileSync(CHROME, [
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--default-background-color=00000000",
        `--window-size=${size},${size}`,
        `--screenshot=${pngFile}`,
        `file://${html}`,
    ], { stdio: "ignore" });
    execFileSync("rm", [html]);
}

const svgOnly = process.argv.includes("--svg-only");
const tmp = join(HERE, ".build");
mkdirSync(tmp, { recursive: true });
for (const [file, { size = 1024, ...options }] of Object.entries(OUTPUTS)) {
    const target = join(ASSETS, file);
    mkdirSync(dirname(target), { recursive: true });
    const svg = markSvg(options);
    if (file.endsWith(".svg")) {
        writeFileSync(target, svg + "\n");
    } else if (!svgOnly) {
        const svgFile = join(tmp, file.replaceAll("/", "_") + ".svg");
        writeFileSync(svgFile, svg);
        render(svgFile, target, size);
    }
    console.log(file);
}
execFileSync("rm", ["-rf", tmp]);
