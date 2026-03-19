import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Kenya cities and towns data
const kenyaLocations = [
  // Nairobi County
  { name: 'Nairobi', county: 'Nairobi', type: 'CITY' },
  { name: 'Westlands', county: 'Nairobi', type: 'AREA' },
  { name: 'Karen', county: 'Nairobi', type: 'AREA' },
  { name: 'Kilimani', county: 'Nairobi', type: 'AREA' },
  { name: 'Kileleshwa', county: 'Nairobi', type: 'AREA' },
  { name: 'Lavington', county: 'Nairobi', type: 'AREA' },
  { name: 'South B', county: 'Nairobi', type: 'AREA' },
  { name: 'South C', county: 'Nairobi', type: 'AREA' },
  { name: 'Eastleigh', county: 'Nairobi', type: 'AREA' },
  { name: 'Industrial Area', county: 'Nairobi', type: 'AREA' },
  { name: 'Embakasi', county: 'Nairobi', type: 'AREA' },
  { name: 'Ruai', county: 'Nairobi', type: 'AREA' },
  { name: 'Kasarani', county: 'Nairobi', type: 'AREA' },
  { name: 'Runda', county: 'Nairobi', type: 'AREA' },
  { name: 'Garden Estate', county: 'Nairobi', type: 'AREA' },

  // Mombasa County
  { name: 'Mombasa', county: 'Mombasa', type: 'CITY' },
  { name: 'Nyali', county: 'Mombasa', type: 'AREA' },
  { name: 'Bamburi', county: 'Mombasa', type: 'AREA' },
  { name: 'Likoni', county: 'Mombasa', type: 'AREA' },
  { name: 'Kisauni', county: 'Mombasa', type: 'AREA' },
  { name: 'Mtwapa', county: 'Mombasa', type: 'TOWN' },
  { name: 'Diani', county: 'Kwale', type: 'TOWN' },
  { name: 'Ukunda', county: 'Kwale', type: 'TOWN' },

  // Kisumu County
  { name: 'Kisumu', county: 'Kisumu', type: 'CITY' },
  { name: 'Kisian', county: 'Kisumu', type: 'TOWN' },
  { name: 'Maseno', county: 'Kisumu', type: 'TOWN' },
  { name: 'Ahero', county: 'Kisumu', type: 'TOWN' },

  // Nakuru County
  { name: 'Nakuru', county: 'Nakuru', type: 'CITY' },
  { name: 'Naivasha', county: 'Nakuru', type: 'TOWN' },
  { name: 'Gilgil', county: 'Nakuru', type: 'TOWN' },
  { name: 'Njoro', county: 'Nakuru', type: 'TOWN' },
  { name: 'Molo', county: 'Nakuru', type: 'TOWN' },

  // Uasin Gishu County (Eldoret)
  { name: 'Eldoret', county: 'Uasin Gishu', type: 'CITY' },
  { name: 'Eldoret Town', county: 'Uasin Gishu', type: 'AREA' },
  { name: 'Ziwa', county: 'Uasin Gishu', type: 'TOWN' },
  { name: 'Burnt Forest', county: 'Uasin Gishu', type: 'TOWN' },

  // Kiambu County
  { name: 'Kiambu', county: 'Kiambu', type: 'TOWN' },
  { name: 'Thika', county: 'Kiambu', type: 'TOWN' },
  { name: 'Ruiru', county: 'Kiambu', type: 'TOWN' },
  { name: 'Juja', county: 'Kiambu', type: 'TOWN' },
  { name: 'Limuru', county: 'Kiambu', type: 'TOWN' },
  { name: 'Kikuyu', county: 'Kiambu', type: 'TOWN' },
  { name: 'Kiambu Town', county: 'Kiambu', type: 'TOWN' },

  // Machakos County
  { name: 'Machakos', county: 'Machakos', type: 'TOWN' },
  { name: 'Athi River', county: 'Machakos', type: 'TOWN' },
  { name: 'Mavoko', county: 'Machakos', type: 'TOWN' },
  { name: 'Kangundo', county: 'Machakos', type: 'TOWN' },

  // Kajiado County
  { name: 'Kajiado', county: 'Kajiado', type: 'TOWN' },
  { name: 'Kitengela', county: 'Kajiado', type: 'TOWN' },
  { name: 'Ongata Rongai', county: 'Kajiado', type: 'TOWN' },
  { name: 'Ngong', county: 'Kajiado', type: 'TOWN' },
  { name: 'Kiserian', county: 'Kajiado', type: 'TOWN' },

  // Nyeri County
  { name: 'Nyeri', county: 'Nyeri', type: 'TOWN' },
  { name: 'Karatina', county: 'Nyeri', type: 'TOWN' },
  { name: 'Othaya', county: 'Nyeri', type: 'TOWN' },

  // Meru County
  { name: 'Meru', county: 'Meru', type: 'TOWN' },
  { name: 'Maua', county: 'Meru', type: 'TOWN' },
  { name: 'Chuka', county: 'Tharaka Nithi', type: 'TOWN' },

  // Kakamega County
  { name: 'Kakamega', county: 'Kakamega', type: 'TOWN' },
  { name: 'Mumias', county: 'Kakamega', type: 'TOWN' },
  { name: 'Webuye', county: 'Bungoma', type: 'TOWN' },
  { name: 'Bungoma', county: 'Bungoma', type: 'TOWN' },

  // Trans Nzoia County
  { name: 'Kitale', county: 'Trans Nzoia', type: 'TOWN' },

  // Kericho County
  { name: 'Kericho', county: 'Kericho', type: 'TOWN' },
  { name: 'Litein', county: 'Kericho', type: 'TOWN' },

  // Bomet County
  { name: 'Bomet', county: 'Bomet', type: 'TOWN' },

  // Narok County
  { name: 'Narok', county: 'Narok', type: 'TOWN' },

  // Turkana County
  { name: 'Lodwar', county: 'Turkana', type: 'TOWN' },

  // Isiolo County
  { name: 'Isiolo', county: 'Isiolo', type: 'TOWN' },

  // Nandi County
  { name: 'Kapsabet', county: 'Nandi', type: 'TOWN' },

  // Baringo County
  { name: 'Kabarnet', county: 'Baringo', type: 'TOWN' },

  // Laikipia County
  { name: 'Nanyuki', county: 'Laikipia', type: 'TOWN' },
  { name: 'Nyahururu', county: 'Laikipia', type: 'TOWN' },

  // Garissa County
  { name: 'Garissa', county: 'Garissa', type: 'TOWN' },

  // Wajir County
  { name: 'Wajir', county: 'Wajir', type: 'TOWN' },

  // Mandera County
  { name: 'Mandera', county: 'Mandera', type: 'TOWN' },

  // Marsabit County
  { name: 'Marsabit', county: 'Marsabit', type: 'TOWN' },

  // Moyale
  { name: 'Moyale', county: 'Marsabit', type: 'TOWN' },

  // Vihiga County
  { name: 'Vihiga', county: 'Vihiga', type: 'TOWN' },
  { name: 'Luanda', county: 'Vihiga', type: 'TOWN' },

  // Busia County
  { name: 'Busia', county: 'Busia', type: 'TOWN' },

  // Siaya County
  { name: 'Siaya', county: 'Siaya', type: 'TOWN' },
  { name: 'Bondo', county: 'Siaya', type: 'TOWN' },
  { name: 'Yala', county: 'Siaya', type: 'TOWN' },

  // Homa Bay County
  { name: 'Homa Bay', county: 'Homa Bay', type: 'TOWN' },
  { name: 'Oyugis', county: 'Homa Bay', type: 'TOWN' },

  // Migori County
  { name: 'Migori', county: 'Migori', type: 'TOWN' },
  { name: 'Rongo', county: 'Migori', type: 'TOWN' },

  // Kisii County
  { name: 'Kisii', county: 'Kisii', type: 'TOWN' },
  { name: 'Ogembo', county: 'Kisii', type: 'TOWN' },

  // Nyamira County
  { name: 'Nyamira', county: 'Nyamira', type: 'TOWN' },

  // Kirinyaga County
  { name: 'Kerugoya', county: 'Kirinyaga', type: 'TOWN' },
  { name: 'Sagana', county: 'Kirinyaga', type: 'TOWN' },

  // Murang'a County
  { name: 'Murang\'a', county: 'Murang\'a', type: 'TOWN' },
  { name: 'Maragua', county: 'Murang\'a', type: 'TOWN' },

  // Nyandarua County
  { name: 'Ol Kalou', county: 'Nyandarua', type: 'TOWN' },
  { name: 'Engineer', county: 'Nyandarua', type: 'TOWN' },

  // Samburu County
  { name: 'Maralal', county: 'Samburu', type: 'TOWN' },

  // West Pokot County
  { name: 'Kapenguria', county: 'West Pokot', type: 'TOWN' },

  // Elgeyo Marakwet County
  { name: 'Iten', county: 'Elgeyo Marakwet', type: 'TOWN' },
  { name: 'Kapsowar', county: 'Elgeyo Marakwet', type: 'TOWN' },

  // Keiyo
  { name: 'Chepkorio', county: 'Elgeyo Marakwet', type: 'TOWN' },

  // Taita Taveta County
  { name: 'Voi', county: 'Taita Taveta', type: 'TOWN' },
  { name: 'Wundanyi', county: 'Taita Taveta', type: 'TOWN' },

  // Kilifi County
  { name: 'Malindi', county: 'Kilifi', type: 'TOWN' },
  { name: 'Kilifi', county: 'Kilifi', type: 'TOWN' },
  { name: 'Watamu', county: 'Kilifi', type: 'TOWN' },

  // Lamu County
  { name: 'Lamu', county: 'Lamu', type: 'TOWN' },

  // Tana River County
  { name: 'Hola', county: 'Tana River', type: 'TOWN' },

  // Kwale County
  { name: 'Kwale', county: 'Kwale', type: 'TOWN' },
  { name: 'Msambweni', county: 'Kwale', type: 'TOWN' },
];

// Seed locations if empty
async function seedLocations() {
  const count = await db.kenyaLocation.count();
  if (count === 0) {
    await db.kenyaLocation.createMany({
      data: kenyaLocations,
      skipDuplicates: true,
    });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Seed locations if empty
    await seedLocations();

    // Query locations with search (SQLite doesn't support mode: 'insensitive')
    const locations = await db.kenyaLocation.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { county: { contains: search } },
            ],
          }
        : {},
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      take: limit,
    });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return NextResponse.json({ locations: [] }, { status: 500 });
  }
}

// POST endpoint to add new locations (admin use)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, county, type } = body;

    if (!name || !county || !type) {
      return NextResponse.json(
        { error: 'Name, county, and type are required' },
        { status: 400 }
      );
    }

    const location = await db.kenyaLocation.create({
      data: { name, county, type },
    });

    return NextResponse.json({ location });
  } catch (error) {
    console.error('Failed to create location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
