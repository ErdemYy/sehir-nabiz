export interface IStorageService {
  getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  getPresignedDownloadUrl(
    key: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  getObject(key: string): Promise<Buffer>;

  putObject(key: string, buffer: Buffer, mimeType: string): Promise<void>;

  headObject(
    key: string,
  ): Promise<{ contentLength: number; contentType: string } | null>;

  deleteObject(key: string): Promise<void>;

  generateStorageKey(eventId: string, mediaId: string, extension: string): string;

  getPublicUrl(key: string): string;
}
