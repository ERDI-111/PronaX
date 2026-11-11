import Link from 'next/link';
import { ShieldCheck, Mail, MapPin, Globe, Lock, FileText, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B192C] text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <span className="text-2xl font-black text-white">Prona<span className="text-emerald-400">X</span></span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider ml-1">
                Kosovë
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Platforma kryesore e pasurive të paluajtshme në Republikën e Kosovës. "Prona që kërkon. Shtëpia që meriton."
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Transaksione të enkriptuara 256-bit SSL</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs mb-4 uppercase tracking-wider">Navigimi</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Ballina</Link></li>
              <li><Link href="/dashboard/pronat" className="hover:text-emerald-400 transition-colors">Pronat e Mia</Link></li>
              <li><Link href="/pagesa/prop-ks-101" className="hover:text-emerald-400 transition-colors">Publiko Pronë (7 €)</Link></li>
              <li><Link href="/krahaso" className="hover:text-emerald-400 transition-colors">Krahaso Pronat</Link></li>
              <li><Link href="/kalkulatori" className="hover:text-emerald-400 transition-colors">Kalkulatori i Kredisë</Link></li>
              <li><Link href="/ndihma" className="hover:text-emerald-400 transition-colors">Qendra e Ndihmës</Link></li>
              <li><Link href="/faq" className="hover:text-emerald-400 transition-colors">Pyetjet e Shpeshta (FAQ)</Link></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-white font-bold text-xs mb-4 uppercase tracking-wider">Politikat & Ligji</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/kushtet-e-perdorimit" className="hover:text-emerald-400 transition-colors">Kushtet e Përdorimit</Link></li>
              <li><Link href="/politika-e-privatesise" className="hover:text-emerald-400 transition-colors">Politika e Privatësisë</Link></li>
              <li><Link href="/politika-e-pagesave" className="hover:text-emerald-400 transition-colors">Politika e Pagesave (7 €)</Link></li>
              <li><Link href="/politika-e-rimbursimit" className="hover:text-emerald-400 transition-colors">Politika e Rimbursimit</Link></li>
              <li><Link href="/rregullat-e-publikimit" className="hover:text-emerald-400 transition-colors">Rregullat e Publikimit</Link></li>
              <li><Link href="/politika-e-cookies" className="hover:text-emerald-400 transition-colors">Politika e Cookies</Link></li>
            </ul>
          </div>

          {/* Contact & Company */}
          <div>
            <h4 className="text-white font-bold text-xs mb-4 uppercase tracking-wider">Kompania & Kontakti</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <li><Link href="/rreth-nesh" className="hover:text-emerald-400 transition-colors">Rreth Nesh</Link></li>
              <li><Link href="/kontakti" className="hover:text-emerald-400 transition-colors">Kontakti & Ndihma</Link></li>
              <div className="flex items-center gap-2 pt-1">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <a href="mailto:pronaxestate@outlook.com" className="hover:text-emerald-400">pronaxestate@outlook.com</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Prishtinë, Kosovë</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <Link href="/admin/email-preview" className="text-[11px] text-amber-400 hover:underline">
                  Qendra e Emaileve (Admin)
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 PronaX Kosovo (pronax-ks.com). Të gjitha të drejtat të rezervuara.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Visa / Mastercard / Paysera</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Standardi i Patundshmërive në Kosovë</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
