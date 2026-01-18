/**
 * Image Utility Functions
 * Handles conversion of Google Drive URLs to embeddable formats
 */

/**
 * Converts Google Drive URLs to embeddable thumbnail URLs.
 * This is needed because Google Drive view/share links don't work
 * in img tags or CSS background properties due to CORS restrictions.
 * 
 * @param url - The URL to convert (can be Google Drive or regular URL)
 * @returns The converted URL or original URL if not a Google Drive link
 */
export const getEmbedUrl = (url: string | undefined | null): string => {
    if (!url) return '';

    // Handle Google Drive links
    if (url.includes('drive.google.com')) {
        // Extract ID from /file/d/ID/view or id=ID format
        const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            // Use thumbnail endpoint which bypasses CORS and auth issues
            // sz=s2000 requests a large version (up to 2000px)
            return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=s2000`;
        }
    }

    return url;
};

/**
 * Check if a URL is a Google Drive link
 */
export const isGoogleDriveUrl = (url: string | undefined | null): boolean => {
    return !!url && url.includes('drive.google.com');
};
