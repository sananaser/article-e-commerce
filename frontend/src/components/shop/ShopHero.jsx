export default function ShopHero({
  label,
  heading,
  sub,
  ctaLabel,
  onExplore,
}) {
  return (
    <div className="shop-hero">
      <div className="shop-hero__content">
        <p className="shop-hero__label">{label}</p>
        <h1 className="shop-hero__heading">{heading}</h1>
        <p className="shop-hero__sub">{sub}</p>
        <button className="shop-hero__cta" onClick={onExplore}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
