export default function CampaignCard({ campaign, listMode, wide }) {
  return (
    <article
      className={`campaign-card ${
        listMode ? "campaign-card--list" : ""
      } ${wide ? "campaign-card--wide" : ""}`}
    >
      <img
        src={campaign.image}
        alt={campaign.title}
        className="campaign-card__img"
        loading="lazy"
        decoding="async"
      />
      <div className="campaign-card__overlay">
        <p className="campaign-card__eyebrow">{campaign.eyebrow}</p>
        <h3 className="campaign-card__title">{campaign.title}</h3>
        <p className="campaign-card__sub">{campaign.subtitle}</p>
        <button type="button" className="campaign-card__cta">
          {campaign.cta}
        </button>
      </div>
    </article>
  );
}
