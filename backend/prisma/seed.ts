/**
 * Demonstration seed data for AyurSethu.
 *
 * Everything created here is clearly marked as demo data (`isDemoData: true`
 * on Medicine/MedicinalPlant) and uses obviously fake license numbers,
 * addresses and prices. Do not treat any of it as a real, verified product,
 * manufacturer, or classical reference — replace it with real, attributed
 * data before any production use.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding demo data...");

  // --- Users -----------------------------------------------------------------
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@ayursethu.demo" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@ayursethu.demo",
      passwordHash: await hash("Admin@1234"),
      role: "ADMIN",
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: "patient@ayursethu.demo" },
    update: {},
    create: {
      name: "Asha Patient",
      email: "patient@ayursethu.demo",
      passwordHash: await hash("Patient@1234"),
      role: "PATIENT",
      patientProfile: { create: { latitude: 12.9716, longitude: 77.5946, address: "Bengaluru, Karnataka (demo)" } },
    },
    include: { patientProfile: true },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@ayursethu.demo" },
    update: {},
    create: {
      name: "Rahul Student",
      email: "student@ayursethu.demo",
      passwordHash: await hash("Student@1234"),
      role: "STUDENT",
      studentProfile: { create: { college: "Demo Ayurveda Medical College", yearOfStudy: 2 } },
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: "doctor@ayursethu.demo" },
    update: {},
    create: {
      name: "Dr. Meera Vaidya",
      email: "doctor@ayursethu.demo",
      passwordHash: await hash("Doctor@1234"),
      role: "DOCTOR",
      doctorProfile: { create: { registrationNumber: "DEMO-KA-00123", specialization: "Kayachikitsa", clinicName: "Demo Ayurveda Clinic" } },
    },
  });

  const pharmacyUser = await prisma.user.upsert({
    where: { email: "pharmacy@ayursethu.demo" },
    update: {},
    create: {
      name: "Green Leaf Pharmacy Owner",
      email: "pharmacy@ayursethu.demo",
      passwordHash: await hash("Pharmacy@1234"),
      role: "PHARMACY",
    },
  });

  const pharmacy = await prisma.pharmacy.upsert({
    where: { userId: pharmacyUser.id },
    update: {},
    create: {
      userId: pharmacyUser.id,
      name: "Green Leaf Ayurvedic Pharmacy (Demo)",
      licenseNumber: "DEMO-LIC-0001",
      phone: "+91-90000-00001",
      address: "MG Road, Bengaluru (demo address)",
      city: "Bengaluru",
      pinCode: "560001",
      latitude: 12.9752,
      longitude: 77.6058,
      openingTime: "09:00",
      closingTime: "21:00",
      verificationStatus: "VERIFIED",
    },
  });

  const pharmacy2User = await prisma.user.upsert({
    where: { email: "pharmacy2@ayursethu.demo" },
    update: {},
    create: {
      name: "Himalaya Herbal Store Owner",
      email: "pharmacy2@ayursethu.demo",
      passwordHash: await hash("Pharmacy@1234"),
      role: "PHARMACY",
    },
  });

  const pharmacy2 = await prisma.pharmacy.upsert({
    where: { userId: pharmacy2User.id },
    update: {},
    create: {
      userId: pharmacy2User.id,
      name: "Himalaya Herbal Store (Demo)",
      licenseNumber: "DEMO-LIC-0002",
      phone: "+91-90000-00002",
      address: "Indiranagar, Bengaluru (demo address)",
      city: "Bengaluru",
      pinCode: "560038",
      latitude: 12.9719,
      longitude: 77.6412,
      openingTime: "08:30",
      closingTime: "20:30",
      verificationStatus: "PENDING",
    },
  });

  // --- Manufacturer -----------------------------------------------------------
  const manufacturer = await prisma.manufacturer.upsert({
    where: { name: "Demo Ayurveda Pharmaceuticals Ltd." },
    update: {},
    create: {
      name: "Demo Ayurveda Pharmaceuticals Ltd.",
      licenseNumber: "DEMO-MFG-000999",
      address: "Industrial Area, Dehradun (demo address)",
      verificationStatus: "VERIFIED",
    },
  });

  // --- Medicinal plants ----------------------------------------------------------
  const ashwagandhaPlant = await prisma.medicinalPlant.create({
    data: {
      name: "Ashwagandha",
      botanicalName: "Withania somnifera",
      sanskritName: "Ashwagandha",
      englishName: "Winter cherry",
      kannadaName: "Ashwagandhi",
      hindiName: "Asgandh",
      partsUsed: "Root",
      description: "A widely used Rasayana herb in classical Ayurveda, traditionally associated with strength and vitality (demo entry).",
      ayurvedicProperties: "Rasa: Katu, Tikta, Kashaya; Virya: Ushna",
      traditionalUses: "Traditionally used as a Rasayana (rejuvenative) herb.",
      habitat: "Dry regions of India",
      isDemoData: true,
      images: { create: [{ url: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=600", caption: "Ashwagandha root (demo image)" }] },
    },
  });

  const tulsiPlant = await prisma.medicinalPlant.create({
    data: {
      name: "Tulsi",
      botanicalName: "Ocimum tenuiflorum",
      sanskritName: "Tulasi",
      englishName: "Holy basil",
      kannadaName: "Tulasi",
      hindiName: "Tulsi",
      partsUsed: "Leaves",
      description: "A sacred and widely cultivated herb used traditionally for respiratory wellness (demo entry).",
      ayurvedicProperties: "Rasa: Katu, Tikta; Virya: Ushna",
      traditionalUses: "Traditionally used to support respiratory comfort.",
      habitat: "Cultivated across the Indian subcontinent",
      isDemoData: true,
      images: { create: [{ url: "https://images.unsplash.com/photo-1628557010913-33c7bb68e3d4?w=600", caption: "Tulsi plant (demo image)" }] },
    },
  });

  // --- Medicines ------------------------------------------------------------------
  const ashwagandhaTablet = await prisma.medicine.create({
    data: {
      name: "Ashwagandha Tablets",
      brandName: "Demo Ashwa-Strong",
      sanskritName: "Ashwagandha Vati",
      englishName: "Ashwagandha tablets",
      kannadaName: "Ashwagandhi Matre",
      hindiName: "Ashwagandha Goli",
      manufacturerId: manufacturer.id,
      dosageForm: "TABLET",
      formulationCategory: "SINGLE_HERB",
      description: "A single-herb Ashwagandha formulation presented as tablets (demo product description).",
      traditionalIndications: "Traditionally associated with general strength and stress resilience.",
      rasa: "Katu, Tikta, Kashaya",
      guna: "Laghu, Snigdha",
      virya: "Ushna",
      vipaka: "Madhura",
      karma: "Balya, Rasayana",
      productLicenseNumber: "DEMO-PROD-1001",
      productCode: "8901234500011",
      isVerifiedProduct: true,
      isDemoData: true,
      ingredients: { create: [{ name: "Ashwagandha (Withania somnifera)", quantity: "500mg", plantId: ashwagandhaPlant.id }] },
      images: { create: [{ url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600", caption: "Ashwagandha tablets (demo image)" }] },
      packageSizes: { create: [{ size: "30", unit: "tablets" }, { size: "60", unit: "tablets" }] },
      classicalRefs: { create: [{ sourceText: "Charaka Samhita, Chikitsa Sthana (demo citation placeholder)", reference: "Charaka Samhita" }] },
      relatedPlants: { create: [{ plantId: ashwagandhaPlant.id }] },
      batches: { create: [{ batchNumber: "DEMO-BATCH-001", manufactureDate: new Date("2025-01-10"), expiryDate: new Date("2027-01-10") }] },
    },
    include: { batches: true },
  });

  const tulsiDrops = await prisma.medicine.create({
    data: {
      name: "Tulsi Drops",
      brandName: "Demo PureTulsi",
      sanskritName: "Tulasi Arka",
      englishName: "Holy basil drops",
      kannadaName: "Tulasi Hani",
      hindiName: "Tulsi Drops",
      manufacturerId: manufacturer.id,
      dosageForm: "SYRUP",
      formulationCategory: "SINGLE_HERB",
      description: "A single-herb Tulsi extract in drop form (demo product description).",
      traditionalIndications: "Traditionally used to support respiratory wellness.",
      rasa: "Katu, Tikta",
      virya: "Ushna",
      productLicenseNumber: "DEMO-PROD-1002",
      productCode: "8901234500028",
      isVerifiedProduct: false,
      isDemoData: true,
      ingredients: { create: [{ name: "Tulsi (Ocimum tenuiflorum)", quantity: "5ml", plantId: tulsiPlant.id }] },
      images: { create: [{ url: "https://images.unsplash.com/photo-1611077544482-4a2b58633a6a?w=600", caption: "Tulsi drops (demo image)" }] },
      packageSizes: { create: [{ size: "30", unit: "ml" }] },
      relatedPlants: { create: [{ plantId: tulsiPlant.id }] },
      batches: { create: [{ batchNumber: "DEMO-BATCH-002", manufactureDate: new Date("2025-03-01"), expiryDate: new Date("2026-09-01") }] },
    },
    include: { batches: true },
  });

  // --- Inventory across both demo pharmacies ---------------------------------------
  await prisma.inventory.create({
    data: {
      pharmacyId: pharmacy.id,
      medicineId: ashwagandhaTablet.id,
      batchId: ashwagandhaTablet.batches[0].id,
      price: 180,
      stockQty: 42,
      inStock: true,
    },
  });
  await prisma.inventory.create({
    data: {
      pharmacyId: pharmacy2.id,
      medicineId: ashwagandhaTablet.id,
      price: 200,
      stockQty: 0,
      inStock: false,
    },
  });
  await prisma.inventory.create({
    data: {
      pharmacyId: pharmacy.id,
      medicineId: tulsiDrops.id,
      batchId: tulsiDrops.batches[0].id,
      price: 95,
      stockQty: 15,
      inStock: true,
    },
  });

  // --- BAMS learning center ----------------------------------------------------------
  const subjects = [
    "Padartha Vigyana", "Sanskrit", "Kriya Sharira", "Rachana Sharira", "Dravyaguna Vigyana",
    "Rasashastra and Bhaishajya Kalpana", "Roga Nidana", "Agada Tantra", "Swasthavritta",
    "Kayachikitsa", "Shalya Tantra", "Shalakya Tantra", "Prasuti Tantra and Stri Roga", "Kaumarabhritya",
  ];
  const createdSubjects = [];
  for (let i = 0; i < subjects.length; i++) {
    const subject = await prisma.subject.upsert({
      where: { name: subjects[i] },
      update: {},
      create: { name: subjects[i], description: `${subjects[i]} — BAMS subject (demo description).`, orderIndex: i },
    });
    createdSubjects.push(subject);
  }

  const dravyaguna = createdSubjects.find((s) => s.name === "Dravyaguna Vigyana")!;
  const chapter1 = await prisma.chapter.create({
    data: { subjectId: dravyaguna.id, title: "Introduction to Rasa Panchaka", orderIndex: 0 },
  });
  await prisma.studyMaterial.create({
    data: {
      chapterId: chapter1.id,
      title: "Rasa, Guna, Virya, Vipaka, Karma — Overview",
      content:
        "Rasa Panchaka refers to the five fundamental parameters used in Dravyaguna to understand a drug's pharmacological action: Rasa (taste), Guna (quality), Virya (potency), Vipaka (post-digestive effect), and Karma (action). (Demo study note — replace with faculty-reviewed content.)",
    },
  });
  const quiz1 = await prisma.quiz.create({
    data: {
      chapterId: chapter1.id,
      title: "Rasa Panchaka Basics",
      questions: {
        create: [
          {
            text: "Which of the following is NOT one of the Rasa Panchaka parameters?",
            options: ["Rasa", "Guna", "Virya", "Dosha"],
            correctOption: 3,
            explanation: "The five Rasa Panchaka parameters are Rasa, Guna, Virya, Vipaka and Karma — Dosha is a separate concept.",
          },
          {
            text: "Vipaka refers to:",
            options: ["Initial taste", "Post-digestive effect", "Potency", "Physical quality"],
            correctOption: 1,
            explanation: "Vipaka is the transformed taste/effect of a substance after digestion.",
          },
        ],
      },
    },
  });
  await prisma.flashcard.createMany({
    data: [
      { chapterId: chapter1.id, front: "What is Virya?", back: "The potency of a drug, typically classified as Ushna (hot) or Shita (cold)." },
      { chapterId: chapter1.id, front: "What is Karma?", back: "The pharmacological action or effect of a substance on the body." },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo logins (all passwords shown here are demo-only — rotate before any real deployment):");
  console.log("  Admin:    admin@ayursethu.demo / Admin@1234");
  console.log("  Patient:  patient@ayursethu.demo / Patient@1234");
  console.log("  Student:  student@ayursethu.demo / Student@1234");
  console.log("  Doctor:   doctor@ayursethu.demo / Doctor@1234");
  console.log("  Pharmacy: pharmacy@ayursethu.demo / Pharmacy@1234 (verified)");
  console.log("  Pharmacy: pharmacy2@ayursethu.demo / Pharmacy@1234 (pending approval)");
  void adminUser;
  void doctorUser;
  void studentUser;
  void patientUser;
  void quiz1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
