const KEY = "savedJobIds";

function readIds(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIds(ids: number[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function getSavedJobIds(): number[] {
  return readIds();
}

export function isJobSaved(jobId: number): boolean {
  return readIds().includes(jobId);
}

export function toggleSavedJob(jobId: number): boolean {
  const ids = readIds();
  const idx = ids.indexOf(jobId);
  if (idx === -1) {
    ids.push(jobId);
    writeIds(ids);
    return true;
  }
  ids.splice(idx, 1);
  writeIds(ids);
  return false;
}
