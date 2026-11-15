import { EmailTemplateType } from '../types';

/**
 * Base wrapper for all PronaX HTML emails.
 * Styled with PronaX Navy & Emerald colors, mobile responsive layout.
 */
function wrapEmail(contentHtml: string, previewText: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PronaX Kosovë</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
    .wrapper { max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background-color: #0B192C; padding: 28px 32px; text-align: left; }
    .logo-badge { display: inline-block; background-color: #059669; color: #ffffff; font-weight: 900; font-size: 20px; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 8px; vertical-align: middle; margin-right: 8px; }
    .brand-title { display: inline-block; color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; vertical-align: middle; }
    .brand-accent { color: #34d399; }
    .body { padding: 32px; font-size: 14px; line-height: 1.6; color: #334155; }
    .body h1 { color: #0B192C; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 12px; }
    .cta-btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin: 20px 0; }
    .info-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center; }
    .footer a { color: #059669; text-decoration: none; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
  <div class="wrapper">
    <div class="header">
      <span class="logo-badge">P</span>
      <span class="brand-title">Prona<span class="brand-accent">X</span> Kosovë</span>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>PronaX</strong> – Prona që kërkon. Shtëpia që meriton.</p>
      <p style="margin: 0 0 6px 0;">pronax-ks.com • Email administrativ: <a href="mailto:pronaxestate@outlook.com">pronaxestate@outlook.com</a></p>
      <p style="margin: 0; color: #94a3b8;">Republika e Kosovës. Kjo është një porosi e automatizuar nga sistemi.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export class EmailTemplateRenderer {
  static render(type: EmailTemplateType, data: Record<string, any>): { subject: string; html: string } {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pronax-ks.com';

    switch (type) {
      case 'welcome': {
        const subject = 'Mirëseerdhët në PronaX Kosovë!';
        const html = wrapEmail(`
          <h1>Përshëndetje ${data.name || 'Përdorues'},</h1>
          <p>Mirëseerdhët në platformën kryesore të pasurive të paluajtshme në të gjithë Republikën e Kosovës.</p>
          <p>Tani mund të hulumtoni prona në të 38 komunat, të ruani kërkimet tuaja të preferuara ose të publikoni pronën tuaj me <strong>3 planet tona: Falas (3 ditë), Javor (2.99 €) ose Mujor (9.99 €)</strong>.</p>
          <a href="${baseUrl}/dashboard/pronat" class="cta-btn">Shko te Paneli Juaj</a>
          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">Nëse keni nevojë për ndihmë, na kontaktoni në çdo kohë në pronaxestate@outlook.com.</p>
        `, 'Mirëseerdhët në PronaX - Tregu i Patundshmërive në Kosovë');
        return { subject, html };
      }

      case 'email_verification': {
        const code = data.code;
        const subject = 'Kodi yt i verifikimit – PronaX';

        if (code) {
          const html = wrapEmail(`
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background-color: #ecfdf5; color: #059669; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
                ✓
              </div>
              <h1 style="color: #0B192C; font-size: 22px; font-weight: 800; margin: 0 0 8px 0;">Kodi yt i verifikimit</h1>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Përdor kodin e mëposhtëm me 6 shifra për t'u kyçur në llogarinë tënde PronaX:</p>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; background: #0B192C; color: #ffffff; font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; padding: 18px 32px 18px 44px; border-radius: 16px; box-shadow: 0 4px 12px rgba(11, 25, 44, 0.15);">
                ${code}
              </div>
            </div>

            <div class="info-card" style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 14px 16px;">
              <div style="color: #334155; font-size: 13px; margin-bottom: 6px;">
                ⏱ <strong>Ky kod skadon pas 5 minutash.</strong>
              </div>
              <div style="color: #64748b; font-size: 12px;">
                🔒 Mos e ndaj këtë kod me asnjë person. Ekipi i PronaX nuk do t'ju kërkojë kurrë kodin tuaj të sigurisë.
              </div>
            </div>

            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px;">
              Nëse nuk e keni kërkuar këtë kod, rekomandojmë të ndryshoni menjëherë fjalëkalimin e llogarisë tuaj.
            </p>
          `, `Kodi yt i verifikimit: ${code}`);
          return { subject, html };
        }

        const verifyUrl = data.verificationUrl || `${baseUrl}/auth/verify?token=demo`;
        const html = wrapEmail(`
          <h1>Verifikimi i Llogarisë Tuaj</h1>
          <p>Ju lutem klikoni butonin më poshtë për të verifikuar adresën tuaj të email-it dhe për të aktivizuar plotësisht llogarinë tuaj në PronaX.</p>
          <a href="${verifyUrl}" class="cta-btn">Verifiko Email-in</a>
          <p style="color: #64748b; font-size: 12px;">Ky link skadon pas 24 orësh. Nëse nuk e keni krijuar këtë llogari, mund ta injoroni këtë email.</p>
        `, 'Verifikoni llogarinë tuaj PronaX');
        return { subject, html };
      }

      case 'password_reset': {
        const subject = 'Kërkesë për rivendosjen e fjalëkalimit – PronaX';
        const resetUrl = data.resetUrl || `${baseUrl}/auth/reset-password?token=demo`;
        const html = wrapEmail(`
          <h1>Rivendosja e Fjalëkalimit</h1>
          <p>Kemi pranuar një kërkesë për të ndryshuar fjalëkalimin e llogarisë tuaj në PronaX.</p>
          <p>Klikoni butonin e mëposhtëm për të zgjedhur një fjalëkalim të ri të sigurt:</p>
          <a href="${resetUrl}" class="cta-btn" style="background-color: #0B192C;">Ndrysho Fjalëkalimin</a>
          <p style="color: #64748b; font-size: 12px;">Nëse nuk e keni kërkuar ju këtë ndryshim, llogaria juaj mbetet e sigurt dhe nuk kërkohet asnjë veprim nga ana juaj.</p>
        `, 'Rivendosni fjalëkalimin tuaj PronaX');
        return { subject, html };
      }

      case 'payment_success': {
        const amount = data.amount || (data.amountCents ? (data.amountCents / 100).toFixed(2) : '9.99');
        const duration = data.durationDays ? `${data.durationDays} Ditë` : 'Sipas planit';
        const subject = `Dëshmi Pagese: ${amount} € për pronën "${data.propertyTitle || 'PronaX'}"`;
        const html = wrapEmail(`
          <h1>Pagesa u Konfirmua me Sukses!</h1>
          <p>Kemi pranuar pagesën tuaj prej <strong>${amount} €</strong> për publikimin e pronës suaj në PronaX.</p>
          <div class="info-card">
            <div style="font-weight: 700; color: #0B192C; margin-bottom: 8px;">Detajet e Transaksionit:</div>
            <div><strong>Prona:</strong> ${data.propertyTitle || 'Banesë në Kosovë'}</div>
            <div><strong>Shuma e Paguar:</strong> ${amount} € (EUR)</div>
            <div><strong>Vlefshmëria e Publikimit:</strong> ${duration}</div>
            <div><strong>Referenca:</strong> <code>${data.paymentId || 'TX-2026'}</code></div>
            <div><strong>Lloji:</strong> ${data.purpose === 'renewal' ? 'Rinovim' : 'Publikim i ri'}</div>
          </div>
          <p>Publikimi juaj është i mbrojtur. Nuk ka asnjë pagesë të fshehur apo ripërtëritje automatike.</p>
          <a href="${baseUrl}/pagesa/sukses?paymentId=${data.paymentId}" class="cta-btn">Shiko Faturën Digjitale</a>
        `, `Pagesa prej ${amount} € u konfirmua me sukses`);
        return { subject, html };
      }

      case 'listing_published': {
        const subject = `Prona juaj "${data.propertyTitle}" është publikuar!`;
        const html = wrapEmail(`
          <h1>Prona Juaj është Tani Publike!</h1>
          <p>Prona juaj <strong>"${data.propertyTitle}"</strong> u miratua dhe është e dukshme për mijëra blerës potencialë në të gjithë Kosovën.</p>
          <div class="info-card">
            <div><strong>Data e Aktivizimit:</strong> ${data.publishedAt || new Date().toLocaleDateString('sq-AL')}</div>
            <div><strong>Data e Skadimit:</strong> ${data.expiresAt || 'Sipas planit'}</div>
            <div><strong>Statusi:</strong> E Publikuar dhe Aktive</div>
          </div>
          <a href="${baseUrl}/dashboard/pronat" class="cta-btn">Shiko Pronën Tënde</a>
        `, 'Prona juaj u aktivizua në PronaX');
        return { subject, html };
      }

      case 'listing_rejected': {
        const subject = `Njoftim moderimi për pronën "${data.propertyTitle}"`;
        const html = wrapEmail(`
          <h1 style="color: #991b1b;">Përditësim mbi Moderimin e Pronës</h1>
          <p>Prona juaj <strong>"${data.propertyTitle}"</strong> kërkon rishikim para se të shfaqet publikisht.</p>
          <div class="info-card" style="border-left: 4px solid #ef4444; background-color: #fef2f2;">
            <strong style="color: #991b1b;">Arsyeja e Moderimit:</strong>
            <p style="margin: 4px 0 0 0; color: #7f1d1d;">${data.reason || 'Fotografi të paqarta ose përshkrim jo i plotë. Ju lutem plotësoni të dhënat e sakta sipas Rregullave të Publikimit.'}</p>
          </div>
          <p>Mund ta modifikoni pronën nga paneli juaj pa asnjë pagesë shtesë për ta dërguar sërish në aprovim.</p>
          <a href="${baseUrl}/dashboard/pronat" class="cta-btn" style="background-color: #0B192C;">Modifiko Pronën</a>
        `, 'Njoftim moderimi nga PronaX');
        return { subject, html };
      }

      case 'expiring_3d': {
        const subject = `Kujdes: Prona juaj "${data.propertyTitle}" skadon pas 3 ditësh`;
        const renewalUrl = `${baseUrl}/pagesa/${data.propertyId}?purpose=renewal`;
        const html = wrapEmail(`
          <h1 style="color: #b45309;">Paralajmërim Skadimi (3 Ditë të Mbetura)</h1>
          <p>Publikimi i pronës suaj <strong>"${data.propertyTitle}"</strong> do të përfundojë më <strong>${data.expiresAt}</strong>.</p>
          <p>Për të ruajtur vazhdimësinë e shfaqjes në hartë dhe kërkimet e blerësve, mund ta rinovoni pronën duke zgjedhur një plan të ri.</p>
          <a href="${renewalUrl}" class="cta-btn" style="background-color: #d97706;">Zgjidh Planin & Rinovo</a>
          <p style="color: #64748b; font-size: 12px;">Rinovimi është tërësisht manual. Kartela juaj nuk do të tarifohet kurrë automatikisht.</p>
        `, 'Prona juaj në PronaX skadon pas 3 ditësh');
        return { subject, html };
      }

      case 'expiring_1d': {
        const subject = `Urgjente: Prona juaj "${data.propertyTitle}" skadon nesër!`;
        const renewalUrl = `${baseUrl}/pagesa/${data.propertyId}?purpose=renewal`;
        const html = wrapEmail(`
          <h1 style="color: #dc2626;">Urgjente: Kanë Mbetur më Pak se 24 Orë!</h1>
          <p>Afati i publikimit për pronën <strong>"${data.propertyTitle}"</strong> skadon nesër. Nëse nuk rinovohet, ajo do të hiqet automatikisht nga kërkimi publik.</p>
          <a href="${renewalUrl}" class="cta-btn" style="background-color: #dc2626;">Zgjidh Planin & Rinovo</a>
          <p style="color: #64748b; font-size: 12px;">Prona mbetet e ruajtur në mënyrë të sigurt në panelin tuaj edhe pas skadimit.</p>
        `, 'Kanë mbetur më pak se 24 orë deri në skadim');
        return { subject, html };
      }

      case 'expired': {
        const subject = `Prona juaj "${data.propertyTitle}" ka skaduar – Riaktivizoni shpalljen`;
        const renewalUrl = `${baseUrl}/pagesa/${data.propertyId}?purpose=renewal`;
        const html = wrapEmail(`
          <h1>Prona Juaj ka Skaduar</h1>
          <p>Periudha e publikimit për pronën <strong>"${data.propertyTitle}"</strong> ka përfunduar.</p>
          <p>Prona është hequr nga rezultatet publike të kërkimit dhe harta, por të gjitha të dhënat, fotografitë dhe përshkrimi mbeten të ruajtura të paprekura në llogarinë tuaj.</p>
          <p>Për ta riaktivizuar pronën, zgjidhni njërin nga 3 planet tona:</p>
          <a href="${renewalUrl}" class="cta-btn">Zgjidh Planin & Riaktivizo</a>
        `, 'Prona juaj ka skaduar - Riaktivizoni shpalljen');
        return { subject, html };
      }

      case 'renewed': {
        const subject = `Prona juaj "${data.propertyTitle}" u rinovua me sukses`;
        const html = wrapEmail(`
          <h1>Rinovimi u Krye me Sukses!</h1>
          <p>Faleminderit! Prona juaj <strong>"${data.propertyTitle}"</strong> u rinovua me sukses.</p>
          <div class="info-card">
            <div><strong>Afati i Ri i Skadimit:</strong> ${data.newExpiresAt || 'Sipas planit'}</div>
            <div><strong>Numri i Rinovimeve:</strong> #${data.renewalCount || 1}</div>
            <div><strong>Statusi:</strong> E Publikuar dhe Aktive</div>
          </div>
          <a href="${baseUrl}/dashboard/pronat" class="cta-btn">Shiko në Panelin Tuaj</a>
        `, 'Prona juaj u rinovua me sukses');
        return { subject, html };
      }

      case 'new_message': {
        const subject = `Keni një mesazh të ri për pronën "${data.propertyTitle}"`;
        const html = wrapEmail(`
          <h1>Mesazh i Ri nga një Blerës Potencial</h1>
          <p>Keni pranuar një mesazh të ri nga <strong>${data.senderName || 'Një përdorues i interesuar'}</strong> në lidhje me pronën tuaj <strong>"${data.propertyTitle}"</strong>.</p>
          <div class="info-card" style="font-style: italic; background-color: #f8fafc;">
            "${data.messagePreview || 'Përshëndetje, jam i interesuar të shikoj pronën nga afër. A është e lirë për vizitë këtë fundjavë?'}"
          </div>
          <a href="${baseUrl}/dashboard/mesazhet" class="cta-btn">Përgjigju Mesazhit</a>
        `, 'Mesazh i ri në PronaX');
        return { subject, html };
      }

      case 'saved_search_match': {
        const subject = `Pronë e re në ${data.municipality || 'Kosovë'} që përputhet me kërkimin tuaj!`;
        const html = wrapEmail(`
          <h1>Gjetje e Re sipas Preferencave Tuaja!</h1>
          <p>Një pronë e re sapo u publikua në <strong>${data.municipality || 'Prishtinë'}</strong> që përputhet me kriteret e kërkimit tuaj të ruajtur:</p>
          <div class="info-card">
            <div style="font-weight: 700; font-size: 15px; color: #0B192C;">${data.propertyTitle}</div>
            <div style="color: #059669; font-weight: 800; font-size: 16px; margin: 4px 0;">${data.price} €</div>
            <div style="color: #64748b;">${data.propertyType} • ${data.areaM2} m² • ${data.municipality}</div>
          </div>
          <a href="${baseUrl}/prona/${data.propertySlug || data.propertyId}" class="cta-btn">Shiko Pronën</a>
        `, 'Gjetje e re e pronës në PronaX');
        return { subject, html };
      }

      // ==============================================================================
      // AGENT 9: AUTHENTICATION, 2FA AND EMAIL VERIFICATION TEMPLATES
      // ==============================================================================

      case 'registration_otp': {
        const code = data.code || '123456';
        const lang = data.language || 'sq';
        const isSq = lang === 'sq';
        const subject = isSq
          ? `Kodi yt i regjistrimit: ${code} – PronaX`
          : `Your Registration Code: ${code} – PronaX`;

        const html = wrapEmail(`
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background-color: #ecfdf5; color: #059669; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
              ✓
            </div>
            <h1 style="color: #0B192C; font-size: 22px; font-weight: 800; margin: 0 0 8px 0;">
              ${isSq ? 'Verifikimi i Regjistrimit' : 'Registration Verification'}
            </h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              ${isSq ? 'Përdor kodin e mëposhtëm me 6 shifra për të verifikuar llogarinë tënde në PronaX:' : 'Use the 6-digit code below to verify your PronaX account:'}
            </p>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #0B192C; color: #ffffff; font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; padding: 18px 32px 18px 44px; border-radius: 16px; box-shadow: 0 4px 12px rgba(11, 25, 44, 0.15);">
              ${code}
            </div>
          </div>

          <div class="info-card" style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 14px 16px;">
            <div style="color: #334155; font-size: 13px; margin-bottom: 6px;">
              ⏱ <strong>${isSq ? 'Kodi skadon pas 5 minutash.' : 'This code expires in 5 minutes.'}</strong>
            </div>
            <div style="color: #64748b; font-size: 12px;">
              🔒 ${isSq ? 'Kodi është për përdorim të njëhershëm. Mos e ndani me askënd.' : 'This code is single-use. Do not share it with anyone.'}
            </div>
          </div>

          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px;">
            ${isSq ? 'Nëse nuk keni kërkuar regjistrim në PronaX, mund ta injoroni me siguri këtë email.' : 'If you did not request registration on PronaX, you can safely ignore this email.'}
          </p>
        `, `${isSq ? 'Kodi yt i regjistrimit' : 'Your registration code'}: ${code}`);
        return { subject, html };
      }

      case 'login_otp': {
        const code = data.code || '123456';
        const lang = data.language || 'sq';
        const isSq = lang === 'sq';
        const subject = isSq
          ? `Kodi yt i hyrjes 2FA: ${code} – PronaX`
          : `Your 2FA Login Code: ${code} – PronaX`;

        const html = wrapEmail(`
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background-color: #eff6ff; color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
              🔐
            </div>
            <h1 style="color: #0B192C; font-size: 22px; font-weight: 800; margin: 0 0 8px 0;">
              ${isSq ? 'Verifikimi me Dy Faktorë (2FA)' : 'Two-Factor Login Verification'}
            </h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              ${isSq ? 'Kemi pranuar një kërkesë për hyrje në llogarinë tuaj. Shënoni kodin e mëposhtëm:' : 'We received a login request for your account. Enter the code below:'}
            </p>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #0B192C; color: #ffffff; font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; padding: 18px 32px 18px 44px; border-radius: 16px; box-shadow: 0 4px 12px rgba(11, 25, 44, 0.15);">
              ${code}
            </div>
          </div>

          <div class="info-card" style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 16px;">
            <div style="color: #334155; font-size: 13px; margin-bottom: 6px;">
              ⏱ <strong>${isSq ? 'Vlefshmëria: 5 minuta' : 'Validity: 5 minutes'}</strong>
            </div>
            <div style="color: #64748b; font-size: 12px;">
              ${data.ipAddress ? `<div><strong>IP:</strong> ${data.ipAddress}</div>` : ''}
              ${data.deviceInfo ? `<div><strong>Pajisja:</strong> ${data.deviceInfo}</div>` : ''}
            </div>
          </div>

          <p style="color: #dc2626; font-size: 11px; text-align: center; margin-top: 24px;">
            ${isSq ? 'Nëse nuk po provoni të hyni ju, ndryshoni fjalëkalimin menjëherë!' : 'If this wasn\'t you, change your password immediately!'}
          </p>
        `, `${isSq ? 'Kodi i hyrjes' : 'Your login code'}: ${code}`);
        return { subject, html };
      }

      case 'password_reset_otp': {
        const code = data.code || '123456';
        const lang = data.language || 'sq';
        const isSq = lang === 'sq';
        const subject = isSq
          ? `Kodi për rivendosjen e fjalëkalimit: ${code} – PronaX`
          : `Password Recovery Code: ${code} – PronaX`;

        const html = wrapEmail(`
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background-color: #fef2f2; color: #dc2626; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
              🔑
            </div>
            <h1 style="color: #0B192C; font-size: 22px; font-weight: 800; margin: 0 0 8px 0;">
              ${isSq ? 'Rivendosja e Fjalëkalimit' : 'Password Recovery'}
            </h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              ${isSq ? 'Përdorni kodin 6-shifror për të zgjedhur një fjalëkalim të ri:' : 'Use this 6-digit code to reset your password:'}
            </p>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #0B192C; color: #ffffff; font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; padding: 18px 32px 18px 44px; border-radius: 16px; box-shadow: 0 4px 12px rgba(11, 25, 44, 0.15);">
              ${code}
            </div>
          </div>

          <div class="info-card" style="background-color: #f8fafc; border-left: 4px solid #dc2626; padding: 14px 16px;">
            <div style="color: #334155; font-size: 13px; margin-bottom: 6px;">
              ⏱ <strong>${isSq ? 'Kodi skadon pas 5 minutash.' : 'Code expires in 5 minutes.'}</strong>
            </div>
            <div style="color: #64748b; font-size: 12px;">
              ${isSq ? 'Nëse nuk e keni kërkuar këtë, llogaria juaj mbetet e sigurt.' : 'If you didn\'t request this, your account remains secure.'}
            </div>
          </div>
        `, `Kodi: ${code}`);
        return { subject, html };
      }

      case 'email_verify_otp': {
        const code = data.code || '123456';
        const lang = data.language || 'sq';
        const isSq = lang === 'sq';
        const subject = isSq
          ? `Kodi i konfirmimit të email-it: ${code} – PronaX`
          : `Email Confirmation Code: ${code} – PronaX`;

        const html = wrapEmail(`
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0B192C; font-size: 22px; font-weight: 800; margin: 0 0 8px 0;">
              ${isSq ? 'Konfirmo Adresën Tënde të Email-it' : 'Confirm Your Email Address'}
            </h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              ${isSq ? 'Shënoni këtë kod me 6 shifra për të përfunduar verifikimin:' : 'Enter this 6-digit code to complete verification:'}
            </p>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #0B192C; color: #ffffff; font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; padding: 18px 32px 18px 44px; border-radius: 16px;">
              ${code}
            </div>
          </div>

          <div class="info-card">
            <div>⏱ ${isSq ? 'Afati: 5 minuta' : 'Expires in: 5 minutes'}</div>
          </div>
        `, `Kodi: ${code}`);
        return { subject, html };
      }

      case 'security_alert': {
        const lang = data.language || 'sq';
        const isSq = lang === 'sq';
        const subject = isSq
          ? `⚠️ Njoftim Sigurie për Llogarinë tuaj PronaX`
          : `⚠️ Security Alert for Your PronaX Account`;

        const html = wrapEmail(`
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background-color: #fef2f2; color: #dc2626; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
              ⚠️
            </div>
            <h1 style="color: #dc2626; font-size: 20px; font-weight: 800;">
              ${data.title || (isSq ? 'Aktivitet i Ri Sigurie' : 'Security Activity Alert')}
            </h1>
          </div>

          <div class="info-card" style="border-left: 4px solid #dc2626;">
            <div><strong>${isSq ? 'Ngjarja:' : 'Event:'}</strong> ${data.eventDescription || 'Aktivitet i dyshimtë'}</div>
            <div><strong>${isSq ? 'Koha:' : 'Timestamp:'}</strong> ${data.timestamp || new Date().toLocaleString()}</div>
            ${data.ipAddress ? `<div><strong>IP:</strong> ${data.ipAddress}</div>` : ''}
            ${data.location ? `<div><strong>${isSq ? 'Lokacioni:' : 'Location:'}</strong> ${data.location}</div>` : ''}
          </div>

          <p style="color: #334155; font-size: 13px;">
            ${isSq ? 'Nëse ky veprim nuk është bërë nga ju, ju lutem ndryshoni menjëherë fjalëkalimin dhe kontaktoni administratorin në pronaxestate@outlook.com.' : 'If this was not done by you, please change your password immediately and contact support at pronaxestate@outlook.com.'}
          </p>
          <a href="${baseUrl}/fjalekalimi-harruar" class="cta-btn" style="background-color: #dc2626;">
            ${isSq ? 'Siguro Llogarinë Tënde' : 'Secure Your Account'}
          </a>
        `, 'Njoftim Sigurie PronaX');
        return { subject, html };
      }

      // ==============================================================================
      // AGENT 10: EMAIL MANAGEMENT AND ADMIN NOTIFICATION TEMPLATES (pronaxestate@outlook.com)
      // ==============================================================================

      case 'admin_contact_form': {
        const subject = `📬 [PronaX Kontakt] ${data.subject || 'Mesazh i ri nga vizitori'} – ${data.name || 'Anonim'}`;
        const adminUrl = `${baseUrl}/admin/dashboard?tab=mesazhet`;
        const html = wrapEmail(`
          <div style="border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px;">
            <span style="background-color: #ecfdf5; color: #059669; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">
              Forma e Kontaktit
            </span>
            <h1 style="color: #0B192C; font-size: 20px; font-weight: 800; margin: 8px 0 0 0;">Mesazh i Ri nga Vizitori</h1>
          </div>

          <div class="info-card">
            <div class="info-row"><strong>Dërguesi:</strong> <span>${data.name}</span></div>
            <div class="info-row"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></div>
            ${data.phone ? `<div class="info-row"><strong>Telefoni:</strong> <span>${data.phone}</span></div>` : ''}
            <div class="info-row"><strong>Subjekti:</strong> <span>${data.subject || 'Pa subjekt'}</span></div>
            <div class="info-row"><strong>Data & Koha:</strong> <span>${data.timestamp || new Date().toLocaleString('sq-AL')}</span></div>
            ${data.propertyId ? `<div class="info-row"><strong>Pronë Reference:</strong> <span>${data.propertyTitle || data.propertyId}</span></div>` : ''}
          </div>

          <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <div style="font-weight: 700; color: #0B192C; font-size: 13px; margin-bottom: 8px;">Përmbajtja e Plotë e Mesazhit:</div>
            <div style="color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</div>
          </div>

          <a href="${adminUrl}" class="cta-btn">Hap Panelin e Administratorit</a>
        `, `Mesazh i ri nga ${data.name}: ${data.subject || ''}`);
        return { subject, html };
      }

      case 'admin_support_request': {
        const ref = data.referenceId || `REF-${Date.now().toString().slice(-6)}`;
        const subject = `🆘 [PronaX Mbështetje ${ref}] ${data.category || 'Kërkesë e përgjithshme'} – ${data.name || 'Përdorues'}`;
        const adminUrl = `${baseUrl}/admin/dashboard?tab=mbeshtetja`;
        const html = wrapEmail(`
          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
            <span style="background-color: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">
              Kërkesë Mbështetjeje #${ref}
            </span>
            <h1 style="color: #0B192C; font-size: 20px; font-weight: 800; margin: 8px 0 0 0;">Tiketë e Re Mbështetjeje</h1>
          </div>

          <div class="info-card">
            <div class="info-row"><strong>Numri Referencës:</strong> <span>${ref}</span></div>
            <div class="info-row"><strong>Përdoruesi:</strong> <span>${data.name}</span></div>
            <div class="info-row"><strong>Email-i i Regjistruar:</strong> <a href="mailto:${data.email}">${data.email}</a></div>
            <div class="info-row"><strong>Kategoria:</strong> <span>${data.category}</span></div>
            <div class="info-row"><strong>Urgjenca:</strong> <span style="font-weight: bold; color: ${data.urgency === 'high' ? '#dc2626' : '#2563eb'};">${(data.urgency || 'normale').toUpperCase()}</span></div>
            <div class="info-row"><strong>Koha e Dorëzimit:</strong> <span>${data.timestamp || new Date().toLocaleString('sq-AL')}</span></div>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <div style="font-weight: 700; color: #0B192C; font-size: 13px; margin-bottom: 8px;">Kërkesa e Plotë:</div>
            <div style="color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.request}</div>
          </div>

          <a href="${adminUrl}" class="cta-btn" style="background-color: #2563eb;">Shiko Tiketën në Panel</a>
        `, `Kërkesë mbështetjeje nga ${data.name} [${ref}]`);
        return { subject, html };
      }

      case 'admin_new_property': {
        const isPending = data.requiresModeration === true;
        const subject = isPending
          ? `📋 [Moderim Pronë] "${data.title}" – ${data.municipality} (${data.price} €)`
          : `🏡 [Pronë e Re] "${data.title}" – ${data.municipality} (${data.price} €)`;
        const adminUrl = `${baseUrl}/admin/dashboard?tab=pronat`;
        const html = wrapEmail(`
          <div style="border-bottom: 2px solid ${isPending ? '#f59e0b' : '#059669'}; padding-bottom: 12px; margin-bottom: 20px;">
            <span style="background-color: ${isPending ? '#fef3c7' : '#ecfdf5'}; color: ${isPending ? '#b45309' : '#059669'}; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">
              ${isPending ? '⏳ Në Pritje të Moderimit' : '✅ Publikuar Menjëherë'}
            </span>
            <h1 style="color: #0B192C; font-size: 20px; font-weight: 800; margin: 8px 0 0 0;">Pronë e Re e Dorëzuar</h1>
          </div>

          <div class="info-card">
            <div class="info-row"><strong>Titulli:</strong> <span>${data.title}</span></div>
            <div class="info-row"><strong>Kategoria:</strong> <span>${data.category} (${data.listingType === 'qira' ? 'Me Qira' : 'Në Shitje'})</span></div>
            <div class="info-row"><strong>Komuna:</strong> <span>${data.municipality}</span></div>
            <div class="info-row"><strong>Çmimi i Shpallur:</strong> <span style="font-weight: 800; color: #059669;">${data.price} €</span></div>
            <div class="info-row"><strong>Plani i Zgjedhur:</strong> <span>${data.planName || (data.planId === 'free' ? 'Falas (3 ditë)' : data.planId)}</span></div>
            <div class="info-row"><strong>Email i Pronarit:</strong> <a href="mailto:${data.ownerEmail}">${data.ownerEmail}</a></div>
            <div class="info-row"><strong>Telefoni:</strong> <span>${data.ownerPhone || '—'}</span></div>
            <div class="info-row"><strong>Data e Dorëzimit:</strong> <span>${data.timestamp || new Date().toLocaleString('sq-AL')}</span></div>
          </div>

          ${isPending ? `
            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; margin: 16px 0; color: #92400e; font-size: 13px;">
              ⚠️ Kjo pronë kërkon aprovimin tuaj para se të shfaqet publikisht në faqe dhe hartë.
            </div>
          ` : ''}

          <a href="${adminUrl}" class="cta-btn">Shqyrto Pronën në Panel</a>
        `, `Pronë e re: ${data.title} në ${data.municipality}`);
        return { subject, html };
      }

      case 'admin_payment_event': {
        const isSuccess = data.status === 'successful';
        const subject = isSuccess
          ? `💰 [Pagesë e Konfirmuar] ${data.amount} ${data.currency || 'EUR'} – Plani ${data.planName || data.plan}`
          : `⚠️ [Problem Pagese] ${data.status} – ${data.paymentId || 'Ref'}`;
        const adminUrl = `${baseUrl}/admin/pagesat`;
        const html = wrapEmail(`
          <div style="border-bottom: 2px solid ${isSuccess ? '#059669' : '#dc2626'}; padding-bottom: 12px; margin-bottom: 20px;">
            <span style="background-color: ${isSuccess ? '#ecfdf5' : '#fef2f2'}; color: ${isSuccess ? '#059669' : '#dc2626'}; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">
              ${isSuccess ? 'Transaksion i Suksesshëm' : `Statusi: ${data.status}`}
            </span>
            <h1 style="color: #0B192C; font-size: 20px; font-weight: 800; margin: 8px 0 0 0;">Njoftim Pagese në PronaX</h1>
          </div>

          <div class="info-card">
            <div class="info-row"><strong>Referenca e Pagesës:</strong> <span>${data.paymentId}</span></div>
            <div class="info-row"><strong>Shuma & Monedha:</strong> <span style="font-weight: 800; font-size: 16px; color: ${isSuccess ? '#059669' : '#dc2626'};">${data.amount} ${data.currency || 'EUR'}</span></div>
            <div class="info-row"><strong>Plani:</strong> <span>${data.planName || data.plan} (${data.durationDays || '—'} ditë)</span></div>
            <div class="info-row"><strong>Prona:</strong> <span>${data.propertyTitle || data.propertyId}</span></div>
            <div class="info-row"><strong>Ofruesi i Pagesës:</strong> <span>${data.provider || 'Sistemi'}</span></div>
            <div class="info-row"><strong>Email i Përdoruesit:</strong> <span>${data.userEmail || '—'}</span></div>
            <div class="info-row"><strong>Koha e Verifikimit:</strong> <span>${data.timestamp || new Date().toLocaleString('sq-AL')}</span></div>
          </div>

          <a href="${adminUrl}" class="cta-btn" style="background-color: ${isSuccess ? '#059669' : '#dc2626'};">Shiko Regjistrin e Pagesave</a>
        `, `Pagesë PronaX: ${data.amount} EUR (${data.status})`);
        return { subject, html };
      }

      case 'admin_security_alert': {
        const subject = `🚨 [URGJENTE Siguri] ${data.title || 'Alert i ri i sigurisë në PronaX'}`;
        const adminUrl = `${baseUrl}/admin/ai`;
        const html = wrapEmail(`
          <div style="border-bottom: 2px solid #dc2626; padding-bottom: 12px; margin-bottom: 20px;">
            <span style="background-color: #fef2f2; color: #dc2626; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">
              Niveli: ${(data.severity || 'high').toUpperCase()}
            </span>
            <h1 style="color: #dc2626; font-size: 20px; font-weight: 800; margin: 8px 0 0 0;">Alert Sigurie dhe Mashtrimi</h1>
          </div>

          <div class="info-card" style="border-left: 4px solid #dc2626;">
            <div class="info-row"><strong>Lloji i Incidentit:</strong> <span>${data.title}</span></div>
            <div class="info-row"><strong>Koha:</strong> <span>${data.timestamp || new Date().toLocaleString('sq-AL')}</span></div>
            ${data.affectedEmail ? `<div class="info-row"><strong>Llogaria e Prekur:</strong> <span>${data.affectedEmail}</span></div>` : ''}
            ${data.ip ? `<div class="info-row"><strong>Adresa IP:</strong> <span>${data.ip}</span></div>` : ''}
          </div>

          <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 14px; margin: 16px 0; color: #9f1239; font-size: 13px;">
            <strong>Detajet Teknike:</strong>
            <div style="margin-top: 6px; white-space: pre-wrap;">${data.details}</div>
          </div>

          <a href="${adminUrl}" class="cta-btn" style="background-color: #dc2626;">Hap Qendrën e Sigurisë & AI</a>
        `, `Alert Sigurie: ${data.title}`);
        return { subject, html };
      }

      case 'admin_platform_digest': {
        const subject = `📊 [PronaX Digest] Përmbledhja Ditore e Platformës – ${new Date().toLocaleDateString('sq-AL')}`;
        const html = wrapEmail(`
          <h1>Përmbledhja Ditore e Platformës PronaX</h1>
          <p>Kjo është përmbledhja automatike e aktiviteteve dhe statusit të sistemit:</p>
          <div class="info-card">
            <div class="info-row"><strong>Prona që skadojnë së shpejti:</strong> <span>${data.expiringSoon || 0}</span></div>
            <div class="info-row"><strong>Prona të skaduara sot:</strong> <span>${data.expiredToday || 0}</span></div>
            <div class="info-row"><strong>Regjistrime të reja:</strong> <span>${data.newRegistrations || 0}</span></div>
            <div class="info-row"><strong>Kërkesa mbështetjeje të hapura:</strong> <span>${data.pendingSupport || 0}</span></div>
            <div class="info-row"><strong>Detyra moderimi në pritje:</strong> <span>${data.pendingModeration || 0}</span></div>
          </div>
          <a href="${baseUrl}/admin/dashboard" class="cta-btn">Hap Panelin Kryesor</a>
        `, 'Përmbledhja Ditore e PronaX');
        return { subject, html };
      }

      case 'admin_test_email': {
        const subject = `🧪 [PronaX Test] Email Testues i Konfirmuar – ${new Date().toLocaleTimeString('sq-AL')}`;
        const html = wrapEmail(`
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background-color: #ecfdf5; color: #059669; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
              ✓
            </div>
            <h1 style="color: #0B192C; font-size: 20px; font-weight: 800;">Email Testues i Suksesshëm!</h1>
            <p style="color: #64748b; font-size: 14px;">Ky email konfirmon që lidhja me kutinë e administratorit (${data.adminEmail || 'pronaxestate@outlook.com'}) funksionon me sukses.</p>
          </div>

          <div class="info-card">
            <div class="info-row"><strong>Ofruesi Aktiv:</strong> <span>${data.provider || 'Konfiguruar'}</span></div>
            <div class="info-row"><strong>Dërguar Më:</strong> <span>${new Date().toLocaleString('sq-AL')}</span></div>
            <div class="info-row"><strong>Serveri:</strong> <span>PronaX Production (Render.com)</span></div>
          </div>
        `, 'Email Testues i PronaX');
        return { subject, html };
      }
    }
  }
}
