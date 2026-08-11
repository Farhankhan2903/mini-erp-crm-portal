import bcrypt from 'bcrypt';
import prisma from '../src/prisma';

async function main() {
  console.log('🌱 Seeding database for Mini ERP + CRM Portal (Indian Localization)...');

  // Common password hash for demo accounts: Admin@123
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // 1. Seed Demo Staff Users for all 4 Roles
  const usersData = [
    {
      name: 'System Admin',
      email: 'admin@minierp.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
    {
      name: 'Sarah Sales Manager',
      email: 'sales@minierp.com',
      password: hashedPassword,
      role: 'SALES',
    },
    {
      name: 'Wayne Warehouse Manager',
      email: 'warehouse@minierp.com',
      password: hashedPassword,
      role: 'WAREHOUSE',
    },
    {
      name: 'Arthur Accounts Lead',
      email: 'accounts@minierp.com',
      password: hashedPassword,
      role: 'ACCOUNTS',
    },
  ];

  const seededUsers = [];
  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: userData.password,
        role: userData.role,
      },
      create: userData,
    });
    seededUsers.push(user);
    console.log(`  👤 Seeded User: [${user.role}] ${user.name} (${user.email})`);
  }

  const adminUser = seededUsers.find((u) => u.role === 'ADMIN')!;
  const salesUser = seededUsers.find((u) => u.role === 'SALES')!;

  // 2. Seed Sample Wholesalers & B2B Customers (Indian Locations & GSTINs)
  const customersData = [
    {
      name: 'Patel Traders & Hardware',
      mobile: '9825012345',
      email: 'contact@pateltraders.in',
      businessName: 'Patel Trading Company Pvt Ltd',
      gst: '24AAACP1234A1Z5',
      customerType: 'WHOLESALE',
      address: '102, GIDC Industrial Estate, Odhav, Ahmedabad, Gujarat 382415',
      status: 'ACTIVE',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Key wholesale distributor for hardware items across North Gujarat.',
    },
    {
      name: 'Shree Ganesh Distributors',
      mobile: '9820098765',
      email: 'sales@shreeganesh.co.in',
      businessName: 'Shree Ganesh Enterprise LLP',
      gst: '27AAACS5678B1Z2',
      customerType: 'WHOLESALE',
      address: 'Shop 4, APMC Market Yard, Vashi, Navi Mumbai, Maharashtra 400703',
      status: 'ACTIVE',
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Bulk purchaser of electrical wiring and power equipment.',
    },
    {
      name: 'Om Enterprise & Electricals',
      mobile: '9712345678',
      email: 'info@omenterprise.com',
      businessName: 'Om Enterprise India Pvt Ltd',
      gst: '24AAACO9988C1Z9',
      customerType: 'CORPORATE',
      address: 'Plot 45, Makarpura GIDC Industrial Zone, Vadodara, Gujarat 390010',
      status: 'ACTIVE',
      notes: 'Corporate client for industrial water pumps and server infrastructure.',
    },
    {
      name: 'Mahavir Traders & Building Supplies',
      mobile: '9414011223',
      email: 'mahavir.jaipur@gmail.com',
      businessName: 'Mahavir Building Supplies Co.',
      gst: '08AAACM4321D1Z1',
      customerType: 'WHOLESALE',
      address: 'B-12, VKIA Industrial Area, Road No. 4, Jaipur, Rajasthan 302013',
      status: 'PROSPECT',
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: 'Evaluating quote for TMT steel rebar supply contract.',
    },
    {
      name: 'Sai Electricals & Automation',
      mobile: '9845099887',
      email: 'procurement@saielectricals.in',
      businessName: 'Sai Electrical Systems',
      gst: '29AAACS8765E1Z8',
      customerType: 'WHOLESALE',
      address: '22, Peenya Industrial Area Phase 1, Bengaluru, Karnataka 560058',
      status: 'ACTIVE',
      notes: 'Regular order cycle every 15 days for Polycab cables.',
    },
    {
      name: 'A-One Hardware & Tools Mart',
      mobile: '9810055443',
      email: 'aone.delhi@hardware.in',
      businessName: 'A-One Hardware Mart LLP',
      gst: '07AAACA1122F1Z6',
      customerType: 'RETAIL',
      address: '15, Chawri Bazar, Chandni Chowk, New Delhi, Delhi 110006',
      status: 'LEAD',
      notes: 'Inquired about Bosch power drill dealer discount rates.',
    },
    {
      name: 'Riddhi Foods & Beverages Supply',
      mobile: '9949088776',
      email: 'orders@riddhifoods.com',
      businessName: 'Riddhi Food Products Ltd',
      gst: '36AAACR3344G1Z3',
      customerType: 'CORPORATE',
      address: 'Plot 88, Autonagar Industrial Area, Hyderabad, Telangana 500070',
      status: 'ACTIVE',
      notes: 'Packaging material and tape supplier contract.',
    },
    {
      name: 'Krishna Agencies & Tools',
      mobile: '9898011223',
      email: 'krishna.surat@agencies.in',
      businessName: 'Krishna Trading Agencies',
      gst: '24AAACK5566H1Z0',
      customerType: 'WHOLESALE',
      address: 'Ring Road Industrial Zone, Khatodra, Surat, Gujarat 395002',
      status: 'ACTIVE',
      notes: 'Primary textile hub electrical goods distributor.',
    },
  ];

  const seededCustomers = [];
  for (const cData of customersData) {
    const existing = await prisma.customer.findFirst({
      where: { email: cData.email },
    });

    const cust = existing
      ? await prisma.customer.update({ where: { id: existing.id }, data: cData })
      : await prisma.customer.create({ data: cData });

    seededCustomers.push(cust);
    console.log(`  🏢 Seeded Customer: ${cust.name} (${cust.customerType})`);
  }

  // 3. Seed Sample Indian B2B Industrial Products (INR Prices)
  const productsData = [
    {
      name: 'Polycab 3-Core Flexible Copper Cable 90m',
      sku: 'ELEC-CBL-3C-90M',
      category: 'Electrical Supplies',
      unitPrice: 4250.0,
      stock: 150,
      minimumStock: 20,
      warehouse: 'Ahmedabad Central Depot',
    },
    {
      name: 'Havells 1200mm High Speed Ceiling Fan (White)',
      sku: 'ELEC-FAN-1200M',
      category: 'Electrical Appliances',
      unitPrice: 2450.0,
      stock: 85,
      minimumStock: 15,
      warehouse: 'Surat Logistics Hub',
    },
    {
      name: 'Asian Paints Royale Luxury Emulsion 20L',
      sku: 'PNT-ASN-ROY-20L',
      category: 'Paints & Coatings',
      unitPrice: 5890.0,
      stock: 40,
      minimumStock: 10,
      warehouse: 'Mumbai Main Godown',
    },
    {
      name: 'Tata Tiscon 12mm TMT Steel Rebar (12m Bundle)',
      sku: 'STL-TATA-12MM',
      category: 'Building Materials',
      unitPrice: 64500.0,
      stock: 25,
      minimumStock: 5,
      warehouse: 'Ahmedabad Central Depot',
    },
    {
      name: 'Astral Pipes 4" PVC Drainage Pipe 6m',
      sku: 'PLM-AST-PVC-4IN',
      category: 'Plumbing & Hardware',
      unitPrice: 1120.0,
      stock: 8, // Low Stock Trigger
      minimumStock: 15,
      warehouse: 'Vadodara Storage Bay',
    },
    {
      name: 'Crompton Greaves 1.5 HP Monoblock Water Pump',
      sku: 'PMP-CRM-1.5HP',
      category: 'Industrial Machinery',
      unitPrice: 8950.0,
      stock: 18,
      minimumStock: 5,
      warehouse: 'Delhi Distribution Center',
    },
    {
      name: 'Bosch Professional 13mm Impact Power Drill',
      sku: 'TLS-BSH-13MM',
      category: 'Power Tools',
      unitPrice: 3750.0,
      stock: 4, // Low Stock Trigger
      minimumStock: 10,
      warehouse: 'Mumbai Main Godown',
    },
    {
      name: '3M Heavy Duty Industrial Packaging Tape Box (72 Rolls)',
      sku: 'PKG-3M-TAPE-72P',
      category: 'Packaging Materials',
      unitPrice: 2160.0,
      stock: 60,
      minimumStock: 12,
      warehouse: 'Ahmedabad Central Depot',
    },
  ];

  const seededProducts = [];
  for (const pData of productsData) {
    const prod = await prisma.product.upsert({
      where: { sku: pData.sku },
      update: pData,
      create: pData,
    });
    seededProducts.push(prod);
    console.log(`  📦 Seeded Product: [${prod.sku}] ${prod.name} (Price: ₹${prod.unitPrice}, Stock: ${prod.stock})`);
  }

  // 4. Seed Initial Stock Movements
  for (const prod of seededProducts) {
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        quantity: prod.stock,
        movementType: 'IN',
        reason: 'Initial warehouse stock audit reconciliation',
        createdById: adminUser.id,
      },
    });
  }

  // 5. Seed Sample Sales Challans
  const sampleChallanNumber = 'SCH-20260810-0001';
  const existingChallan = await prisma.salesChallan.findUnique({
    where: { challanNumber: sampleChallanNumber },
  });

  if (!existingChallan) {
    const challan = await prisma.salesChallan.create({
      data: {
        challanNumber: sampleChallanNumber,
        customerId: seededCustomers[0].id,
        status: 'CONFIRMED',
        totalQuantity: 10,
        createdById: salesUser.id,
        items: {
          create: [
            {
              productId: seededProducts[0].id,
              productName: seededProducts[0].name,
              sku: seededProducts[0].sku,
              price: seededProducts[0].unitPrice,
              quantity: 10,
            },
          ],
        },
      },
    });
    console.log(`  📄 Seeded Sales Challan: ${challan.challanNumber}`);
  }

  console.log('✅ Indian Localization Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
