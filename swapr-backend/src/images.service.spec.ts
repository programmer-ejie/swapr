import { ServiceUnavailableException } from '@nestjs/common';
import { hostImage } from '../scripts/imgbb.mjs';
import { DatabaseService } from './database/database.service.js';
import { ImagesService } from './images.service.js';

vi.mock('../scripts/imgbb.mjs', () => ({ hostImage: vi.fn() }));

describe('ImagesService', () => {
  const pool = {} as DatabaseService['pool'];
  const db = { pool, query: vi.fn() } as unknown as DatabaseService;
  const service = new ImagesService(db);
  beforeEach(() => vi.clearAllMocks());
  it('preserves existing hosted URLs without uploading again', async () => {
    const url = 'https://i.ibb.co/example/product.webp';
    expect(await service.host(url, 'listing')).toBe(url);
    expect(hostImage).not.toHaveBeenCalled();
  });
  it('uploads decoded image bytes and returns only the public URL', async () => {
    vi.mocked(hostImage).mockResolvedValue(
      'https://i.ibb.co/example/photo.png',
    );
    expect(
      await service.host('data:image/png;base64,aW1hZ2U=', 'listing'),
    ).toBe('https://i.ibb.co/example/photo.png');
    expect(hostImage).toHaveBeenCalledWith(
      pool,
      Buffer.from('image'),
      'listing',
    );
  });
  it('hides provider details when an upload fails', async () => {
    vi.mocked(hostImage).mockRejectedValue(
      new Error('sensitive-provider-details'),
    );
    await expect(
      service.host('data:image/png;base64,aW1hZ2U=', 'listing'),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
