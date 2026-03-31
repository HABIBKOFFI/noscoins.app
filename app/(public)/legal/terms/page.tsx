export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
      <h1 className="text-3xl font-bold text-[#1A1410] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
        Conditions Générales d&apos;Utilisation
      </h1>
      <p className="text-sm text-[#1A1410]/40 mb-10">Dernière mise à jour : 1er avril 2026</p>

      {[
        {
          title: "1. Présentation de la plateforme",
          content: `Noscoins est une marketplace de réservation d'espaces événementiels opérée par Noscoins SAS. La plateforme met en relation des propriétaires d'espaces (salles, lofts, domaines, studios…) avec des clients particuliers ou professionnels souhaitant louer ces espaces pour des événements (mariages, séminaires, anniversaires, tournages, etc.).`
        },
        {
          title: "2. Acceptation des conditions",
          content: `L'utilisation de la plateforme Noscoins implique l'acceptation pleine et entière des présentes CGU. Toute personne qui ne souhaite pas être liée par les CGU ne doit pas utiliser les services de Noscoins.`
        },
        {
          title: "3. Inscription et comptes",
          content: `Pour accéder aux services de réservation ou de mise en location, vous devez créer un compte. Vous vous engagez à fournir des informations exactes, complètes et à jour. Tout compte peut être suspendu ou supprimé en cas d'informations erronées ou d'utilisation frauduleuse. Vous êtes responsable de la confidentialité de vos identifiants.`
        },
        {
          title: "4. Rôles utilisateurs",
          content: `La plateforme distingue trois rôles : (i) Client : peut rechercher, réserver et payer des espaces ; (ii) Propriétaire : peut créer et gérer des espaces, recevoir des réservations et des paiements ; (iii) Administrateur : équipe Noscoins chargée de la modération et de la configuration de la plateforme.`
        },
        {
          title: "5. Réservations et paiements",
          content: `Toute réservation implique le paiement d'un acompte de 30 % du montant total. Le solde est dû selon les modalités définies par le propriétaire (généralement 30 jours avant l'événement). Des frais de service non remboursables s'appliquent à chaque réservation. La commission de la plateforme (12 %) est prélevée automatiquement sur l'acompte.`
        },
        {
          title: "6. Politique d'annulation",
          content: `• Plus de 30 jours avant l'événement : remboursement intégral, sauf frais de service.\n• Entre 7 et 30 jours : remboursement de 70 %, l'acompte est retenu.\n• Moins de 7 jours : aucun remboursement.\n• Annulation par le propriétaire : remboursement intégral du client, pénalité prélevée sur le propriétaire.`
        },
        {
          title: "7. Obligations des propriétaires",
          content: `Les propriétaires s'engagent à : fournir des informations exactes sur leurs espaces, maintenir leurs disponibilités à jour, répondre aux demandes de devis dans un délai de 48h, et ne pas contourner la plateforme pour des transactions directes. Tout manquement peut entraîner la suspension du compte.`
        },
        {
          title: "8. Propriété intellectuelle",
          content: `Le contenu de la plateforme (textes, graphismes, logos, code) est la propriété exclusive de Noscoins SAS ou de ses partenaires. Toute reproduction ou utilisation non autorisée est interdite. Les propriétaires conservent la propriété des photos et descriptions qu'ils publient, mais accordent à Noscoins une licence d'utilisation.`
        },
        {
          title: "9. Responsabilité",
          content: `Noscoins agit en tant qu'intermédiaire et ne peut être tenu responsable des litiges entre clients et propriétaires, des dommages survenus dans les espaces, ni de l'inexactitude des informations publiées par les propriétaires. Noscoins s'efforce de vérifier la qualité des espaces mais ne garantit pas leur conformité exacte aux descriptions.`
        },
        {
          title: "10. Modification des CGU",
          content: `Noscoins se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email de toute modification substantielle. L'utilisation continue de la plateforme après notification vaut acceptation des nouvelles conditions.`
        },
        {
          title: "11. Droit applicable",
          content: `Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation ou exécution sera soumis aux tribunaux compétents de Paris, sauf disposition légale contraire.`
        },
        {
          title: "12. Contact",
          content: `Pour toute question relative aux présentes CGU : legal@noscoins.app`
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
