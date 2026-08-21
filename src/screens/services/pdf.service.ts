import RNHTMLtoPDF from 'react-native-html-to-pdf';
import type { CVData } from '../types/cv';

export type TemplateId =
  | 'classic'
  | 'modern'
  | 'classic_professional'
  | 'modern_dark'
  | 'minimalist_clean'
  | 'executive'
  | 'creative'
  | 'two_column'
  | 'tech'
  | 'corporate'
  | 'elegant'
  | 'student';

function buildExperienceHtml(data: CVData, template: TemplateId): string {
  if (!data.experience || data.experience.length === 0) {
    return `<p style="color:#999;font-style:italic;">No experience added yet</p>`;
  }

  return data.experience
    .map((e) => {
      switch (template) {
        case 'classic_professional':
          return `
            <div style="margin-bottom:12px;">
              <div style="color:#333333;font-size:14px;font-weight:bold;">${e.role}</div>
              <div style="color:#555555;font-size:13px;">${e.company}</div>
              <div style="color:#777777;font-size:13px;">${e.startDate} – ${e.endDate}</div>
              ${e.description ? `<p style="margin:4px 0 0;color:#444;font-size:13px;">${e.description}</p>` : ''}
            </div>`;
        case 'modern_dark':
          return `
            <div style="margin-bottom:12px;">
              <div style="color:#ffffff;font-size:13px;font-weight:bold;">${e.role}</div>
              <div style="color:#aaaaaa;font-size:12px;">${e.company}</div>
              <div style="color:#aaaaaa;font-size:12px;">${e.startDate} – ${e.endDate}</div>
              ${e.description ? `<p style="margin:4px 0 0;color:#cccccc;font-size:12px;">${e.description}</p>` : ''}
            </div>`;
        case 'minimalist_clean':
          return `
            <div style="margin-bottom:12px;">
              <div style="color:#111111;font-size:14px;font-weight:bold;">${e.role}</div>
              <div style="color:#333333;font-size:13px;">${e.company}</div>
              <div style="color:#888888;font-size:12px;">${e.startDate} – ${e.endDate}</div>
              ${e.description ? `<p style="margin:4px 0 0;color:#444;font-size:13px;">${e.description}</p>` : ''}
            </div>`;
        case 'modern':
          return `
            <div style="margin-bottom:16px;border-left:3px solid #1d4ed8;padding-left:12px;">
              <strong style="font-size:14px;color:#1d4ed8;">${e.role}</strong>
              <div style="color:#333;font-weight:600;">${e.company}</div>
              <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">
                ${e.startDate} – ${e.endDate}
              </span>
              <p style="margin:6px 0 0;color:#444;">${e.description}</p>
            </div>`;
        case 'classic':
        default:
          return `
            <div style="margin-bottom:14px;">
              <div style="display:flex;justify-content:space-between;">
                <strong style="font-size:14px;">${e.role}, ${e.company}</strong>
                <span style="color:#666;font-size:12px;">${e.startDate} – ${e.endDate}</span>
              </div>
              <p style="margin:4px 0 0;color:#333;">${e.description}</p>
            </div>`;
      }
    })
    .join('');
}

function buildEducationHtml(data: CVData, template: TemplateId): string {
  if (!data.education || data.education.length === 0) {
    return `<p style="color:#999;font-style:italic;">No education added yet</p>`;
  }

  return data.education
    .map((ed) => {
      switch (template) {
        case 'classic_professional':
          return `
            <div style="margin-bottom:12px;">
              <div style="color:#333333;font-size:14px;font-weight:bold;">${ed.degree}</div>
              <div style="color:#555555;font-size:13px;">${ed.school}</div>
              <div style="color:#777777;font-size:13px;">${ed.startDate} – ${ed.endDate}</div>
            </div>`;
        case 'modern_dark':
          return `
            <div style="margin-bottom:12px;">
              <div style="color:#ffffff;font-size:13px;font-weight:bold;">${ed.degree}</div>
              <div style="color:#aaaaaa;font-size:12px;">${ed.school}</div>
              <div style="color:#aaaaaa;font-size:12px;">${ed.startDate} – ${ed.endDate}</div>
            </div>`;
        case 'minimalist_clean':
          return `
            <div style="margin-bottom:12px;">
              <div style="color:#111111;font-size:14px;font-weight:bold;">${ed.degree}</div>
              <div style="color:#333333;font-size:13px;">${ed.school}</div>
              <div style="color:#888888;font-size:12px;">${ed.startDate} – ${ed.endDate}</div>
            </div>`;
        case 'modern':
          return `
            <div style="margin-bottom:12px;border-left:3px solid #1d4ed8;padding-left:12px;">
              <strong style="color:#1d4ed8;">${ed.degree}</strong>
              <div style="color:#333;">${ed.school}</div>
              <span style="color:#888;font-size:11px;">${ed.startDate} – ${ed.endDate}</span>
            </div>`;
        case 'classic':
        default:
          return `
            <div style="margin-bottom:10px;">
              <strong>${ed.degree}, ${ed.school}</strong><br/>
              <span style="color:#666;font-size:12px;">${ed.startDate} – ${ed.endDate}</span>
            </div>`;
      }
    })
    .join('');
}

function buildCVHtml(data: CVData, template: TemplateId): string {
  const { personalInfo, skills = [] } = data;
  const experienceHtml = buildExperienceHtml(data, template);
  const educationHtml = buildEducationHtml(data, template);

  // Template: Classic Professional
  if (template === 'classic_professional') {
    return `
      <html>
        <body style="font-family:Arial, sans-serif; background-color:#f4f4f4; margin:0; padding:0;">
          <div style="background-color:#1a3c6e; padding:30px 20px; text-align:center;">
            <h1 style="color:#ffffff; font-size:28px; margin:0; font-weight:bold;">${personalInfo.fullName}</h1>
            <p style="color:#a8c4e0; font-size:14px; margin:8px 0 0;">
              ${personalInfo.email || ''} &nbsp;|&nbsp; ${personalInfo.phone || ''} &nbsp;|&nbsp; ${personalInfo.location || ''}
            </p>
          </div>

          <div style="background-color:#ffffff; padding:20px 30px;">
            <h2 style="color:#1a3c6e; font-size:16px; margin:0 0 6px; font-weight:bold;">Career Objective</h2>
            <hr style="border:none; border-top:2px solid #1a3c6e; margin:0 0 12px 0;" />
            <p style="color:#444444; font-size:13px; margin:0;">${personalInfo.summary || 'N/A'}</p>
          </div>

          <div style="background-color:#f9f9f9; padding:20px 30px;">
            <h2 style="color:#1a3c6e; font-size:16px; margin:0 0 6px; font-weight:bold;">Education</h2>
            <hr style="border:none; border-top:2px solid #1a3c6e; margin:0 0 12px 0;" />
            ${educationHtml}
          </div>

          <div style="background-color:#ffffff; padding:20px 30px;">
            <h2 style="color:#1a3c6e; font-size:16px; margin:0 0 6px; font-weight:bold;">Work Experience</h2>
            <hr style="border:none; border-top:2px solid #1a3c6e; margin:0 0 12px 0;" />
            ${experienceHtml}
          </div>

          <div style="background-color:#f9f9f9; padding:20px 30px;">
            <h2 style="color:#1a3c6e; font-size:15px; margin:0 0 6px; font-weight:bold;">Skills</h2>
            <p style="color:#444444; font-size:13px; margin:0;">${skills.join(', ') || 'None specified'}</p>
          </div>
        </body>
      </html>
    `;
  }

  // Template: Modern Dark
  if (template === 'modern_dark') {
    return `
      <html>
        <body style="font-family:Georgia, serif; background-color:#1e1e2e; color:#ffffff; margin:0; padding:0;">
          <table style="width:100%; background-color:#12121f; padding:35px 25px; border-collapse:collapse;">
            <tr>
              <td style="width:50%; vertical-align:top;">
                <h1 style="color:#e0c060; font-size:26px; margin:0; font-weight:bold;">${personalInfo.fullName}</h1>
              </td>
              <td style="width:50%; vertical-align:top; text-align:right; color:#cccccc; font-size:12px; line-height:1.6;">
                📧 ${personalInfo.email || ''}<br/>
                📞 ${personalInfo.phone || ''}<br/>
                📍 ${personalInfo.location || ''}
              </td>
            </tr>
          </table>

          <div style="background-color:#2a2a3e; padding:18px 25px;">
            <h2 style="color:#e0c060; font-size:15px; margin:0 0 8px; font-weight:bold;">ABOUT ME</h2>
            <p style="color:#cccccc; font-size:13px; margin:0;">${personalInfo.summary || 'N/A'}</p>
          </div>

          <table style="width:100%; background-color:#1e1e2e; padding:18px 25px; border-collapse:collapse;">
            <tr>
              <td style="width:50%; vertical-align:top; padding-right:15px;">
                <h2 style="color:#e0c060; font-size:15px; margin:0 0 10px; font-weight:bold;">EDUCATION</h2>
                ${educationHtml}
              </td>
              <td style="width:50%; vertical-align:top; padding-left:15px;">
                <h2 style="color:#e0c060; font-size:15px; margin:0 0 10px; font-weight:bold;">EXPERIENCE</h2>
                ${experienceHtml}
              </td>
            </tr>
          </table>

          <div style="background-color:#2a2a3e; padding:18px 25px;">
            <h2 style="color:#e0c060; font-size:15px; margin:0 0 8px; font-weight:bold;">SKILLS</h2>
            <p style="color:#cccccc; font-size:13px; margin:0;">${skills.join(' • ') || 'None specified'}</p>
          </div>
        </body>
      </html>
    `;
  }

  // Template: Minimalist Clean
  if (template === 'minimalist_clean') {
    return `
      <html>
        <body style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#ffffff; margin:0; padding:0;">
          <div style="padding:30px 40px 10px 40px;">
            <h1 style="color:#111111; font-size:32px; font-weight:300; letter-spacing:3px; margin:0;">${personalInfo.fullName}</h1>
            <div style="width:60px; height:3px; background-color:#27ae60; margin:12px 0;"></div>
            <p style="color:#555555; font-size:13px; margin:8px 0 0;">
              ${personalInfo.email || ''} &nbsp;&bull;&nbsp; ${personalInfo.phone || ''} &nbsp;&bull;&nbsp; ${personalInfo.location || ''}
            </p>
          </div>

          <div style="padding:10px 40px;">
            <h2 style="color:#27ae60; font-size:13px; font-weight:bold; letter-spacing:2px; margin:0 0 6px;">PROFILE</h2>
            <p style="color:#333333; font-size:13px; margin:0;">${personalInfo.summary || 'N/A'}</p>
          </div>
          <hr style="border:none; border-top:1px solid #eeeeee; margin:10px 40px;" />

          <table style="width:100%; border-collapse:collapse; padding:0 40px;">
            <tr>
              <td style="width:25%; vertical-align:top; padding:10px 0;">
                <h2 style="color:#27ae60; font-size:13px; font-weight:bold; letter-spacing:2px; margin:0;">EDUCATION</h2>
              </td>
              <td style="width:75%; vertical-align:top; padding:10px 0;">
                ${educationHtml}
              </td>
            </tr>
          </table>
          <hr style="border:none; border-top:1px solid #eeeeee; margin:0 40px;" />

          <table style="width:100%; border-collapse:collapse; padding:0 40px;">
            <tr>
              <td style="width:25%; vertical-align:top; padding:10px 0;">
                <h2 style="color:#27ae60; font-size:13px; font-weight:bold; letter-spacing:2px; margin:0;">EXPERIENCE</h2>
              </td>
              <td style="width:75%; vertical-align:top; padding:10px 0;">
                ${experienceHtml}
              </td>
            </tr>
          </table>
          <hr style="border:none; border-top:1px solid #eeeeee; margin:0 40px;" />

          <table style="width:100%; border-collapse:collapse; padding:0 40px;">
            <tr>
              <td style="width:25%; vertical-align:top; padding:10px 0;">
                <h2 style="color:#27ae60; font-size:13px; font-weight:bold; letter-spacing:2px; margin:0;">SKILLS</h2>
              </td>
              <td style="width:75%; vertical-align:top; padding:10px 0; color:#333333; font-size:13px;">
                ${skills.join(' • ') || 'None specified'}
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  // Template: Modern
  if (template === 'modern') {
    return `
      <html>
        <body style="font-family:Helvetica,Arial,sans-serif;margin:0;">
          <div style="background:#1d4ed8;color:#fff;padding:28px 32px;">
            <h1 style="margin:0;font-size:28px;">${personalInfo.fullName}</h1>
            <p style="margin:6px 0 0;opacity:0.9;">
              ${personalInfo.email} • ${personalInfo.phone} • ${personalInfo.location}
            </p>
          </div>
          <div style="padding:24px 32px;">
            <h2 style="color:#1d4ed8;font-size:14px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1d4ed8;padding-bottom:4px;">
              Experience
            </h2>
            ${experienceHtml}

            <h2 style="color:#1d4ed8;font-size:14px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1d4ed8;padding-bottom:4px;margin-top:20px;">
              Education
            </h2>
            ${educationHtml}

            <h2 style="color:#1d4ed8;font-size:14px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1d4ed8;padding-bottom:4px;margin-top:20px;">
              Skills
            </h2>
            <div>
              ${skills
                .map(
                  (s) =>
                    `<span style="display:inline-block;background:#eff6ff;color:#1d4ed8;padding:4px 10px;border-radius:12px;font-size:12px;margin:0 6px 6px 0;">${s}</span>`
                )
                .join('') || '<p style="color:#999;">No skills added yet</p>'}
            </div>
          </div>
        </body>
      </html>
    `;
  }

    // ============================================================
  // TEMPLATE: EXECUTIVE
  // ============================================================
  if (template === 'executive') {
    return `
      <html>
        <body style="
          font-family:Arial,Helvetica,sans-serif;
          margin:0;
          padding:0;
          color:#222;
          background:#ffffff;
        ">

          <div style="
            background:#172033;
            color:white;
            padding:35px 40px;
          ">
            <h1 style="
              margin:0;
              font-size:30px;
              letter-spacing:1px;
            ">
              ${personalInfo.fullName}
            </h1>

            <p style="
              margin:10px 0 0;
              color:#d5d9e2;
              font-size:13px;
            ">
              ${personalInfo.email || ''}
              ${personalInfo.phone ? ` | ${personalInfo.phone}` : ''}
              ${personalInfo.location ? ` | ${personalInfo.location}` : ''}
            </p>
          </div>

          <div style="padding:25px 40px;">

            <h2 style="
              color:#172033;
              font-size:15px;
              text-transform:uppercase;
              letter-spacing:1.5px;
              border-bottom:2px solid #172033;
              padding-bottom:6px;
            ">
              Professional Summary
            </h2>

            <p style="font-size:13px;line-height:1.6;color:#444;">
              ${personalInfo.summary || 'N/A'}
            </p>

            <h2 style="
              color:#172033;
              font-size:15px;
              text-transform:uppercase;
              letter-spacing:1.5px;
              border-bottom:2px solid #172033;
              padding-bottom:6px;
              margin-top:25px;
            ">
              Professional Experience
            </h2>

            ${experienceHtml}

            <h2 style="
              color:#172033;
              font-size:15px;
              text-transform:uppercase;
              letter-spacing:1.5px;
              border-bottom:2px solid #172033;
              padding-bottom:6px;
              margin-top:25px;
            ">
              Education
            </h2>

            ${educationHtml}

            <h2 style="
              color:#172033;
              font-size:15px;
              text-transform:uppercase;
              letter-spacing:1.5px;
              border-bottom:2px solid #172033;
              padding-bottom:6px;
              margin-top:25px;
            ">
              Core Skills
            </h2>

            <p style="
              font-size:13px;
              line-height:1.8;
              color:#444;
            ">
              ${skills.join(' • ') || 'No skills added yet'}
            </p>

          </div>

        </body>
      </html>
    `;
  }


  // ============================================================
  // TEMPLATE: CREATIVE
  // ============================================================
  if (template === 'creative') {
    return `
      <html>
        <body style="
          font-family:Arial,Helvetica,sans-serif;
          margin:0;
          background:#ffffff;
          color:#222;
        ">

          <div style="
            background:#6c2bd9;
            padding:35px 35px 30px;
            color:#ffffff;
          ">

            <h1 style="
              margin:0;
              font-size:32px;
              font-weight:bold;
            ">
              ${personalInfo.fullName}
            </h1>

            <div style="
              margin-top:10px;
              font-size:12px;
              color:#eee;
            ">
              ${personalInfo.email || ''}
              ${personalInfo.phone ? ` • ${personalInfo.phone}` : ''}
              ${personalInfo.location ? ` • ${personalInfo.location}` : ''}
            </div>

          </div>

          <div style="padding:25px 35px;">

            <h2 style="
              color:#6c2bd9;
              font-size:17px;
              margin-bottom:8px;
            ">
              About Me
            </h2>

            <p style="
              font-size:13px;
              line-height:1.6;
              color:#444;
            ">
              ${personalInfo.summary || 'N/A'}
            </p>

            <div style="
              height:3px;
              background:#6c2bd9;
              margin:20px 0;
            "></div>

            <h2 style="color:#6c2bd9;font-size:17px;">
              Experience
            </h2>

            ${experienceHtml}

            <h2 style="
              color:#6c2bd9;
              font-size:17px;
              margin-top:22px;
            ">
              Education
            </h2>

            ${educationHtml}

            <h2 style="
              color:#6c2bd9;
              font-size:17px;
              margin-top:22px;
            ">
              Skills
            </h2>

            <div style="margin-top:8px;">
              ${
                skills
                  .map(
                    (s) => `
                      <span style="
                        display:inline-block;
                        background:#f0eaff;
                        color:#6c2bd9;
                        padding:6px 12px;
                        margin:4px;
                        font-size:12px;
                        border-radius:14px;
                      ">
                        ${s}
                      </span>
                    `
                  )
                  .join('') || 'No skills added yet'
              }
            </div>

          </div>

        </body>
      </html>
    `;
  }


  // ============================================================
  // TEMPLATE: TWO COLUMN
  // ============================================================
  if (template === 'two_column') {
    return `
      <html>
        <body style="
          font-family:Arial,Helvetica,sans-serif;
          margin:0;
          padding:0;
          color:#222;
        ">

          <table style="
            width:100%;
            border-collapse:collapse;
          ">

            <tr>

              <!-- LEFT SIDEBAR -->
              <td style="
                width:30%;
                background:#263238;
                color:#ffffff;
                vertical-align:top;
                padding:30px 20px;
              ">

                <h1 style="
                  font-size:24px;
                  margin:0 0 20px;
                ">
                  ${personalInfo.fullName}
                </h1>

                <h3 style="
                  color:#90caf9;
                  font-size:13px;
                  text-transform:uppercase;
                  border-bottom:1px solid #607d8b;
                  padding-bottom:6px;
                ">
                  Contact
                </h3>

                <p style="font-size:11px;line-height:1.8;color:#ddd;">
                  ${personalInfo.email || ''}<br/>
                  ${personalInfo.phone || ''}<br/>
                  ${personalInfo.location || ''}
                </p>

                <h3 style="
                  color:#90caf9;
                  font-size:13px;
                  text-transform:uppercase;
                  border-bottom:1px solid #607d8b;
                  padding-bottom:6px;
                  margin-top:25px;
                ">
                  Skills
                </h3>

                <p style="
                  font-size:11px;
                  line-height:2;
                  color:#ddd;
                ">
                  ${skills.join('<br/>') || 'No skills added yet'}
                </p>

              </td>

              <!-- MAIN CONTENT -->
              <td style="
                width:70%;
                vertical-align:top;
                padding:30px 25px;
              ">

                <h2 style="
                  color:#263238;
                  font-size:15px;
                  border-bottom:2px solid #263238;
                  padding-bottom:5px;
                ">
                  PROFILE
                </h2>

                <p style="
                  font-size:13px;
                  line-height:1.6;
                  color:#444;
                ">
                  ${personalInfo.summary || 'N/A'}
                </p>

                <h2 style="
                  color:#263238;
                  font-size:15px;
                  border-bottom:2px solid #263238;
                  padding-bottom:5px;
                  margin-top:22px;
                ">
                  EXPERIENCE
                </h2>

                ${experienceHtml}

                <h2 style="
                  color:#263238;
                  font-size:15px;
                  border-bottom:2px solid #263238;
                  padding-bottom:5px;
                  margin-top:22px;
                ">
                  EDUCATION
                </h2>

                ${educationHtml}

              </td>

            </tr>

          </table>

        </body>
      </html>
    `;
  }


  // ============================================================
  // TEMPLATE: TECH
  // ============================================================
  if (template === 'tech') {
    return `
      <html>
        <body style="
          font-family:Courier New,monospace;
          margin:0;
          padding:30px;
          background:#ffffff;
          color:#222;
        ">

          <div style="
            border-left:6px solid #00a884;
            padding-left:18px;
            margin-bottom:25px;
          ">

            <h1 style="
              margin:0;
              font-size:28px;
              color:#111;
            ">
              ${personalInfo.fullName}
            </h1>

            <p style="
              color:#00a884;
              font-size:12px;
              margin:7px 0;
            ">
              ${personalInfo.email || ''}
              ${personalInfo.phone ? ` | ${personalInfo.phone}` : ''}
              ${personalInfo.location ? ` | ${personalInfo.location}` : ''}
            </p>

          </div>

          <h2 style="
            font-size:14px;
            color:#00a884;
            border-bottom:1px solid #00a884;
            padding-bottom:5px;
          ">
            // SUMMARY
          </h2>

          <p style="
            font-size:12px;
            line-height:1.7;
          ">
            ${personalInfo.summary || 'N/A'}
          </p>

          <h2 style="
            font-size:14px;
            color:#00a884;
            border-bottom:1px solid #00a884;
            padding-bottom:5px;
            margin-top:20px;
          ">
            // EXPERIENCE
          </h2>

          ${experienceHtml}

          <h2 style="
            font-size:14px;
            color:#00a884;
            border-bottom:1px solid #00a884;
            padding-bottom:5px;
            margin-top:20px;
          ">
            // EDUCATION
          </h2>

          ${educationHtml}

          <h2 style="
            font-size:14px;
            color:#00a884;
            border-bottom:1px solid #00a884;
            padding-bottom:5px;
            margin-top:20px;
          ">
            // SKILLS
          </h2>

          <p style="
            font-size:12px;
            line-height:2;
            color:#333;
          ">
            ${skills.join('  |  ') || 'No skills added yet'}
          </p>

        </body>
      </html>
    `;
  }


  // ============================================================
  // TEMPLATE: CORPORATE
  // ============================================================
  if (template === 'corporate') {
    return `
      <html>
        <body style="
          font-family:Arial,Helvetica,sans-serif;
          margin:0;
          padding:35px;
          color:#222;
          background:#ffffff;
        ">

          <div style="
            text-align:center;
            border-bottom:3px solid #0f766e;
            padding-bottom:18px;
          ">

            <h1 style="
              margin:0;
              font-size:27px;
              color:#12343b;
            ">
              ${personalInfo.fullName}
            </h1>

            <p style="
              margin:8px 0 0;
              color:#666;
              font-size:12px;
            ">
              ${personalInfo.email || ''}
              ${personalInfo.phone ? ` | ${personalInfo.phone}` : ''}
              ${personalInfo.location ? ` | ${personalInfo.location}` : ''}
            </p>

          </div>

          <h2 style="
            color:#0f766e;
            font-size:14px;
            margin-top:22px;
            text-transform:uppercase;
          ">
            Professional Profile
          </h2>

          <p style="
            font-size:12px;
            line-height:1.7;
            color:#444;
          ">
            ${personalInfo.summary || 'N/A'}
          </p>

          <h2 style="
            color:#0f766e;
            font-size:14px;
            margin-top:22px;
            text-transform:uppercase;
          ">
            Work Experience
          </h2>

          ${experienceHtml}

          <h2 style="
            color:#0f766e;
            font-size:14px;
            margin-top:22px;
            text-transform:uppercase;
          ">
            Education
          </h2>

          ${educationHtml}

          <h2 style="
            color:#0f766e;
            font-size:14px;
            margin-top:22px;
            text-transform:uppercase;
          ">
            Skills
          </h2>

          <p style="
            font-size:12px;
            line-height:1.8;
          ">
            ${skills.join(' • ') || 'No skills added yet'}
          </p>

        </body>
      </html>
    `;
  }


  // ============================================================
  // TEMPLATE: ELEGANT
  // ============================================================
  if (template === 'elegant') {
    return `
      <html>
        <body style="
          font-family:Georgia,'Times New Roman',serif;
          margin:0;
          padding:38px;
          color:#333;
          background:#ffffff;
        ">

          <div style="
            text-align:center;
            padding-bottom:20px;
          ">

            <h1 style="
              margin:0;
              font-size:31px;
              font-weight:normal;
              letter-spacing:2px;
              color:#333;
            ">
              ${personalInfo.fullName}
            </h1>

            <div style="
              width:50px;
              height:2px;
              background:#b08d57;
              margin:12px auto;
            "></div>

            <p style="
              margin:0;
              color:#777;
              font-size:12px;
            ">
              ${personalInfo.email || ''}
              ${personalInfo.phone ? ` • ${personalInfo.phone}` : ''}
              ${personalInfo.location ? ` • ${personalInfo.location}` : ''}
            </p>

          </div>

          <h2 style="
            color:#b08d57;
            font-size:14px;
            letter-spacing:2px;
            text-align:center;
            margin-top:20px;
          ">
            PROFILE
          </h2>

          <p style="
            text-align:center;
            font-size:13px;
            line-height:1.7;
            color:#555;
          ">
            ${personalInfo.summary || 'N/A'}
          </p>

          <h2 style="
            color:#b08d57;
            font-size:14px;
            letter-spacing:2px;
            margin-top:25px;
          ">
            EXPERIENCE
          </h2>

          ${experienceHtml}

          <h2 style="
            color:#b08d57;
            font-size:14px;
            letter-spacing:2px;
            margin-top:25px;
          ">
            EDUCATION
          </h2>

          ${educationHtml}

          <h2 style="
            color:#b08d57;
            font-size:14px;
            letter-spacing:2px;
            margin-top:25px;
          ">
            SKILLS
          </h2>

          <p style="
            font-size:13px;
            color:#555;
            line-height:1.8;
          ">
            ${skills.join(' • ') || 'No skills added yet'}
          </p>

        </body>
      </html>
    `;
  }


  // ============================================================
  // TEMPLATE: STUDENT / FRESH GRADUATE
  // ============================================================
  if (template === 'student') {
    return `
      <html>
        <body style="
          font-family:Arial,Helvetica,sans-serif;
          margin:0;
          padding:30px 35px;
          color:#222;
          background:#ffffff;
        ">

          <div style="
            text-align:center;
            background:#f1f5f9;
            padding:25px;
            border-radius:6px;
          ">

            <h1 style="
              margin:0;
              color:#0f172a;
              font-size:27px;
            ">
              ${personalInfo.fullName}
            </h1>

            <p style="
              color:#475569;
              font-size:12px;
              margin:8px 0 0;
            ">
              ${personalInfo.email || ''}
              ${personalInfo.phone ? ` • ${personalInfo.phone}` : ''}
              ${personalInfo.location ? ` • ${personalInfo.location}` : ''}
            </p>

          </div>

          <h2 style="
            color:#2563eb;
            font-size:15px;
            border-bottom:2px solid #2563eb;
            padding-bottom:5px;
            margin-top:25px;
          ">
            Career Objective
          </h2>

          <p style="
            font-size:13px;
            line-height:1.7;
            color:#444;
          ">
            ${personalInfo.summary || 'Motivated student seeking an opportunity to develop professional skills and contribute to a dynamic organization.'}
          </p>

          <h2 style="
            color:#2563eb;
            font-size:15px;
            border-bottom:2px solid #2563eb;
            padding-bottom:5px;
            margin-top:22px;
          ">
            Education
          </h2>

          ${educationHtml}

          <h2 style="
            color:#2563eb;
            font-size:15px;
            border-bottom:2px solid #2563eb;
            padding-bottom:5px;
            margin-top:22px;
          ">
            Experience
          </h2>

          ${experienceHtml}

          <h2 style="
            color:#2563eb;
            font-size:15px;
            border-bottom:2px solid #2563eb;
            padding-bottom:5px;
            margin-top:22px;
          ">
            Skills
          </h2>

          <div>
            ${
              skills
                .map(
                  (s) => `
                    <span style="
                      display:inline-block;
                      background:#dbeafe;
                      color:#1d4ed8;
                      padding:5px 10px;
                      margin:3px;
                      border-radius:4px;
                      font-size:12px;
                    ">
                      ${s}
                    </span>
                  `
                )
                .join('') || 'No skills added yet'
            }
          </div>

        </body>
      </html>
    `;
  }
  
  // Template: Classic (Default)
  return `
    <html>
      <body style="font-family:Georgia,'Times New Roman',serif;padding:32px;color:#222;">
        <div style="text-align:center;border-bottom:2px solid #222;padding-bottom:14px;margin-bottom:20px;">
          <h1 style="margin:0;font-size:26px;letter-spacing:1px;">${personalInfo.fullName}</h1>
          <p style="margin:6px 0 0;color:#555;font-size:13px;">
            ${personalInfo.email} • ${personalInfo.phone} • ${personalInfo.location}
          </p>
        </div>

        <h2 style="font-size:15px;border-bottom:1px solid #999;padding-bottom:4px;">Experience</h2>
        ${experienceHtml}

        <h2 style="font-size:15px;border-bottom:1px solid #999;padding-bottom:4px;margin-top:18px;">Education</h2>
        ${educationHtml}

        <h2 style="font-size:15px;border-bottom:1px solid #999;padding-bottom:4px;margin-top:18px;">Skills</h2>
        <p>${skills.join(' • ') || 'No skills added yet'}</p>
      </body>
    </html>
  `;
}

/**
 * Renders CV data to a local PDF file, styled according to the selected
 * template, and returns its file:// path.
 */
export async function generateCVPdf(data: CVData, fileName: string, templateId: TemplateId) {
  const html = buildCVHtml(data, templateId);
  const result = await RNHTMLtoPDF.convert({
    html,
    fileName,
    base64: false,
  });
  if (!result.filePath) throw new Error('PDF generation failed');
  return result.filePath;
}


















