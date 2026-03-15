import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, company, phone,
      projectType, serviceCategory,
      title, description, features,
      complexity, hasDesign, needsHosting,
      needsAuth, needsIntegrations, integrationNotes,
      desiredTimeline,
      // from calculateEstimate spread: { low, high, weeks }
      low, high, weeks,
      // also accept explicit keys if sent that way
      estimatedLow: _estimatedLow, estimatedHigh: _estimatedHigh, estimatedWeeks: _estimatedWeeks,
      // UTM attribution
      utmSource, utmCampaign, utmMedium,
    } = body;

    if (!name || !email || !title || !description) {
      return NextResponse.json({ error: 'Name, email, title, and description are required' }, { status: 400 });
    }

    const resolvedLow   = Number(_estimatedLow  ?? low  ?? 0);
    const resolvedHigh  = Number(_estimatedHigh ?? high  ?? 0);
    const resolvedWeeks = Number(_estimatedWeeks ?? weeks ?? 0);

    const inquiry = await (prisma as any).projectInquiry.create({
      data: {
        name, email,
        company: company || null,
        phone: phone || null,
        projectType,
        serviceCategory: serviceCategory || '',
        title,
        description,
        features: features || [],
        complexity: complexity || 'moderate',
        hasDesign: hasDesign || false,
        needsHosting: needsHosting || false,
        needsAuth: needsAuth || false,
        needsIntegrations: needsIntegrations || false,
        integrationNotes: integrationNotes || null,
        desiredTimeline: desiredTimeline || 'flexible',
        estimatedLow:   resolvedLow,
        estimatedHigh:  resolvedHigh,
        estimatedWeeks: resolvedWeeks,
        utmSource:    utmSource  || null,
        utmCampaign:  utmCampaign || null,
        utmMedium:    utmMedium  || null,
      },
    });

    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (err) {
    console.error('Pricing inquiry error:', err);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const inquiries = await (prisma as any).projectInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ inquiries });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}
