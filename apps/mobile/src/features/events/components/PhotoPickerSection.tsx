import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import { AppText } from '../../../components/ui';
import { useAppTheme } from '../../../theme';
import type { SelectedPhoto } from '../types/events.types';
import { draftService } from '../services/draftService';

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export interface PhotoPickerSectionProps {
  photos: SelectedPhoto[];
  onChangePhotos: (photos: SelectedPhoto[]) => void;
  onRetryPhoto?: (photo: SelectedPhoto) => void;
  disabled?: boolean;
}

export function PhotoPickerSection({
  photos,
  onChangePhotos,
  onRetryPhoto,
  disabled = false,
}: PhotoPickerSectionProps): React.ReactElement {
  const { theme, spacing, radii } = useAppTheme();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateAndAddAsset = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      setErrorMessage(null);

      if (photos.length >= MAX_PHOTOS) {
        setErrorMessage(`En fazla ${MAX_PHOTOS} adet fotoğraf ekleyebilirsiniz.`);
        return;
      }

      // Dosya boyutu kontrolü
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
        setErrorMessage('Fotoğraf boyutu 8 MB sınırını aşamaz.');
        return;
      }

      // MIME türü belirleme
      let mimeType: SelectedPhoto['mimeType'] = 'image/jpeg';
      const ext = (asset.fileName || asset.uri).split('.').pop()?.toLowerCase();

      if (asset.mimeType) {
        if (asset.mimeType.includes('png')) mimeType = 'image/png';
        else if (asset.mimeType.includes('webp')) mimeType = 'image/webp';
        else if (asset.mimeType.includes('jpeg') || asset.mimeType.includes('jpg')) mimeType = 'image/jpeg';
      } else if (ext === 'png') {
        mimeType = 'image/png';
      } else if (ext === 'webp') {
        mimeType = 'image/webp';
      }

      // HEIC veya desteklenmeyen format kontrolü
      if (ext === 'heic' || ext === 'heif') {
        setErrorMessage('HEIC formatı doğrudan desteklenmemektedir. Lütfen JPEG veya PNG formatında yükleyiniz.');
        return;
      }

      const clientUuid = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fileName = asset.fileName || `${clientUuid}.${ext || 'jpg'}`;
      const fileSize = asset.fileSize || 1024 * 200; // Varsayılan boyut tahmini

      const rawPhoto: SelectedPhoto = {
        id: clientUuid,
        uri: asset.uri,
        fileName,
        fileSize,
        mimeType,
        uploadStatus: 'idle',
      };

      // Kalıcı taslak dizinine kopyala
      const managedPhoto = await draftService.persistDraftPhoto(rawPhoto);
      onChangePhotos([...photos, managedPhoto]);
    },
    [photos, onChangePhotos]
  );

  const handlePickFromGallery = useCallback(async () => {
    if (disabled || photos.length >= MAX_PHOTOS) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Galeri İzni Gerekli',
          'Fotoğraf seçebilmek için lütfen uygulama ayarlarından galeri izni veriniz.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await validateAndAddAsset(result.assets[0]);
      }
    } catch (err: any) {
      setErrorMessage('Fotoğraf seçilirken bir sorun oluştu.');
    }
  }, [disabled, photos.length, validateAndAddAsset]);

  const handleTakePhotoWithCamera = useCallback(async () => {
    if (disabled || photos.length >= MAX_PHOTOS) return;
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Kamera İzni Gerekli',
          'Olayı fotoğraflayabilmek için lütfen uygulama ayarlarından kamera izni veriniz.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await validateAndAddAsset(result.assets[0]);
      }
    } catch (err: any) {
      setErrorMessage('Kamera başlatılırken bir sorun oluştu.');
    }
  }, [disabled, photos.length, validateAndAddAsset]);

  const handleRemovePhoto = useCallback(
    (photoId: string) => {
      onChangePhotos(photos.filter((p) => p.id !== photoId));
    },
    [photos, onChangePhotos]
  );

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Başlık ve Kalan Hak */}
      <View style={styles.sectionHeaderRow}>
        <AppText variant="bodyS" weight="semibold">
          Fotoğraf Ekle
        </AppText>
        <AppText variant="caption" color={theme.textSecondary}>
          {photos.length} / {MAX_PHOTOS}
        </AppText>
      </View>

      {/* Hata Mesajı */}
      {errorMessage ? (
        <View
          style={[
            styles.errorRow,
            {
              backgroundColor: theme.errorLight,
              borderColor: theme.error,
              borderRadius: radii.medium,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <AlertCircle size={14} color={theme.error} />
          <AppText variant="caption" color={theme.error} style={{ flex: 1 }}>
            {errorMessage}
          </AppText>
        </View>
      ) : null}

      {/* Fotoğraf Listesi ve Ekleme Butonları */}
      <View style={styles.photosGrid}>
        {photos.map((photo) => (
          <View
            key={photo.id}
            style={[
              styles.photoCard,
              {
                borderRadius: radii.medium,
                borderColor: theme.border,
                backgroundColor: theme.surfaceElevated,
              },
            ]}
          >
            <Image source={{ uri: photo.uri }} style={styles.thumbnail} />

            {/* Kaldırma Butonu */}
            {!disabled ? (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(photo.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Fotoğrafı Kaldır"
              >
                <X size={12} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}

            {/* Yükleme Durum Rozeti */}
            {photo.uploadStatus === 'uploading' ? (
              <View style={styles.statusOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : photo.uploadStatus === 'completed' ? (
              <View style={[styles.statusBadgeCorner, { backgroundColor: '#10B981' }]}>
                <CheckCircle2 size={12} color="#FFFFFF" />
              </View>
            ) : photo.uploadStatus === 'failed' ? (
              <TouchableOpacity
                style={[styles.statusBadgeCorner, { backgroundColor: '#EF4444' }]}
                onPress={() => onRetryPhoto?.(photo)}
                accessibilityLabel="Fotoğrafı Tekrar Yükle"
              >
                <RefreshCw size={12} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}

        {/* Yeni Fotoğraf Ekleme Kutusu */}
        {photos.length < MAX_PHOTOS && !disabled ? (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.addSlot,
                {
                  borderRadius: radii.medium,
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceElevated,
                },
              ]}
              onPress={handleTakePhotoWithCamera}
              accessibilityLabel="Kamera ile Fotoğraf Çek"
            >
              <Camera size={20} color={theme.primary} />
              <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 2 }}>
                Kamera
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addSlot,
                {
                  borderRadius: radii.medium,
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceElevated,
                },
              ]}
              onPress={handlePickFromGallery}
              accessibilityLabel="Galeriden Fotoğraf Seç"
            >
              <ImageIcon size={20} color={theme.primary} />
              <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 2 }}>
                Galeri
              </AppText>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: spacing.xs }}>
        Desteklenen: JPG, PNG, WebP (Maks. 8 MB). EXIF ve GPS verileri sunucuda temizlenir.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderWidth: 1,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    width: 96,
    height: 96,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  statusOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeCorner: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addSlot: {
    width: 76,
    height: 96,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
