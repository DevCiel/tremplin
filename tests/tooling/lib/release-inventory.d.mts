export const requiredReleaseAssets: readonly string[];
export const requiredReleaseIntegrityAssets: readonly string[];
export function validateCoreReleaseInventory(
  manifest: {files: string[]},
  integrity: {algorithm: string; assets: Record<string,{integrity:string;bytes:number}>},
  exists: (file: string) => boolean
): {requiredAssets:number;requiredIntegrityAssets:number};
