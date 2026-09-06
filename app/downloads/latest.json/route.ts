import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const OWNER = "dromocop-collab";
const REPO = "dromocob";

type GitHubAsset = {
    id: number;
    name: string;
    browser_download_url: string;
};

type GitHubRelease = {
    id: number;
    tag_name: string;
    draft: boolean;
    prerelease: boolean;
    assets: GitHubAsset[];
};

function githubHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Dromocob-Ultra-Updater"
    };

    const token = process.env.GITHUB_RELEASE_TOKEN?.trim();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

function normalizeURL(value: unknown): unknown {
    if (typeof value !== "string") {
        return value;
    }

    const trimmed = value.trim();

    // [https://example.com/file.zip](https://example.com/file.zip)
    const markdownMatch = trimmed.match(
        /^\[(https?:\/\/[^\]]+)\]\((https?:\/\/[^)]+)\)$/
    );

    if (markdownMatch) {
        return markdownMatch[2];
    }

    return trimmed;
}

function normalizeManifest(
    manifest: Record<string, unknown>
): Record<string, unknown> {

    const normalized = {
        ...manifest
    };

    const urlFields = [
        "fullPackageURL",
        "updatePackageURL",
        "zxpURL",
        "releasePageURL"
    ];

    for (const key of urlFields) {
        if (key in normalized) {
            normalized[key] = normalizeURL(normalized[key]);
        }
    }

    return normalized;
}

export async function GET() {

    try {

        /*
         * Latest GitHub Release
         */
        const releaseResponse = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`,
            {
                method: "GET",
                headers: githubHeaders(),
                cache: "no-store"
            }
        );

        if (!releaseResponse.ok) {

            const body = await releaseResponse.text();

            console.error(
                "[Dromocob Update] GitHub release error:",
                releaseResponse.status,
                body
            );

            return NextResponse.json(
                {
                    error: "release_lookup_failed",
                    message: "En güncel Dromocob Ultra release bulunamadı."
                },
                {
                    status: 502,
                    headers: {
                        "Cache-Control": "no-store"
                    }
                }
            );
        }

        const release =
            (await releaseResponse.json()) as GitHubRelease;

        /*
         * latest.json asset bul
         */
        const latestAsset =
            release.assets.find(
                asset =>
                    asset.name.toLowerCase() === "latest.json"
            );

        if (!latestAsset) {

            console.error(
                `[Dromocob Update] latest.json asset missing in ${release.tag_name}`
            );

            return NextResponse.json(
                {
                    error: "manifest_missing",
                    release: release.tag_name,
                    message:
                        "GitHub Release içerisinde latest.json bulunamadı."
                },
                {
                    status: 404,
                    headers: {
                        "Cache-Control": "no-store"
                    }
                }
            );
        }

        /*
         * GitHub asset içeriğini çek
         *
         * Public repo ise browser_download_url yeterli.
         * Private repo durumunda aşağıdaki token header'ı da gönderiliyor.
         */
        const manifestResponse = await fetch(
            latestAsset.browser_download_url,
            {
                method: "GET",
                headers: githubHeaders(),
                redirect: "follow",
                cache: "no-store"
            }
        );

        if (!manifestResponse.ok) {

            console.error(
                "[Dromocob Update] manifest download failed:",
                manifestResponse.status
            );

            return NextResponse.json(
                {
                    error: "manifest_download_failed",
                    release: release.tag_name
                },
                {
                    status: 502,
                    headers: {
                        "Cache-Control": "no-store"
                    }
                }
            );
        }

        const rawManifest =
            await manifestResponse.json();

        if (
            !rawManifest ||
            typeof rawManifest !== "object" ||
            Array.isArray(rawManifest)
        ) {
            throw new Error(
                "latest.json geçerli bir JSON object değil."
            );
        }

        const manifest =
            normalizeManifest(
                rawManifest as Record<string, unknown>
            );

        /*
         * Temel manifest kontrolü
         */
        if (!manifest.version) {
            throw new Error(
                "latest.json içerisinde version bulunamadı."
            );
        }

        return NextResponse.json(
            manifest,
            {
                status: 200,
                headers: {
                    "Cache-Control":
                        "no-store, no-cache, must-revalidate, proxy-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",

                    /*
                     * Panel file:// origin'den çalıştığı için
                     * CORS özellikle önemli.
                     */
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            }
        );

    } catch (error) {

        console.error(
            "[Dromocob Update] latest.json proxy error:",
            error
        );

        return NextResponse.json(
            {
                error: "update_manifest_error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Bilinmeyen update manifest hatası."
            },
            {
                status: 500,
                headers: {
                    "Cache-Control": "no-store",
                    "Access-Control-Allow-Origin": "*"
                }
            }
        );
    }
}

export async function OPTIONS() {

    return new NextResponse(
        null,
        {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400"
            }
        }
    );
}