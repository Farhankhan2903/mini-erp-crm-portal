import bcrypt from 'bcrypt';
import prisma from '../src/prisma';

async function main() {
  console.log('🌱 Seeding database for Mini ERP + CRM Portal...');

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

  // 2. Seed Sample Customers
  const customersData = [
    {
      name: 'Acme Global Corporation',
      mobile: '+91 9876543210',
      email: 'procurement@acmeglobal.com',
      businessName: 'Acme Global Corp Ltd',
      gst: '27AAACA1234A1Z5',
      customerType: 'CORPORATE',
      address: 'Suite 402, Financial Tech Park, Mumbai, Maharashtra 400051',
      status: 'ACTIVE',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Key corporate account for hardware infrastructure expansion.',
    },
    {
      name: 'TechCorp Solutions',
      mobile: '+91 9123456789',
      email: 'contact@techcorp.in',
      businessName: 'TechCorp India Pvt Ltd',
      gst: '27BBBCT5678B1Z2',
      customerType: 'WHOLESALE',
      address: 'Building 12, Cyber City, Gurugram, Haryana 122002',
      status: 'PROSPECT',
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Interested in server rack supply contract for Q3.',
    },
    {
      name: 'Metro Retail Mart',
      mobile: '+91 9988776655',
      email: 'info@metromart.com',
      businessName: 'Metro Retailers LLP',
      gst: '27CCCRM9988C1Z9',
      customerType: 'RETAIL',
      address: 'Plot 45, Commercial Hub, Pune, Maharashtra 411001',
      status: 'LEAD',
      notes: 'Initial inquiry regarding POS equipment pricing.',
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

  // 3. Seed Sample Products (INR Amounts)
  const productsData = [
    {
      name: 'Enterprise Server Rack 42U',
      sku: 'SRV-RACK-42U',
      category: 'IT Hardware',
      unitPrice: 149999.00,
      stock: 50,
      minimumStock: 10,
      warehouse: 'Main Warehouse Bay A',
    },
    {
      name: 'Cisco Catalyst 24-Port Managed Switch',
      sku: 'NET-SW-24P',
      category: 'Networking',
      unitPrice: 79950.00,
      stock: 8, // Low Stock Trigger
      minimumStock: 10,
      warehouse: 'Main Warehouse Bay B',
    },
    {
      name: 'Dell OptiPlex Desktop Workstation',
      sku: 'WKS-DELL-3080',
      category: 'Computers',
      unitPrice: 89900.00,
      stock: 35,
      minimumStock: 5,
      warehouse: 'Secondary Bay C',
    },
    {
      name: 'APC Smart-UPS 3000VA Rack Mount',
      sku: 'PWR-UPS-3K',
      category: 'Power Infrastructure',
      unitPrice: 125000.00,
      stock: 3, // Low Stock Trigger
      minimumStock: 5,
      warehouse: 'Main Warehouse Bay A',
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
        reason: 'Initial warehouse stock count',
        createdById: adminUser.id,
      },
    });
  }

  // 5. Seed Initial Sample Sales Challan
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
        totalQuantity: 2,
        createdById: salesUser.id,
        items: {
          create: [
            {
              productId: seededProducts[0].id,
              productName: seededProducts[0].name,
              sku: seededProducts[0].sku,
              price: seededProducts[0].unitPrice,
              quantity: 2,
            },
          ],
        },
      },
    });
    console.log(`  📄 Seeded Sales Challan: ${challan.challanNumber}`);
  }

  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
