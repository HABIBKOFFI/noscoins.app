export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
      <h1 className="text-3xl font-bold text-[#1A1410] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
        Politique de Confidentialité
      </h1>
      <p className="text-sm text-[#1A1410]/40 mb-10">Dernière mise à jour : 1er avril 2026</p>

      {[
        {
          title: "1. Responsable du traitement",
          content: `Noscoins SAS, dont le siège social est en France, est responsable du traitement de vos données personnelles dans le cadre de l'utilisation de la plateforme noscoins.app. Contact DPO : privacy@noscoins.app`
        },
        {
          title: "2. Données collectées",
          content: `Nous collectons les données suivantes :\n• Données d'identification : nom, prénom, adresse email, numéro de téléphone\n• Données de connexion : adresse IP, horodatage, type de navigateur\n• Données de transaction : montants, références de paiement (jamais les numéros de carte)\n• Données de comportement : pages visitées, recherches effectuées (anonymisées)\n• Documents KYC (propriétaires uniquement) : pièce d'identité, RIB`
        },
        {
          title: "3. Finalités du traitement",
          content: `Vos données sont utilisées pour :\n• Gestion de votre compte et authentification\n• Traitement des réservations et paiements\n• Communication transactionnelle (confirmation, rappels)\n• Prévention de la fraude et sécurité\n• Amélioration de nos services (données agrégées anonymisées)\n• Respect de nos obligations légales (comptabilité, RGPD, BCEAO)`
        },
        {
          title: "4. Base légale",
          content: `Nos traitements reposent sur :\n• L'exécution du contrat (réservations, paiements)\n• Notre intérêt légitime (sécurité, amélioration du service)\n• Votre consentement (communications marketing, si applicable)\n• Nos obligations légales (conservation comptable 10 ans)`
        },
        {
          title: "5. Durée de conservation",
          content: `• Données de compte : 3 ans après la dernière activité\n• Données de transaction : 10 ans (obligations comptables légales)\n• Documents KYC : durée de la relation contractuelle + 5 ans\n• Logs de connexion : 12 mois\n• Données de navigation anonymisées : 13 mois`
        },
        {
          title: "6. Partage des données",
          content: `Nous ne vendons jamais vos données. Nous les partageons uniquement avec :\n• Nos prestataires de paiement (Stripe, CinetPay) — données nécessaires à la transaction\n• Notre service email (Resend) — uniquement adresse email\n• Notre hébergeur (Vercel/Supabase) — données chiffrées au repos\n• Les autorités compétentes en cas d'obligation légale`
        },
        {
          title: "7. Transferts internationaux",
          content: `Certains de nos prestataires (Stripe, Cloudinary, Vercel) sont établis aux États-Unis. Ces transferts sont encadrés par des clauses contractuelles types approuvées par la Commission européenne, garantissant un niveau de protection adéquat.`
        },
        {
          title: "8. Vos droits (RGPD)",
          content: `Conformément au RGPD, vous disposez des droits suivants :\n• Droit d'accès à vos données personnelles\n• Droit de rectification\n• Droit à l'effacement (sous réserve de nos obligations légales)\n• Droit à la portabilité\n• Droit d'opposition au traitement\n• Droit à la limitation du traitement\n\nPour exercer vos droits : privacy@noscoins.app. Délai de réponse : 30 jours.`
        },
        {
          title: "9. Cookies",
          content: `Nous utilisons uniquement des cookies fonctionnels strictement nécessaires (authentification, session). Aucun cookie publicitaire tiers n'est utilisé. Vous pouvez gérer vos préférences via les paramètres de votre navigateur.`
        },
        {
          title: "10. Sécurité",
          content: `Vos données sont protégées par :\n• Chiffrement en transit (HTTPS/TLS 1.3)\n• Chiffrement au repos (Supabase AES-256)\n• Tokens JWT à expiration courte (15 min)\n• Accès restreint aux données selon les rôles\n• Journalisation des accès sensibles (AuditLog)`
        },
        {
          title: "11. Réclamation",
          content: `Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la CNIL (www.cnil.fr) en France, ou de l'autorité de protection des données compétente dans votre pays.`
        },
      ].map(({ title, content }) => (
        <div key={title} className="mb-8">
          <h2 className="text-lg font-semibold text-[#1A1410] mb-3">{title}</h2>
          <p className="text-sm text-[#1A1410]/65 leading-relaxed whitespace-pre-line">{content}</p>
        </div>
      ))}
    </div>
  );
}
