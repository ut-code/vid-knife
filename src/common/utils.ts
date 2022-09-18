export function formatMs(ms: number) {
  let result = "";

  const hours = Math.floor(ms / 3600_000);
  result += hours ? `${hours}:` : "";

  const minutes = Math.floor((ms / 60_000) % 60);
  result += `${minutes.toString().padStart(2, "0")}:`;

  const seconds = Math.floor((ms / 1000) % 60);
  result += `${seconds.toString().padStart(2, "0")}.`;

  const milliseconds = ms % 1000;
  result += Math.floor(milliseconds / 10)
    .toString()
    .padStart(2, "0");

  return result;
}

const createObjectUrlFinalizationRegistry = new FinalizationRegistry<string>(
  (url) => URL.revokeObjectURL(url)
);

export function safeCreateObjectUrl(object: Blob | MediaSource) {
  const url = URL.createObjectURL(object);
  createObjectUrlFinalizationRegistry.register(object, url);
  return url;
}
