import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../entities/user.entity';
import { CategoryEntity } from '../entities/category.entity';
import { EventEntity } from '../entities/event.entity';
import {
  EventSeverity,
  EventStatus,
  UserRole,
  AccountStatus,
} from '@sehir-nabiz/shared';

export async function seedDemoEvents(dataSource: DataSource): Promise<void> {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    throw new Error('GÜVENLİK UYARISI: Demo veriler üretim (production) ortamında çalıştırılamaz!');
  }

  const userRepo = dataSource.getRepository(UserEntity);
  const categoryRepo = dataSource.getRepository(CategoryEntity);
  const eventRepo = dataSource.getRepository(EventEntity);

  // 1. Demo Yazar Kullanıcısı
  const demoEmail = 'demo.operator@sehirnabiz.local';
  let demoUser = await userRepo.findOne({ where: { email: demoEmail } });

  if (!demoUser) {
    const passwordHash = await bcrypt.hash('DemoPassword123!', 10);
    demoUser = await userRepo.save(
      userRepo.create({
        email: demoEmail,
        passwordHash,
        displayName: 'ŞehirNabız Demo Sistemi',
        role: UserRole.TRUSTED_REPORTER,
        accountStatus: AccountStatus.ACTIVE,
        reputationScore: 50,
      }),
    );
  }

  // 2. Mevcut Demo Kayıt Kontrolü (Idempotency)
  const existingDemoCount = await eventRepo.count({ where: { isDemo: true } });
  if (existingDemoCount > 0) {
    console.log(`[Seed] Demo olaylar zaten mevcut (${existingDemoCount} adet). Yeniden eklenmedi.`);
    return;
  }

  // 3. Kategorileri Getir
  const categories = await categoryRepo.find();
  const categoryMap = new Map(categories.map(c => [c.code, c]));

  // 4. Kayseri Örnek Demo Olayları
  const demoEventsData = [
    {
      categoryCode: 'TRAFFIC',
      title: '[DEMO] Sivas Caddesi Alparslan Kavşağı Yoğun Trafik',
      description: 'Sivas Caddesi üzerinde sinyalizasyon çalışması nedeniyle şehir merkezi yönünde yoğun araç kuyruğu oluşmaktadır.',
      severity: EventSeverity.MEDIUM,
      status: EventStatus.ACTIVE,
      lon: 35.5012,
      lat: 38.7245,
      addressText: 'Sivas Caddesi No: 42, Alparslan',
      city: 'Kayseri',
      district: 'Melikgazi',
      durationHours: 3,
    },
    {
      categoryCode: 'ROAD_WORK',
      title: '[DEMO] Talas Bulvarı Sağ Şerit Asfalt Yenileme',
      description: 'Talas yönü istikametinde belediye ekipleri tarafından sıcak asfalt serim çalışması yürütülmektedir. Tek şerit kontrollü verilmektedir.',
      severity: EventSeverity.LOW,
      status: EventStatus.ACTIVE,
      lon: 35.534,
      lat: 38.698,
      addressText: 'Talas Bulvarı, Erciyes Üniversitesi Karşısı',
      city: 'Kayseri',
      district: 'Talas',
      durationHours: 24,
    },
    {
      categoryCode: 'WATER_OUTAGE',
      title: '[DEMO] Kocasinan İstasyon Mahallesi Ana Boru Onarımı',
      description: 'Ana iletim hattındaki plansız arıza nedeniyle İstasyon ve Fevzi Çakmak mahallelerinde saat 21:00 e kadar su verilemeyecektir.',
      severity: EventSeverity.HIGH,
      status: EventStatus.ACTIVE,
      lon: 35.472,
      lat: 38.736,
      addressText: 'İstasyon Caddesi, Kocasinan',
      city: 'Kayseri',
      district: 'Kocasinan',
      durationHours: 8,
    },
    {
      categoryCode: 'PUBLIC_TRANSPORT',
      title: '[DEMO] Kayseray Tramvay Hattı Sefere Hazırlık Gecikmesi',
      description: 'Organize Sanayi - İldem tramvay hattında teknik arıza sebebiyle seferler 15 dakika gecikmeli olarak yapılmaktadır.',
      severity: EventSeverity.MEDIUM,
      status: EventStatus.ACTIVE,
      lon: 35.485,
      lat: 38.721,
      addressText: 'Düvenönü Tramvay Durağı',
      city: 'Kayseri',
      district: 'Melikgazi',
      durationHours: 4,
    },
    {
      categoryCode: 'EVENT',
      title: '[DEMO] Cumhuriyet Meydanı Kültür ve Kitap Festivali',
      description: 'Meydanda kurulan festival çadırları sebebiyle araç girişleri kısıtlanmıştır, yaya trafiği yoğundur.',
      severity: EventSeverity.LOW,
      status: EventStatus.ACTIVE,
      lon: 35.4826,
      lat: 38.7205,
      addressText: 'Cumhuriyet Meydanı, Melikgazi',
      city: 'Kayseri',
      district: 'Melikgazi',
      durationHours: 12,
    },
    {
      categoryCode: 'ACCIDENT',
      title: '[DEMO] Erciyes Caddesi Maddi Hasarlı Kaza',
      description: 'Erciyes Üniversitesi kavşağında iki aracın karıştığı maddi hasarlı kaza nedeniyle orta şerit trafiğe kapalıdır.',
      severity: EventSeverity.MEDIUM,
      status: EventStatus.ACTIVE,
      lon: 35.495,
      lat: 38.705,
      addressText: 'Erciyes Caddesi Köprülü Kavşak',
      city: 'Kayseri',
      district: 'Melikgazi',
      durationHours: 3,
    },
  ];

  for (const item of demoEventsData) {
    const category = categoryMap.get(item.categoryCode);
    if (!category) continue;

    const expiresAt = new Date(Date.now() + item.durationHours * 3600 * 1000);

    await dataSource.query(
      `
      INSERT INTO "events" (
        "authorId", "categoryId", "title", "description", "severity", "status",
        "location", "addressText", "city", "district", "expiresAt", "isDemo",
        "confirmationCount", "denialCount", "reliabilityScore", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        ST_SetSRID(ST_MakePoint($7, $8), 4326),
        $9, $10, $11, $12, true,
        5, 0, 4.5, NOW(), NOW()
      );
      `,
      [
        demoUser.id,
        category.id,
        item.title,
        item.description,
        item.severity,
        item.status,
        item.lon,
        item.lat,
        item.addressText,
        item.city,
        item.district,
        expiresAt,
      ],
    );
  }

  console.log(`[Seed] ${demoEventsData.length} adet Kayseri demo olayı başarıyla oluşturuldu.`);
}
