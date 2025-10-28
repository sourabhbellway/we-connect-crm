import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const modernBusinessTemplate = {
  name: "Modern Business Proposal",
  description: "A clean, professional business proposal template with modern design",
  category: "business",
  isDefault: true,
  isActive: true,
  variables: {
    companyName: "{{COMPANY_NAME}}",
    companyEmail: "{{COMPANY_EMAIL}}",
    companyPhone: "{{COMPANY_PHONE}}",
    companyAddress: "{{COMPANY_ADDRESS}}",
    companyWebsite: "{{COMPANY_WEBSITE}}",
    clientName: "{{CLIENT_NAME}}",
    clientCompany: "{{CLIENT_COMPANY}}",
    projectTitle: "{{PROJECT_TITLE}}",
    date: "{{DATE}}",
    validUntil: "{{VALID_UNTIL}}",
    totalAmount: "{{TOTAL_AMOUNT}}",
    currency: "{{CURRENCY}}",
  },
  styles: {
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#3b82f6",
    textColor: "#1f2937",
    lightGray: "#f9fafb",
    borderColor: "#e5e7eb",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  headerHtml: `
    <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 60px 40px; text-align: center; border-radius: 8px 8px 0 0;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h1 style="color: white; font-size: 48px; margin: 0 0 16px 0; font-weight: 700; letter-spacing: -1px;">
          {{PROJECT_TITLE}}
        </h1>
        <p style="color: rgba(255, 255, 255, 0.9); font-size: 20px; margin: 0; font-weight: 400;">
          Business Proposal for {{CLIENT_COMPANY}}
        </p>
      </div>
    </div>
  `,
  content: `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; background: white; color: #1f2937;">
      
      <!-- Introduction Section -->
      <section style="margin-bottom: 48px;">
        <div style="border-left: 4px solid #2563eb; padding-left: 24px; margin-bottom: 24px;">
          <h2 style="font-size: 32px; margin: 0 0 8px 0; color: #1f2937; font-weight: 700;">
            Dear {{CLIENT_NAME}},
          </h2>
          <p style="color: #6b7280; font-size: 16px; margin: 0;">
            {{DATE}}
          </p>
        </div>
        
        <div style="line-height: 1.8; font-size: 16px; color: #4b5563;">
          <p style="margin: 0 0 16px 0;">
            Thank you for considering <strong>{{COMPANY_NAME}}</strong> for your upcoming project. 
            We are excited to present this comprehensive proposal that outlines our understanding 
            of your requirements and our approach to delivering exceptional results.
          </p>
          <p style="margin: 0;">
            This proposal is valid until <strong>{{VALID_UNTIL}}</strong>.
          </p>
        </div>
      </section>

      <!-- Executive Summary -->
      <section style="margin-bottom: 48px; background: #f9fafb; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h3 style="font-size: 24px; margin: 0 0 20px 0; color: #1f2937; font-weight: 700; display: flex; align-items: center;">
          <span style="background: #2563eb; width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 12px;"></span>
          Executive Summary
        </h3>
        <p style="line-height: 1.8; margin: 0; font-size: 16px; color: #4b5563;">
          [Provide a brief overview of the proposal, highlighting key benefits and value propositions. 
          Summarize what makes your solution unique and why the client should choose your company.]
        </p>
      </section>

      <!-- Project Overview -->
      <section style="margin-bottom: 48px;">
        <h3 style="font-size: 24px; margin: 0 0 24px 0; color: #1f2937; font-weight: 700; display: flex; align-items: center;">
          <span style="background: #2563eb; width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 12px;"></span>
          Project Overview
        </h3>
        
        <div style="display: grid; gap: 20px;">
          <div style="background: white; border: 1px solid #e5e7eb; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
            <h4 style="font-size: 18px; margin: 0 0 12px 0; color: #2563eb; font-weight: 600;">Objectives</h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #4b5563;">
              <li>Define clear project goals and deliverables</li>
              <li>Establish timeline and milestones</li>
              <li>Outline success metrics and KPIs</li>
            </ul>
          </div>

          <div style="background: white; border: 1px solid #e5e7eb; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
            <h4 style="font-size: 18px; margin: 0 0 12px 0; color: #2563eb; font-weight: 600;">Scope of Work</h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #4b5563;">
              <li>Detailed description of services to be provided</li>
              <li>Phases and deliverables breakdown</li>
              <li>Client responsibilities and requirements</li>
            </ul>
          </div>

          <div style="background: white; border: 1px solid #e5e7eb; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
            <h4 style="font-size: 18px; margin: 0 0 12px 0; color: #2563eb; font-weight: 600;">Methodology</h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #4b5563;">
              <li>Our proven approach and best practices</li>
              <li>Tools and technologies to be utilized</li>
              <li>Quality assurance procedures</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Timeline -->
      <section style="margin-bottom: 48px;">
        <h3 style="font-size: 24px; margin: 0 0 24px 0; color: #1f2937; font-weight: 700; display: flex; align-items: center;">
          <span style="background: #2563eb; width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 12px;"></span>
          Project Timeline
        </h3>
        
        <div style="position: relative; padding-left: 40px;">
          <!-- Timeline item 1 -->
          <div style="position: relative; margin-bottom: 32px;">
            <div style="position: absolute; left: -40px; top: 4px; width: 16px; height: 16px; background: #2563eb; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #2563eb;"></div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 3px solid #2563eb;">
              <h4 style="font-size: 18px; margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">Phase 1: Discovery & Planning</h4>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Week 1-2</p>
              <p style="margin: 0; color: #4b5563; line-height: 1.6;">Initial consultation, requirements gathering, and project planning.</p>
            </div>
          </div>

          <!-- Timeline item 2 -->
          <div style="position: relative; margin-bottom: 32px;">
            <div style="position: absolute; left: -40px; top: 4px; width: 16px; height: 16px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3b82f6;"></div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 3px solid #3b82f6;">
              <h4 style="font-size: 18px; margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">Phase 2: Design & Development</h4>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Week 3-6</p>
              <p style="margin: 0; color: #4b5563; line-height: 1.6;">Implementation of agreed-upon solutions and regular progress updates.</p>
            </div>
          </div>

          <!-- Timeline item 3 -->
          <div style="position: relative; margin-bottom: 32px;">
            <div style="position: absolute; left: -40px; top: 4px; width: 16px; height: 16px; background: #60a5fa; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #60a5fa;"></div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 3px solid #60a5fa;">
              <h4 style="font-size: 18px; margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">Phase 3: Testing & Review</h4>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Week 7-8</p>
              <p style="margin: 0; color: #4b5563; line-height: 1.6;">Quality assurance, client review, and necessary refinements.</p>
            </div>
          </div>

          <!-- Timeline item 4 -->
          <div style="position: relative;">
            <div style="position: absolute; left: -40px; top: 4px; width: 16px; height: 16px; background: #10b981; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #10b981;"></div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 3px solid #10b981;">
              <h4 style="font-size: 18px; margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">Phase 4: Launch & Support</h4>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Week 9+</p>
              <p style="margin: 0; color: #4b5563; line-height: 1.6;">Final delivery, training, and ongoing support services.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Investment -->
      <section style="margin-bottom: 48px;">
        <h3 style="font-size: 24px; margin: 0 0 24px 0; color: #1f2937; font-weight: 700; display: flex; align-items: center;">
          <span style="background: #2563eb; width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 12px;"></span>
          Investment
        </h3>
        
        <div style="background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%); border: 2px solid #e5e7eb; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Total Investment</p>
          <p style="margin: 0; font-size: 56px; font-weight: 700; color: #2563eb; line-height: 1;">
            {{CURRENCY}} {{TOTAL_AMOUNT}}
          </p>
          <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 14px;">
            Payment terms and schedule to be discussed
          </p>
        </div>
        
        <div style="margin-top: 24px; padding: 20px; background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af; line-height: 1.6;">
            <strong>Note:</strong> This investment includes all services outlined in the scope of work. 
            Additional costs may apply for services outside the agreed scope.
          </p>
        </div>
      </section>

      <!-- Why Choose Us -->
      <section style="margin-bottom: 48px;">
        <h3 style="font-size: 24px; margin: 0 0 24px 0; color: #1f2937; font-weight: 700; display: flex; align-items: center;">
          <span style="background: #2563eb; width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 12px;"></span>
          Why Choose Us
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="text-align: center; padding: 24px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="width: 64px; height: 64px; background: #eff6ff; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px; color: #2563eb;">⚡</span>
            </div>
            <h4 style="margin: 0 0 8px 0; font-size: 18px; color: #1f2937; font-weight: 600;">Fast Delivery</h4>
            <p style="margin: 0; color: #6b7280; line-height: 1.6; font-size: 14px;">We deliver on time, every time</p>
          </div>

          <div style="text-align: center; padding: 24px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="width: 64px; height: 64px; background: #eff6ff; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px; color: #2563eb;">🎯</span>
            </div>
            <h4 style="margin: 0 0 8px 0; font-size: 18px; color: #1f2937; font-weight: 600;">Expert Team</h4>
            <p style="margin: 0; color: #6b7280; line-height: 1.6; font-size: 14px;">Highly skilled professionals</p>
          </div>

          <div style="text-align: center; padding: 24px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="width: 64px; height: 64px; background: #eff6ff; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px; color: #2563eb;">💎</span>
            </div>
            <h4 style="margin: 0 0 8px 0; font-size: 18px; color: #1f2937; font-weight: 600;">Quality Focus</h4>
            <p style="margin: 0; color: #6b7280; line-height: 1.6; font-size: 14px;">Excellence in every detail</p>
          </div>

          <div style="text-align: center; padding: 24px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="width: 64px; height: 64px; background: #eff6ff; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px; color: #2563eb;">🤝</span>
            </div>
            <h4 style="margin: 0 0 8px 0; font-size: 18px; color: #1f2937; font-weight: 600;">Full Support</h4>
            <p style="margin: 0; color: #6b7280; line-height: 1.6; font-size: 14px;">Dedicated ongoing assistance</p>
          </div>
        </div>
      </section>

      <!-- Next Steps -->
      <section style="margin-bottom: 48px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px; border-radius: 12px; color: white;">
        <h3 style="font-size: 24px; margin: 0 0 20px 0; font-weight: 700; color: white;">
          Ready to Get Started?
        </h3>
        <p style="line-height: 1.8; margin: 0 0 24px 0; color: rgba(255, 255, 255, 0.9);">
          We're excited to work with you on this project. To proceed, simply review this proposal 
          and let us know if you have any questions or would like to schedule a call to discuss further.
        </p>
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">
          <p style="margin: 0 0 12px 0; font-weight: 600; color: white;">Next Steps:</p>
          <ol style="margin: 0; padding-left: 20px; line-height: 1.8; color: rgba(255, 255, 255, 0.9);">
            <li>Review this proposal</li>
            <li>Contact us with any questions</li>
            <li>Sign the agreement</li>
            <li>Let's get started!</li>
          </ol>
        </div>
      </section>

    </div>
  `,
  footerHtml: `
    <div style="background: #1f2937; padding: 40px; text-align: center; border-radius: 0 0 8px 8px; color: white;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h3 style="margin: 0 0 16px 0; font-size: 24px; color: white; font-weight: 700;">
          {{COMPANY_NAME}}
        </h3>
        <div style="margin-bottom: 20px; line-height: 1.8; color: rgba(255, 255, 255, 0.8);">
          <p style="margin: 0;">{{COMPANY_ADDRESS}}</p>
          <p style="margin: 8px 0 0 0;">
            <a href="mailto:{{COMPANY_EMAIL}}" style="color: #60a5fa; text-decoration: none;">{{COMPANY_EMAIL}}</a> | 
            <a href="tel:{{COMPANY_PHONE}}" style="color: #60a5fa; text-decoration: none;">{{COMPANY_PHONE}}</a>
          </p>
          <p style="margin: 8px 0 0 0;">
            <a href="{{COMPANY_WEBSITE}}" style="color: #60a5fa; text-decoration: none;">{{COMPANY_WEBSITE}}</a>
          </p>
        </div>
        <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; font-size: 14px; color: rgba(255, 255, 255, 0.6);">
          <p style="margin: 0;">© {{DATE}} {{COMPANY_NAME}}. All rights reserved.</p>
          <p style="margin: 8px 0 0 0;">This proposal is confidential and intended solely for the named recipient.</p>
        </div>
      </div>
    </div>
  `,
};

const minimalTemplate = {
  name: "Minimal Clean Proposal",
  description: "A minimalist proposal template with focus on content",
  category: "business",
  isDefault: false,
  isActive: true,
  variables: modernBusinessTemplate.variables,
  styles: {
    primaryColor: "#000000",
    textColor: "#333333",
    lightGray: "#fafafa",
    borderColor: "#e0e0e0",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  headerHtml: `
    <div style="padding: 60px 40px; border-bottom: 2px solid #000000;">
      <h1 style="font-size: 42px; margin: 0; font-weight: 300; letter-spacing: -0.5px;">
        {{PROJECT_TITLE}}
      </h1>
      <p style="margin: 12px 0 0 0; font-size: 16px; color: #666666;">
        Prepared for {{CLIENT_COMPANY}}
      </p>
    </div>
  `,
  content: `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 60px 40px; color: #333333;">
      
      <section style="margin-bottom: 60px;">
        <p style="font-size: 18px; line-height: 1.8; margin: 0 0 20px 0;">
          Dear {{CLIENT_NAME}},
        </p>
        <p style="font-size: 16px; line-height: 1.8; margin: 0; color: #666666;">
          Thank you for the opportunity to submit this proposal. We understand your needs 
          and are confident we can deliver exceptional results.
        </p>
      </section>

      <section style="margin-bottom: 60px;">
        <h2 style="font-size: 28px; margin: 0 0 24px 0; font-weight: 400; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px;">
          Overview
        </h2>
        <p style="line-height: 1.8; margin: 0; color: #666666;">
          [Insert project overview and objectives here]
        </p>
      </section>

      <section style="margin-bottom: 60px;">
        <h2 style="font-size: 28px; margin: 0 0 24px 0; font-weight: 400; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px;">
          Deliverables
        </h2>
        <ul style="line-height: 2; margin: 0; padding-left: 20px; color: #666666;">
          <li>Deliverable item one</li>
          <li>Deliverable item two</li>
          <li>Deliverable item three</li>
        </ul>
      </section>

      <section style="margin-bottom: 60px;">
        <h2 style="font-size: 28px; margin: 0 0 24px 0; font-weight: 400; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px;">
          Investment
        </h2>
        <div style="background: #fafafa; padding: 40px; text-align: center; border: 1px solid #e0e0e0;">
          <p style="margin: 0; font-size: 48px; font-weight: 300; color: #000000;">
            {{CURRENCY}} {{TOTAL_AMOUNT}}
          </p>
        </div>
      </section>

    </div>
  `,
  footerHtml: `
    <div style="border-top: 2px solid #000000; padding: 40px; text-align: center;">
      <p style="margin: 0; font-weight: 600;">{{COMPANY_NAME}}</p>
      <p style="margin: 8px 0 0 0; color: #666666; font-size: 14px;">
        {{COMPANY_EMAIL}} | {{COMPANY_PHONE}}
      </p>
    </div>
  `,
};

export async function seedProposalTemplates() {
  console.log("Seeding proposal templates...");

  try {
    // Check if templates already exist
    const existingCount = await prisma.proposalTemplate.count();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing templates. Skipping seed.`);
      return;
    }

    // Create modern business template
    await prisma.proposalTemplate.create({
      data: modernBusinessTemplate,
    });
    console.log("✅ Created: Modern Business Proposal template");

    // Create minimal template
    await prisma.proposalTemplate.create({
      data: minimalTemplate,
    });
    console.log("✅ Created: Minimal Clean Proposal template");

    console.log("✅ Proposal templates seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding proposal templates:", error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedProposalTemplates()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
