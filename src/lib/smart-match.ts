import type { PostRow } from "./domain";

export interface SmartMatchResult {
  post: PostRow;
  score: number; // 0 - 100
  reasons: string[];
  distanceKm?: number;
}

// Calculate distance in kilometers using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0E00-\u0E7F]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

export function findSmartMatches(
  current: PostRow,
  candidates: PostRow[]
): SmartMatchResult[] {
  const currentKeywords = new Set([
    ...extractKeywords(current.title),
    ...extractKeywords(current.description || ""),
    ...extractKeywords(current.location_text || ""),
  ]);

  const results: SmartMatchResult[] = [];

  for (const candidate of candidates) {
    if (candidate.id === current.id) continue;

    let score = 0;
    const reasons: string[] = [];

    // 1. Inverted Type Match (lost <-> found is primary goal)
    const isOppositeType = candidate.type !== current.type;
    if (isOppositeType) {
      score += 35;
      reasons.push(
        current.type === "lost" ? "ประกาศพบของที่อาจตรงกัน" : "ประกาศของหายที่ตามหา"
      );
    } else {
      // Still can match similar cases
      score += 10;
    }

    // 2. Category Match
    if (candidate.category === current.category) {
      score += 30;
      reasons.push("หมวดหมู่เดียวกัน");
    }

    // 3. Keyword / Content overlap
    const candidateKeywords = extractKeywords(
      `${candidate.title} ${candidate.description || ""} ${candidate.location_text || ""}`
    );
    let matchedKeywords = 0;
    for (const kw of candidateKeywords) {
      if (currentKeywords.has(kw)) {
        matchedKeywords++;
      }
    }

    if (matchedKeywords > 0) {
      const keywordScore = Math.min(25, matchedKeywords * 6);
      score += keywordScore;
      reasons.push(`คีย์เวิร์ดตรงกัน ${matchedKeywords} จุด`);
    }

    // 4. Proximity / Location distance
    let distanceKm: number | undefined;
    if (
      typeof current.latitude === "number" &&
      typeof current.longitude === "number" &&
      typeof candidate.latitude === "number" &&
      typeof candidate.longitude === "number"
    ) {
      distanceKm = calculateDistance(
        current.latitude,
        current.longitude,
        candidate.latitude,
        candidate.longitude
      );

      if (distanceKm <= 1.0) {
        score += 20;
        reasons.push(`พิกัดใกล้กันมาก (~${Math.round(distanceKm * 1000)} ม.)`);
      } else if (distanceKm <= 5.0) {
        score += 15;
        reasons.push(`พิกัดใกล้เคียง (~${distanceKm} กม.)`);
      } else if (distanceKm <= 20.0) {
        score += 8;
        reasons.push(`ละแวกเดียวกัน (~${distanceKm} กม.)`);
      }
    }

    // Normalized score cap at 98% (leave room for real world confirmation)
    const finalScore = Math.min(98, Math.max(45, Math.round(score)));

    // Only include if score >= 60%
    if (finalScore >= 60 && reasons.length >= 2) {
      results.push({
        post: candidate,
        score: finalScore,
        reasons,
        distanceKm,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 3);
}
