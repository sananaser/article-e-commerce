import './Footer.css';

const footerColumns = [
	{
		title: 'Shop',
		links: ['Ladies', 'Men', 'Kids', 'Home', 'Sport', 'Sale'],
	},
	{
		title: 'Corporate Info',
		links: ['Career at Article', 'About Article', 'Sustainability', 'Press'],
	},
	{
		title: 'Help',
		links: ['Customer Service', 'Returns & Refunds', 'Shipping', 'Contact Us'],
	},
	{
		title: 'Become a Member',
		links: ['Join Article Club', 'Member Benefits', 'Student Discount', 'Newsletter'],
	},
];

export default function Footer() {
	return (
		<footer className="site-footer">
			<div className="site-footer__inner">
				<div className="site-footer__columns">
					{footerColumns.map((column) => (
						<section className="footer-col" key={column.title}>
							<h4>{column.title}</h4>
							<ul>
								{column.links.map((link) => (
									<li key={link}>
										<a href="#" aria-label={link}>{link}</a>
									</li>
								))}
							</ul>
						</section>
					))}
				</div>

				<div className="site-footer__meta">
					<p>
						The content of this site is copyright-protected and is the property of ARTICLE Fashion Pvt Ltd.
						ARTICLE&apos;s business concept is to offer fashion and quality at the best price in a sustainable way.
					</p>
					<div className="site-footer__socials" aria-label="Social links">
						<a href="#" aria-label="Instagram">Instagram</a>
						<a href="#" aria-label="YouTube">YouTube</a>
						<a href="#" aria-label="Pinterest">Pinterest</a>
						<a href="#" aria-label="X">X</a>
						<a href="#" aria-label="Facebook">Facebook</a>
					</div>
					<div className="site-footer__legal">ARTICLE INDIA | INR | Privacy | Terms</div>
				</div>
			</div>
		</footer>
	);
}
