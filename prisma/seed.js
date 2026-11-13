import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ShiftFlow WFM database...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { code: 'APEX-CORP' },
    update: {},
    create: {
      name: 'Apex Contact Solutions',
      code: 'APEX-CORP',
    },
  });

  console.log('Organization created:', org.name);

  // 2. Create Departments
  const deptData = [
    { name: 'Customer Support', code: 'CS' },
    { name: 'Technical Escalations', code: 'TECH' },
    { name: 'Billing & Retention', code: 'BILLING' },
    { name: 'Quality Assurance', code: 'QA' },
    { name: 'Inbound Sales', code: 'SALES' },
    { name: 'Workforce Operations Hub', code: 'WFM' },
  ];

  const depts = {};
  for (const d of deptData) {
    const dept = await prisma.department.upsert({
      where: {
        organizationId_code: {
          organizationId: org.id,
          code: d.code,
        },
      },
      update: { name: d.name },
      create: {
        name: d.name,
        code: d.code,
        organizationId: org.id,
      },
    });
    depts[d.name] = dept;
  }

  // 3. Create Skills
  const skillsData = [
    { name: 'Omnichannel Zendesk', code: 'ZENDESK', description: 'Certified in multi-channel Zendesk triage' },
    { name: 'VIP Handling', code: 'VIP', description: 'Certified for high-value enterprise accounts' },
    { name: 'Conflict De-escalation', code: 'DEESCALATE', description: 'Senior tier customer conflict resolution' },
    { name: 'CRM Pro', code: 'CRM', description: 'Salesforce and HubSpot enterprise power user' },
    { name: 'Tier-3 Network Diagnostics', code: 'NET_DIAG', description: 'Packet inspection and latency troubleshooting' },
    { name: 'Disaster Recovery Lead', code: 'DR_LEAD', description: 'Authorized to trigger incident bridge protocols' },
    { name: 'Stripe Billing Master', code: 'STRIPE', description: 'Dispute management and subscription reconciliation' },
    { name: 'Enterprise Retention', code: 'RETENTION', description: 'Account retention and churn mitigation' },
    { name: 'High-Value Conversion', code: 'CONVERT', description: 'B2B inbound demo closing' },
    { name: 'Compliance Auditor', code: 'COMPLIANCE', description: 'PCI-DSS and HIPAA call recording verification' },
  ];

  const skillMap = {};
  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { code: s.code },
      update: { name: s.name, description: s.description },
      create: s,
    });
    skillMap[s.name] = skill;
  }

  // 4. Create Shift Templates
  const templatesData = [
    {
      name: 'Morning Shift',
      code: 'MORNING',
      startTime: '06:00',
      endTime: '14:00',
      durationHours: 8,
      breakDurationMinutes: 45,
      minStaffing: 8,
      color: '#0284C7',
      description: 'Early customer coverage and queue processing',
      requiredRoles: 'Support Specialist,Billing Analyst,Sales Representative',
    },
    {
      name: 'General Shift',
      code: 'GENERAL',
      startTime: '09:00',
      endTime: '17:00',
      durationHours: 8,
      breakDurationMinutes: 60,
      minStaffing: 14,
      color: '#4F46E5',
      description: 'Core peak hours for primary customer contacts',
      requiredRoles: 'Support Specialist,Senior Support Specialist,Technical Lead,Billing Analyst,QA Auditor',
    },
    {
      name: 'Evening Shift',
      code: 'EVENING',
      startTime: '14:00',
      endTime: '22:00',
      durationHours: 8,
      breakDurationMinutes: 45,
      minStaffing: 10,
      color: '#D97706',
      description: 'Afternoon surge, international queue, and escalations',
      requiredRoles: 'Support Specialist,Escalations Engineer,Retention Specialist',
    },
    {
      name: 'Night Shift',
      code: 'NIGHT',
      startTime: '22:00',
      endTime: '06:00',
      durationHours: 8,
      breakDurationMinutes: 60,
      minStaffing: 4,
      color: '#7C3AED',
      description: 'Overnight critical support and incident monitoring',
      requiredRoles: 'Support Specialist,Escalations Engineer,Technical Lead',
    },
    {
      name: 'Peak Support Shift',
      code: 'PEAK',
      startTime: '11:00',
      endTime: '19:00',
      durationHours: 8,
      breakDurationMinutes: 45,
      minStaffing: 6,
      color: '#E11D48',
      description: 'Mid-day surge coverage for high volume spikes',
      requiredRoles: 'Support Specialist,Sales Representative,Billing Analyst',
    },
  ];

  const templateMap = {};
  for (const t of templatesData) {
    const tmpl = await prisma.shiftTemplate.upsert({
      where: {
        organizationId_code: {
          organizationId: org.id,
          code: t.code,
        },
      },
      update: t,
      create: {
        ...t,
        organizationId: org.id,
      },
    });
    templateMap[t.name] = tmpl;
  }

  // 5. Create Employees
  const employeesData = [
    {
      employeeId: 'EMP-1001',
      name: 'Sarah Jenkins',
      email: 'employee@shiftflow.com',
      departmentName: 'Customer Support',
      role: 'Senior Support Specialist',
      seniority: 'Senior',
      maxHoursPerWeek: 40,
      hourlyRate: 28.5,
      status: 'Full-Time',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      skills: ['Omnichannel Zendesk', 'VIP Handling', 'Conflict De-escalation', 'CRM Pro'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    {
      employeeId: 'EMP-1002',
      name: 'David Chen',
      email: 'david.chen@shiftflow.com',
      departmentName: 'Technical Escalations',
      role: 'Technical Lead',
      seniority: 'Lead',
      maxHoursPerWeek: 40,
      hourlyRate: 34.0,
      status: 'Full-Time',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      skills: ['Tier-3 Network Diagnostics', 'Disaster Recovery Lead', 'VIP Handling'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    {
      employeeId: 'EMP-1003',
      name: 'Elena Rostova',
      email: 'elena.rostova@shiftflow.com',
      departmentName: 'Billing & Retention',
      role: 'Billing Analyst',
      seniority: 'Mid',
      maxHoursPerWeek: 35,
      hourlyRate: 24.0,
      status: 'Full-Time',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      skills: ['Stripe Billing Master', 'Enterprise Retention'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    {
      employeeId: 'EMP-1004',
      name: 'Marcus Brody',
      email: 'marcus.brody@shiftflow.com',
      departmentName: 'Inbound Sales',
      role: 'Sales Representative',
      seniority: 'Senior',
      maxHoursPerWeek: 40,
      hourlyRate: 30.0,
      status: 'Full-Time',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      skills: ['High-Value Conversion', 'CRM Pro'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
    },
    {
      employeeId: 'EMP-1005',
      name: 'Aisha Al-Mansoor',
      email: 'aisha.m@shiftflow.com',
      departmentName: 'Quality Assurance',
      role: 'QA Auditor',
      seniority: 'Lead',
      maxHoursPerWeek: 40,
      hourlyRate: 32.5,
      status: 'Full-Time',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      skills: ['Compliance Auditor', 'Conflict De-escalation'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  ];

  const employeeMap = {};
  for (const emp of employeesData) {
    const dept = depts[emp.departmentName] || depts['Customer Support'];
    const createdEmp = await prisma.employee.upsert({
      where: { employeeId: emp.employeeId },
      update: {
        name: emp.name,
        email: emp.email,
        role: emp.role,
        seniority: emp.seniority,
        maxHoursPerWeek: emp.maxHoursPerWeek,
        hourlyRate: emp.hourlyRate,
        status: emp.status,
        avatar: emp.avatar,
        departmentId: dept.id,
        organizationId: org.id,
      },
      create: {
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        seniority: emp.seniority,
        maxHoursPerWeek: emp.maxHoursPerWeek,
        hourlyRate: emp.hourlyRate,
        status: emp.status,
        avatar: emp.avatar,
        departmentId: dept.id,
        organizationId: org.id,
      },
    });
    employeeMap[emp.employeeId] = createdEmp;

    // Attach skills
    for (const skillName of emp.skills) {
      const sk = skillMap[skillName];
      if (sk) {
        await prisma.employeeSkill.upsert({
          where: {
            employeeId_skillId: {
              employeeId: createdEmp.id,
              skillId: sk.id,
            },
          },
          update: {},
          create: {
            employeeId: createdEmp.id,
            skillId: sk.id,
          },
        });
      }
    }

    // Attach availability
    for (const day of emp.availability) {
      await prisma.employeeAvailability.create({
        data: {
          employeeId: createdEmp.id,
          dayOfWeek: day,
          isAvailable: true,
          preferredShiftTypes: 'General Shift,Morning Shift',
          status: 'Approved',
        },
      });
    }
  }

  // 6. Create Seed Users with Bcrypt Hashed Passwords
  const managerPasswordHash = await bcrypt.hash('Manager@123', 10);
  const employeePasswordHash = await bcrypt.hash('Employee@123', 10);

  // Manager User
  await prisma.user.upsert({
    where: { email: 'manager@shiftflow.com' },
    update: {
      passwordHash: managerPasswordHash,
      role: 'MANAGER',
      name: 'Alexandra Vance',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      organizationId: org.id,
    },
    create: {
      email: 'manager@shiftflow.com',
      passwordHash: managerPasswordHash,
      role: 'MANAGER',
      name: 'Alexandra Vance',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      organizationId: org.id,
    },
  });

  // Employee User (Sarah Jenkins EMP-1001)
  const sarahEmp = employeeMap['EMP-1001'];
  await prisma.user.upsert({
    where: { email: 'employee@shiftflow.com' },
    update: {
      passwordHash: employeePasswordHash,
      role: 'EMPLOYEE',
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      employeeId: sarahEmp ? sarahEmp.id : null,
      organizationId: org.id,
    },
    create: {
      email: 'employee@shiftflow.com',
      passwordHash: employeePasswordHash,
      role: 'EMPLOYEE',
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      employeeId: sarahEmp ? sarahEmp.id : null,
      organizationId: org.id,
    },
  });

  // 7. Seed Sample Shifts for Sarah Jenkins (EMP-1001) and David Chen (EMP-1002)
  if (sarahEmp) {
    const shiftDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of shiftDays) {
      const shift = await prisma.assignedShift.create({
        data: {
          employeeId: sarahEmp.id,
          templateId: templateMap['General Shift']?.id,
          day,
          date: '2026-11-09',
          startTime: '09:00',
          endTime: '17:00',
          durationHours: 8,
          role: 'Senior Support Specialist',
          department: 'Customer Support',
          status: 'Published',
          organizationId: org.id,
        },
      });

      // Add Break Schedule
      await prisma.breakSchedule.create({
        data: {
          shiftId: shift.id,
          employeeId: sarahEmp.id,
          breakStart: '12:30',
          breakEnd: '13:15',
          durationMinutes: 45,
          shiftName: 'General Shift',
          status: 'Scheduled',
          organizationId: org.id,
        },
      });
    }
  }

  // 8. Seed Sample Leave Request
  if (sarahEmp) {
    await prisma.leaveRequest.create({
      data: {
        employeeId: sarahEmp.id,
        leaveType: 'Paid Time Off (PTO)',
        startDate: '2026-11-16',
        endDate: '2026-11-17',
        totalDays: 2,
        reason: 'Personal time off for family commitments',
        status: 'Pending',
        submittedAt: 'Today at 09:30 AM',
        organizationId: org.id,
      },
    });
  }

  // 9. Seed Sample Notification
  await prisma.notification.create({
    data: {
      targetEmployeeId: sarahEmp?.employeeId,
      title: 'Weekly Schedule Published',
      message: 'Your official roster for the upcoming week has been approved and published by operations.',
      type: 'success',
      isRead: false,
      organizationId: org.id,
    },
  });

  // 10. Audit Log
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_SEED',
      entityType: 'ORGANIZATION',
      entityId: org.id,
      details: JSON.stringify({ message: 'ShiftFlow production-ready seed initialized' }),
      organizationId: org.id,
    },
  });

  console.log('ShiftFlow seed successfully completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

