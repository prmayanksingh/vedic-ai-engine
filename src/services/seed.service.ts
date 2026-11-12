import bookingModel from "../models/booking.model.js";
import panditModel from "../models/pandit.model.js";
import ritualModel from "../models/ritual.model.js";



const INITIAL_RITUALS = [
    {
        name: "Griha Pravesh Havan",
        ritualType: "havan" as const,
        description:
            "Sacred Vedic fire ceremony performed before moving into a new home to purify the space and invoke Vastu peace.",
        durationMinutes: 150,
        baseDakshina: 3100,
        samagriKitPrice: 1200,
        samagriItems: [
            "Havan Kund",
            "Mango Wood (Samidha)",
            "Pure Cow Ghee",
            "Havan Samagri Mix",
            "Camphor",
            "Kalash",
            "Red Cloth",
            "Betel Nuts",
        ],
    },
    {
        name: "Satyanarayan Katha & Pooja",
        ritualType: "pooja" as const,
        description:
            "Traditional Vishnu worship for prosperity, gratitude, and family well-being.",
        durationMinutes: 120,
        baseDakshina: 2100,
        samagriKitPrice: 850,
        samagriItems: [
            "Turmeric",
            "Kumkum",
            "Banana Leaves",
            "Panchamrit Ingredients",
            "Incense Sticks",
            "Cotton Wicks",
            "Tulsi Leaves",
        ],
    },
    {
        name: "Maha Mrityunjaya Havan",
        ritualType: "havan" as const,
        description:
            "Healing and protective fire ritual dedicated to Lord Shiva for health and longevity.",
        durationMinutes: 180,
        baseDakshina: 4100,
        samagriKitPrice: 1500,
        samagriItems: [
            "Havan Kund",
            "Bilva Leaves",
            "Black Sesame Seeds",
            "Pure Ghee",
            "Barley (Jau)",
            "Samidha Wood",
            "Rudraksha",
        ],
    },
    {
        name: "Lakshmi Ganesh Pooja",
        ritualType: "pooja" as const,
        description:
            "Auspicious invocation of Goddess Lakshmi and Lord Ganesha for new business ventures and wealth.",
        durationMinutes: 90,
        baseDakshina: 1800,
        samagriKitPrice: 750,
        samagriItems: [
            "Lotus Flowers",
            "Silver Coin",
            "Roli & Akshat",
            "Sweets (Modak/Ladoo)",
            "Ghee Diya",
            "Red Asana Cloth",
        ],
    },
];

const INITIAL_PANDITS = [
    {
        name: "Acharya Rameshwar Shastri",
        city: "gurugram",
        languages: ["Hindi", "Sanskrit"],
        specializations: ["pooja", "havan"] as ("pooja" | "havan")[],
        experienceYears: 14,
        isActive: true,
    },
    {
        name: "Pandit Devendra Upadhyay",
        city: "gurugram",
        languages: ["Hindi", "Sanskrit", "English"],
        specializations: ["pooja"] as ("pooja" | "havan")[],
        experienceYears: 8,
        isActive: true,
    },
    {
        name: "Acharya Vishwanath Joshi",
        city: "noida",
        languages: ["Hindi", "Sanskrit"],
        specializations: ["pooja", "havan"] as ("pooja" | "havan")[],
        experienceYears: 18,
        isActive: true,
    },
];


export async function resetDemoData() {
    try {
        await Promise.all([
            ritualModel.deleteMany({}),
            panditModel.deleteMany({}),
            bookingModel.deleteMany({}),
        ]);

        const rituals = await ritualModel.insertMany(INITIAL_RITUALS);
        const pandits = await panditModel.insertMany(INITIAL_PANDITS);

        await bookingModel.create({
            bookingCode: "BK-1001",
            devoteeName: "Aarav Sharma",
            devoteePhone: "9811000001",
            city: "gurugram",
            address: "B-402, DLF Phase 4, Gurugram",
            ritualId: rituals[0]._id,
            ritualName: rituals[0].name,
            ritualType: rituals[0].ritualType,
            panditId: pandits[0]._id,
            panditName: pandits[0].name,
            date: "2026-11-20",
            timeSlot: "morning",
            includeSamagriKit: true,
            totalAmount: rituals[0].baseDakshina + rituals[0].samagriKitPrice,
            status: "CONFIRMED",
        });

        console.log("Demo data seeded: 4 Rituals, 3 Pandits, and sample booking BK-1001.");

    } catch (error) {
        console.error("Seed error: ", error);
        throw error;
    }
}


export async function seedIfEmpty() {
    const ritualCount = await ritualModel.countDocuments();
    const panditCount = await panditModel.countDocuments();

    if (ritualCount === 0 || panditCount === 0) {
        console.log("Empty database detected- running initial seed....");
        await resetDemoData();
    }
}