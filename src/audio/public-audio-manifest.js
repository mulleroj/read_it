/**
 * M8.2 / M8.4 – Public audio manifest helpers.
 * Only owner-approved entries are eligible for public release/build.
 */
import manifest from '../../content/meta/audio-manifest.json' with { type: 'json' };

/** @param {typeof manifest.entries[number]} entry */
export function isPublicReleaseApprovedEntry(entry) {
  return entry.publicReleaseApproved === true;
}

export const publicAudioManifestEntries = Object.freeze(manifest.entries);
export const approvedPublicManifestEntries = Object.freeze(manifest.entries.filter(isPublicReleaseApprovedEntry));
export const pendingPublicManifestEntries = Object.freeze(manifest.entries.filter((e) => !isPublicReleaseApprovedEntry(e)));

/** @type {ReadonlySet<string>} */
export const APPROVED_PUBLIC_AUDIO_PATHS = Object.freeze(
  new Set(approvedPublicManifestEntries.map((entry) => entry.publicFile.replace(/\\/g, '/')))
);

/** @type {ReadonlyMap<string, { spelling: string, publicFile: string, sha256: string }>} */
export const APPROVED_PUBLIC_AUDIO_BY_WORD_ID = Object.freeze(
  new Map(
    approvedPublicManifestEntries.map((entry) => [
      entry.wordId,
      {
        spelling: entry.spelling,
        publicFile: entry.publicFile,
        sha256: entry.sha256,
      },
    ])
  )
);

/** @type {ReadonlyMap<string, typeof manifest.entries[number]>} */
export const MANIFEST_AUDIO_BY_WORD_ID = Object.freeze(
  new Map(manifest.entries.map((entry) => [entry.wordId, entry]))
);

/** Gate flag – runtime probes public MP3 for approved entries only. */
export const PUBLIC_AUDIO_RELEASE_ENABLED = manifest.publicAudioEnabled === true;

/** Extended 26-file release is enabled when manifest marks all entries public-approved. */
export const EXTENDED_PUBLIC_AUDIO_RELEASE_ENABLED =
  manifest.extendedReleaseEnabled === true && manifest.entryCount === approvedPublicManifestEntries.length;

/**
 * @param {string} wordId
 * @param {string} [root]
 */
export function getPublicAudioUrl(wordId, root = '') {
  const entry = APPROVED_PUBLIC_AUDIO_BY_WORD_ID.get(wordId);
  if (!entry) return null;
  const normalizedRoot = root.replace(/\/$/, '');
  return normalizedRoot ? `${normalizedRoot}/${entry.publicFile}` : entry.publicFile;
}

/** @param {string} relativePosix */
export function isApprovedPublicAudioPath(relativePosix) {
  return APPROVED_PUBLIC_AUDIO_PATHS.has(relativePosix.replace(/\\/g, '/'));
}

export { manifest as publicAudioManifest };
