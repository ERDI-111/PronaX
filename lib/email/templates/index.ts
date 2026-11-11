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
          <p>Tani mund të hulumtoni prona në të 38 komunat, të ruani kërkimet tuaja të preferuara ose të publikoni pronën tuaj me tarifën fikse prej <strong>7.00 € për 30 ditë</strong>.</p>
          <a href="${baseUrl}/dashboard/pronat" class="cta-btn">Shko te Paneli Juaj</a>
          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">Nëse keni nevojë për ndihmë, na kontaktoni në çdo kohë në pronaxestate@outlook.com.</p>
        `, 'Mirëseerdhët në PronaX - Tregu i Patundshmërive në Kosovë');
        return { subject, html };
      }

      case 'email_verification': {
        const subject = 'Verifikoni adresën tuaj të email-it – PronaX';
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
        const subject = `Dëshmi Pagese: 7.00 € për pronën "${data.propertyTitle || 'PronaX'}"`;
        const html = wrapEmail(`
          <h1>Pagesa u Konfirmua me Sukses!</h1>
          <p>Kemi pranuar pagesën tuaj prej <strong>7.00 €</strong> për publikimin e pronës suaj në PronaX.</p>
          <div class="info-card">
            <div style="font-weight: 700; color: #0B192C; margin-bottom: 8px;">Detajet e Transaksionit:</div>
            <div><strong>Prona:</strong> ${data.propertyTitle || 'Banesë në Kosovë'}</div>
            <div><strong>Shuma e Paguar:</strong> 7.00 € (EUR)</div>
            <div><strong>Vlefshmëria e Publikimit:</strong> 30 Ditë Kalendarike</div>
            <div><strong>Referenca:</strong> <code>${data.paymentId || 'TX-2026'}</code></div>
            <div><strong>Lloji:</strong> ${data.purpose === 'renewal' ? 'Rinovim 30-ditor' : 'Publikim i ri'}</div>
          </div>
          <p>Publikimi juaj është i mbrojtur. Nuk ka asnjë pagesë të fshehur apo ripërtëritje automatike.</p>
          <a href="${baseUrl}/pagesa/sukses?paymentId=${data.paymentId}" class="cta-btn">Shiko Faturën Digjitale</a>
        `, 'Pagesa prej 7.00 € u konfirmua me sukses');
        return { subject, html };
      }

      case 'listing_published': {
        const subject = `Prona juaj "${data.propertyTitle}" është publikuar!`;
        const html = wrapEmail(`
          <h1>Prona Juaj është Tani Publike!</h1>
          <p>Prona juaj <strong>"${data.propertyTitle}"</strong> u miratua dhe është e dukshme për mijëra blerës potencialë në të gjithë Kosovën.</p>
          <div class="info-card">
            <div><strong>Data e Aktivizimit:</strong> ${data.publishedAt || new Date().toLocaleDateString('sq-AL')}</div>
            <div><strong>Data e Skadimit (30 ditë):</strong> ${data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('sq-AL')}</div>
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
          <p>Publikimi 30-ditor i pronës suaj <strong>"${data.propertyTitle}"</strong> do të përfundojë më <strong>${data.expiresAt}</strong>.</p>
          <p>Për të ruajtur vazhdimësinë e shfaqjes në hartë dhe kërkimet e blerësve, mund ta rinovoni pronën me tarifën standarde prej <strong>7.00 €</strong>.</p>
          <a href="${renewalUrl}" class="cta-btn" style="background-color: #d97706;">Rinovo Pronën – 7 €</a>
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
          <a href="${renewalUrl}" class="cta-btn" style="background-color: #dc2626;">Rinovo Tani me 7.00 €</a>
          <p style="color: #64748b; font-size: 12px;">Prona mbetet e ruajtur në mënyrë të sigurt në panelin tuaj edhe pas skadimit.</p>
        `, 'Kanë mbetur më pak se 24 orë deri në skadim');
        return { subject, html };
      }

      case 'expired': {
        const subject = `Prona juaj "${data.propertyTitle}" ka skaduar – Rinovoni me 7 €`;
        const renewalUrl = `${baseUrl}/pagesa/${data.propertyId}?purpose=renewal`;
        const html = wrapEmail(`
          <h1>Prona Juaj ka Skaduar</h1>
          <p>Periudha 30-ditore për pronën <strong>"${data.propertyTitle}"</strong> ka përfunduar.</p>
          <p>Prona është hequr nga rezultatet publike të kërkimit dhe harta, por të gjitha të dhënat, fotografitë dhe përshkrimi mbeten të ruajtura të paprekura në llogarinë tuaj.</p>
          <p>Për ta riaktivizuar pronën për <strong>30 ditë shtesë</strong>, klikoni butonin më poshtë:</p>
          <a href="${renewalUrl}" class="cta-btn">Rinovo Pronën – 7.00 €</a>
        `, 'Prona juaj ka skaduar - Rinovoni me 7 €');
        return { subject, html };
      }

      case 'renewed': {
        const subject = `Prona juaj "${data.propertyTitle}" u rinovua me sukses për 30 ditë`;
        const html = wrapEmail(`
          <h1>Rinovimi u Krye me Sukses!</h1>
          <p>Faleminderit! Kemi pranuar pagesën tuaj prej <strong>7.00 €</strong> dhe prona juaj <strong>"${data.propertyTitle}"</strong> u rinovua me sukses.</p>
          <div class="info-card">
            <div><strong>Afati i Ri i Skadimit:</strong> ${data.newExpiresAt} (30 Ditë Kalendarike)</div>
            <div><strong>Numri i Rinovimeve:</strong> #${data.renewalCount || 1}</div>
            <div><strong>Statusi:</strong> E Publikuar dhe Aktive</div>
          </div>
          <a href="${baseUrl}/dashboard/pronat" class="cta-btn">Shiko në Panelin Tuaj</a>
        `, 'Prona juaj u rinovua me sukses për 30 ditë');
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
    }
  }
}
