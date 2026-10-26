import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import type { EventDraft, SelectedPhoto } from '../types/events.types';

const DRAFT_FILE_NAME = 'event_draft.json';
const DRAFT_PHOTOS_DIR = `${FileSystem.documentDirectory || ''}event_draft_photos/`;

let inMemoryDraft: EventDraft | null = null;

export const draftService = {
  /**
   * Taslak Dizinlerini Başlat
   */
  async ensureDirectoryExists(): Promise<void> {
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) return;
    try {
      const dirInfo = await FileSystem.getInfoAsync(DRAFT_PHOTOS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DRAFT_PHOTOS_DIR, { intermediates: true });
      }
    } catch (err) {
      console.warn('[DraftService] Dizin oluşturulurken hata:', err);
    }
  },

  /**
   * Geçici Fotoğraf URI'sini Yönetilen Kalıcı Uygulama Dizinine Kopyala
   * Uygulama yeniden başlatıldığında işletim sisteminin geçici önbelleği temizlemesini önler.
   */
  async persistDraftPhoto(photo: SelectedPhoto): Promise<SelectedPhoto> {
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
      return photo;
    }

    try {
      await this.ensureDirectoryExists();
      const ext = photo.fileName.split('.').pop() || 'jpg';
      const managedPath = `${DRAFT_PHOTOS_DIR}${photo.id}.${ext}`;

      // Eğer zaten yönetilen dizinde değilse kopyala
      if (photo.uri !== managedPath) {
        await FileSystem.copyAsync({
          from: photo.uri,
          to: managedPath,
        });
      }

      return {
        ...photo,
        uri: managedPath,
      };
    } catch (err) {
      console.warn('[DraftService] Fotoğraf kalıcı dizine kopyalanamadı, orijinal URI korunuyor:', err);
      return photo;
    }
  },

  /**
   * Taslağı Cihaza Kaydet
   */
  async saveDraft(draft: EventDraft): Promise<void> {
    inMemoryDraft = draft;
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sehir_nabiz_event_draft', JSON.stringify(draft));
        }
      } catch {}
      return;
    }

    try {
      await this.ensureDirectoryExists();
      const draftPath = `${FileSystem.documentDirectory}${DRAFT_FILE_NAME}`;
      await FileSystem.writeAsStringAsync(draftPath, JSON.stringify(draft), {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (err) {
      console.warn('[DraftService] Taslak diske yazılamadı:', err);
    }
  },

  /**
   * Kayıtlı Taslağı Oku
   */
  async loadDraft(): Promise<EventDraft | null> {
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
      if (inMemoryDraft) return inMemoryDraft;
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem('sehir_nabiz_event_draft');
          if (raw) return JSON.parse(raw);
        }
      } catch {}
      return null;
    }

    try {
      const draftPath = `${FileSystem.documentDirectory}${DRAFT_FILE_NAME}`;
      const fileInfo = await FileSystem.getInfoAsync(draftPath);
      if (!fileInfo.exists) {
        return null;
      }

      const content = await FileSystem.readAsStringAsync(draftPath, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const parsed: EventDraft = JSON.parse(content);

      // Fotoğrafların diskte hala mevcut olduğunu kontrol et
      if (parsed.photos && parsed.photos.length > 0) {
        const validatedPhotos: SelectedPhoto[] = [];
        for (const p of parsed.photos) {
          const photoInfo = await FileSystem.getInfoAsync(p.uri);
          if (photoInfo.exists) {
            validatedPhotos.push(p);
          }
        }
        parsed.photos = validatedPhotos;
      }

      inMemoryDraft = parsed;
      return parsed;
    } catch (err) {
      console.warn('[DraftService] Taslak yüklenirken hata:', err);
      return null;
    }
  },

  /**
   * Taslağı ve Yönetilen Geçici Fotoğrafları Temizle
   */
  async clearDraft(): Promise<void> {
    inMemoryDraft = null;
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('sehir_nabiz_event_draft');
        }
      } catch {}
      return;
    }

    try {
      const draftPath = `${FileSystem.documentDirectory}${DRAFT_FILE_NAME}`;
      const fileInfo = await FileSystem.getInfoAsync(draftPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(draftPath, { idempotent: true });
      }

      // Fotoğraflar klasörünü temizle
      const dirInfo = await FileSystem.getInfoAsync(DRAFT_PHOTOS_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(DRAFT_PHOTOS_DIR, { idempotent: true });
      }
    } catch (err) {
      console.warn('[DraftService] Taslak temizlenirken hata:', err);
    }
  },
};
