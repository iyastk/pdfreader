'use server';

import { revalidatePath } from 'next/cache';

/** Call after adding/deleting a document to instantly refresh all affected pages */
export async function revalidateDocumentPages(categoryId?: string) {
  revalidatePath('/');
  revalidatePath('/portal');
  revalidatePath('/admin');
  revalidatePath('/admin/documents');
  if (categoryId) {
    revalidatePath(`/category/${categoryId}`);
  }
}

/** Call after adding/deleting a category */
export async function revalidateCategoryPages() {
  revalidatePath('/');
  revalidatePath('/portal');
  revalidatePath('/admin');
  revalidatePath('/admin/categories');
}

export interface ScrapedLinkItem {
  id: string;
  title: string;
  url: string;
  type: 'drive_link' | 'firebase_upload';
  suggestedCategory: string;
}

const KNOWN_SUBJECTS = [
  'Malayalam',
  'English',
  'Hindi',
  'Physics',
  'Chemistry',
  'Biology',
  'Maths',
  'social science',
  'Arabic',
  'Urdu',
  'Sanskrit',
  'History',
  'Geography',
];

function detectCategory(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes('MATH')) return 'Maths';
  if (upper.includes('PHYSIC')) return 'Physics';
  if (upper.includes('CHEM')) return 'Chemistry';
  if (upper.includes('BIOLOG')) return 'Biology';
  if (upper.includes('SOCIAL') || upper.includes('HIST') || upper.includes('GEOG')) return 'social science';
  if (upper.includes('HINDI')) return 'Hindi';
  if (upper.includes('ENGL')) return 'English';
  if (upper.includes('MALAYALAM') || upper.includes('PADAVALI') || upper.includes('ADISTHANA') || upper.includes('KERALA')) return 'Malayalam';
  if (upper.includes('ARABIC')) return 'Arabic';
  if (upper.includes('URDU')) return 'Urdu';
  if (upper.includes('SANSKRIT')) return 'Sanskrit';
  return '';
}

function cleanHtmlText(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Scrapes any website URL or raw HTML/text to find Google Drive and PDF links,
 * automatically extracting clean titles and detecting subjects.
 */
export async function scrapeWebpageForLinks(
  urlOrText: string,
  isRawContent: boolean = false
): Promise<{ success: boolean; items: ScrapedLinkItem[]; error?: string; pageTitle?: string }> {
  try {
    let htmlContent = '';
    let pageTitle = '';

    if (isRawContent || !urlOrText.trim().startsWith('http')) {
      htmlContent = urlOrText;
    } else {
      const targetUrl = urlOrText.trim();
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        return {
          success: false,
          items: [],
          error: `Failed to fetch webpage: HTTP ${res.status} ${res.statusText}`,
        };
      }

      htmlContent = await res.text();
      const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch) {
        pageTitle = cleanHtmlText(titleMatch[1]);
      }
    }

    const items: ScrapedLinkItem[] = [];
    const seenUrls = new Set<string>();

    let counter = 1;

    // 1. Table-based extraction (e.g. HSSLive, government educational portals)
    const tableMatches = htmlContent.match(/<table[\s\S]*?<\/table>/gi) || [];
    for (const table of tableMatches) {
      const rowMatches = table.match(/<tr[\s\S]*?<\/tr>/gi) || [];
      let headers: string[] = [];

      for (let rIdx = 0; rIdx < rowMatches.length; rIdx++) {
        const row = rowMatches[rIdx];
        const cells = row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || [];
        const cleanCells = cells.map(cleanHtmlText);

        if (rIdx === 0 && cells.length > 1) {
          headers = cleanCells;
          continue;
        }

        const rowSubject = cleanCells[0] || '';
        for (let cIdx = 1; cIdx < cells.length; cIdx++) {
          const cell = cells[cIdx];
          const colHeader = headers[cIdx] || `Part ${cIdx}`;
          const hrefMatches = [...cell.matchAll(/href=["']([^"']+)["']/gi)];

          for (const m of hrefMatches) {
            const rawHref = m[1].replace(/&amp;/g, '&');
            if (rawHref.includes('drive.google.com') || rawHref.includes('docs.google.com') || rawHref.includes('.pdf')) {
              if (!seenUrls.has(rawHref)) {
                seenUrls.add(rawHref);
                const fullTitle = `${rowSubject} - ${colHeader}`.replace(/^[\s-]+|[\s-]+$/g, '');
                items.push({
                  id: `scraped_${counter++}`,
                  title: fullTitle || `Document ${counter}`,
                  url: rawHref,
                  type: rawHref.includes('drive.google.com') || rawHref.includes('docs.google.com') ? 'drive_link' : 'firebase_upload',
                  suggestedCategory: detectCategory(rowSubject) || detectCategory(colHeader),
                });
              }
            }
          }
        }
      }
    }

    // 2. Section and Paragraph-based extraction (e.g. Aplusblog, Blogger sites)
    // We scan <a> tags and check their anchor text or preceding headings/text
    const aTagRegex = /<a\b[^>]*href=["'](https?:\/\/(?:drive\.google\.com|docs\.google\.com)[^"']+|https?:\/\/[^"']+\.pdf)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;

    // Track active subject heading when parsing sections
    const subjectRegex = /\b(MATHEMATICS|MATHS|BIOLOGY|SOCIAL SCIENCE|CHEMISTRY|PHYSICS|HINDI|ENGLISH|SANSKRIT|URDU|ARABIC|MALAYALAM|KERALA PADAVALI|ADISTHANA PADAVALI)\b/i;

    while ((match = aTagRegex.exec(htmlContent)) !== null) {
      const rawHref = match[1].replace(/&amp;/g, '&');
      if (seenUrls.has(rawHref)) continue;
      seenUrls.add(rawHref);

      const linkText = cleanHtmlText(match[2]);

      // Look back 250 characters for subject or section heading
      const lookbackStart = Math.max(0, match.index - 250);
      const lookback = htmlContent.substring(lookbackStart, match.index);
      const cleanLookback = cleanHtmlText(lookback);

      let detectedSubj = '';
      const subjMatch = cleanLookback.match(subjectRegex);
      if (subjMatch) {
        detectedSubj = subjMatch[1];
      }

      let docType = 'Question Paper';
      if (linkText.toLowerCase().includes('answer') || cleanLookback.toLowerCase().includes('answer')) {
        docType = 'Answer Key';
      }

      let medium = '';
      if (linkText.includes('[EM]') || linkText.includes('(EM)') || cleanLookback.includes('[EM]')) {
        medium = ' (English Medium)';
      } else if (linkText.includes('[MM]') || linkText.includes('(MM)') || cleanLookback.includes('[MM]')) {
        medium = ' (Malayalam Medium)';
      }

      let itemTitle = '';
      if (detectedSubj) {
        itemTitle = `${detectedSubj}${medium} - ${docType}`;
      } else if (linkText && linkText !== 'Download' && linkText !== 'Click Here' && linkText.length > 3) {
        itemTitle = linkText;
      } else {
        itemTitle = cleanLookback.slice(-50) || `Study Document ${counter}`;
      }

      items.push({
        id: `scraped_${counter++}`,
        title: itemTitle.replace(/\s+/g, ' ').trim(),
        url: rawHref,
        type: rawHref.includes('drive.google.com') || rawHref.includes('docs.google.com') ? 'drive_link' : 'firebase_upload',
        suggestedCategory: detectCategory(itemTitle) || detectCategory(detectedSubj),
      });
    }

    // 3. Fallback: catch any raw Google Drive links pasted in plain text
    const plainDriveRegex = /https?:\/\/(?:drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+|drive\.google\.com\/open\?[^\s"'>]+|drive\.google\.com\/uc\?[^\s"'>]+)/gi;
    const rawMatches = htmlContent.match(plainDriveRegex) || [];
    for (const rawUrl of rawMatches) {
      const cleanUrl = rawUrl.replace(/&amp;/g, '&');
      if (!seenUrls.has(cleanUrl)) {
        seenUrls.add(cleanUrl);
        items.push({
          id: `scraped_${counter++}`,
          title: `Google Drive Document ${counter}`,
          url: cleanUrl,
          type: 'drive_link',
          suggestedCategory: '',
        });
      }
    }

    return {
      success: true,
      items,
      pageTitle,
    };
  } catch (err) {
    return {
      success: false,
      items: [],
      error: err instanceof Error ? err.message : 'Unknown extraction error occurred',
    };
  }
}