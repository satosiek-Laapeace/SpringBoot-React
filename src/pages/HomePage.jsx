import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Droplets,
  Leaf,
  MapPin,
  Sprout,
  Tractor,
  Users,
} from 'lucide-react';
import { AutoplayVideo } from '../components/common/AutoplayVideo';
import { getCategoryMedia } from '../config/categoryMedia';
import { useStore } from '../context/StoreContext';
import { subscribeToFarmcraftNewsletter } from '../services/farmDashboardService';

const FARMING_VIDEO_URL = import.meta.env.VITE_FARMING_VIDEO_URL
  || 'https://videos.pexels.com/video-files/12201593/12201593-hd_1920_1080_24fps.mp4';
const FARMING_VIDEO_POSTER = 'https://images.pexels.com/videos/12201593/seeding-12201593.jpeg';
const SMART_FARMING_VIDEO_URL = import.meta.env.VITE_SMART_FARMING_VIDEO_URL
  || 'https://videos.pexels.com/video-files/34182415/14490106_3840_2160_25fps.mp4';
const SMART_FARMING_IMAGE = 'https://planet.news/static/images/agricultural-technology-innovation-2026/header.png';

const SHORTCUTS = [
  { icon: MapPin, title: 'Find local farms', detail: 'Meet growers in your area', href: '/products' },
  { icon: Tractor, title: 'Equipment & supplies', detail: 'Tools for every growing season', href: '/products?category=Farm%20Tools' },
  { icon: CalendarDays, title: 'Community workshops', detail: 'Learn alongside local growers', href: '/about' },
  { icon: CircleHelp, title: 'Expert support', detail: 'Get practical answers from farmers', href: '/contact' },
];

const SERVICES = [
  { icon: Sprout, title: 'Crop management', detail: 'Plan planting cycles, follow crop health, and keep every field moving toward harvest.', href: '/dashboard/seller', tint: 'bg-[#e6efe0] text-[#416b3d]' },
  { icon: Droplets, title: 'Smart irrigation', detail: 'Make every drop count with soil insights, irrigation planning, and sensor-ready tools.', href: '/products?category=Farm%20Tools', tint: 'bg-[#e4f0ec] text-[#397b68]' },
  { icon: Leaf, title: 'Organic soil care', detail: 'Find trusted seeds, compost, and natural inputs from growers and suppliers.', href: '/products?category=Fertilizers', tint: 'bg-[#f1eadb] text-[#8b713e]' },
  { icon: Tractor, title: 'Farm-to-market', detail: 'Bring your harvest to more customers with a marketplace built around local farms.', href: '/products', tint: 'bg-[#e9eee2] text-[#547347]' },
];

const isImageUrl = (value) => typeof value === 'string' && /^(https?:|\/|data:image\/)/i.test(value);

export const HomePage = () => {
  const { categories, products } = useStore();
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');

  const handleSubscribe = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setNewsletterStatus('submitting');
    try {
      await subscribeToFarmcraftNewsletter(email.trim());
      setNewsletterStatus('success');
      setEmail('');
    } catch {
      setNewsletterStatus('error');
    }
  };

  return (
    <div className="bg-white text-[#26352a]">
      <section
        className="relative isolate flex min-h-150 items-center overflow-hidden bg-[#183c28] md:min-h-162"
      >
        <div aria-hidden="true" className="absolute inset-0 z-0">
          <AutoplayVideo
            src={FARMING_VIDEO_URL}
            poster={FARMING_VIDEO_POSTER}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#102919]/85 via-[#153621]/56 to-[#153621]/12" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-2xl animate-[farmcraft-enter_.7s_ease-out_both]">
            <span className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#d9e7bd]">
              <Sprout className="h-4 w-4" /> A stronger future, grown together
            </span>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              Fresh from local farms, made easier to find.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
              Discover fresh produce and useful farm supplies while supporting the growers behind every harvest.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d8e5ad] px-6 py-3 text-sm font-bold text-[#183c28] transition hover:bg-white">
                Shop the marketplace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Our story <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex max-w-xl flex-wrap gap-2">
              {[
                'Local-first marketplace',
                'Fresh choices from growers',
                'Simple, secure checkout',
              ].map(label => (
                <span key={label} className="rounded-full border border-white/20 bg-black/15 px-3 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm">{label}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-16 bg-linear-to-t from-[#f7f8f2]/30 to-transparent" />
      </section>

      <section aria-label="FarmCraft shortcuts" className="relative z-10 mx-auto mt-8 max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid overflow-hidden rounded-2xl bg-[#183c28] text-white shadow-xl shadow-[#183c28]/15 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map(({ icon: Icon, title, detail, href }, index) => (
            <Link key={title} to={href} className={`group flex min-h-24 items-center gap-3 px-5 py-4 transition hover:bg-white/10 ${index > 0 ? 'border-t border-white/10 sm:border-l sm:border-t-0' : ''}`}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#82a84a]/30 text-[#d9e7bd]">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-white/65">{detail}</span>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/50 transition group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          ))}
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#69834b]">The FarmCraft market</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#24392b]">Shop by category</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#687269]">Explore fresh products and trusted supplies from local farms.</p>
          </div>
          <Link to="/categories" className="inline-flex items-center gap-2 self-start text-sm font-bold text-[#315a36] transition hover:text-[#1d4028] sm:self-auto">
            All categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {categories.length > 0 ? (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category) => {
              const categoryName = category.categories_name || category.name || category.categoryName || 'Farm goods';
              const categoryId = category.id ?? category.categoryId;
              const productCount = products.filter((product) =>
                String(product.category_id ?? product.categoryId ?? product.category?.id ?? '') === String(categoryId)
              ).length;
              const imageUrl = category.icon_url || category.iconUrl;
              const categoryMedia = getCategoryMedia(categoryName);

              return (
                <Link key={categoryId || categoryName} to={`/products?categoryId=${encodeURIComponent(categoryId)}`} className="group overflow-hidden rounded-2xl border border-[#e3e9df] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#b9c9af] hover:shadow-lg">
                  <div className="relative aspect-[1.8] overflow-hidden bg-[#e9efe4]">
                    {categoryMedia ? (
                      <AutoplayVideo
                        src={categoryMedia.video}
                        poster={isImageUrl(imageUrl) ? imageUrl : categoryMedia.poster}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : isImageUrl(imageUrl) ? (
                      <img src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#547347]"><Sprout className="h-9 w-9" /></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-[#2c3c30]">{categoryName}</h3>
                      <p className="mt-1 text-sm text-[#69736a]">{productCount} {productCount === 1 ? 'product' : 'products'}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#69834b] transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-7 rounded-xl border border-dashed border-[#cbd7c4] bg-white/70 px-5 py-8 text-center text-sm text-[#687269]">
            Categories will appear here as soon as they are available.
          </div>
        )}
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:px-12 lg:py-20">
        <div className="max-w-lg">
          <span className="inline-flex items-center gap-2 text-sm font-semibold italic text-[#69834b]"><Leaf className="h-4 w-4" /> Grow together</span>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-[#24392b] sm:text-4xl">Good things grow in good company.</h2>
          <p className="mt-4 text-sm leading-6 text-[#5d685e]">
            FarmCraft connects growers, neighbors, and local buyers to share knowledge, build resilient farms, and make fresh food easier to find.
          </p>
          <div className="mt-7 space-y-5">
            {[
              ['Stronger together', 'Find nearby growers and build a more connected food community.', Users],
              ['Share what works', 'Trade practical ideas, seeds, and lessons learned in the field.', Leaf],
            ].map(([title, detail, Icon]) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e5ecd9] text-[#4e7144]"><Icon className="h-5 w-5" /></span>
                <div><h3 className="text-sm font-bold text-[#304333]">{title}</h3><p className="mt-1 text-xs leading-5 text-[#69736a]">{detail}</p></div>
              </div>
            ))}
          </div>
          <Link to="/about" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#285331] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1c4228]">
            Meet the community <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative rounded-2xl bg-[#edf2e8] p-2 sm:p-3">
          <AutoplayVideo
            src={SMART_FARMING_VIDEO_URL}
            poster={SMART_FARMING_IMAGE}
            className="aspect-[1.35] w-full rounded-xl object-cover shadow-lg"
          />
          <div className="absolute inset-x-5 bottom-5 rounded-xl border border-white/70 bg-[#f8f8ed]/95 p-4 shadow-lg backdrop-blur sm:inset-x-9 sm:bottom-9 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#dce8c7] text-[#44623a]"><Sprout className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#263c2a]">Smart farming in action</p>
                <p className="mt-1 text-xs leading-5 text-[#667064]">See how better field tools can help growers make informed decisions and care for every crop.</p>
                <Link to="/products?category=Farm%20Tools" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#40623a] hover:underline">Explore farm tools <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-xl text-center">
            <span className="text-sm font-semibold italic text-[#69834b]">What we offer</span>
            <h2 className="mt-2 text-3xl font-bold text-[#24392b]">Tools for every part of the growing season</h2>
            <p className="mt-3 text-sm leading-6 text-[#687269]">From the first seed to the final sale, find practical support for your farm.</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ icon: Icon, title, detail, href, tint }) => (
              <Link key={title} to={href} className="group rounded-2xl border border-[#e8ece4] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#c7d4bb] hover:shadow-lg">
                <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${tint}`}><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-base font-bold text-[#2c3c30]">{title}</h3>
                <p className="mt-2 min-h-16 text-xs leading-5 text-[#69736a]">{detail}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#416441]">Learn more <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-xl bg-[#244c2d] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-7">
          <div className="flex items-start gap-3">
            <Leaf className="mt-1 h-6 w-6 shrink-0 text-[#c6d99c]" />
            <div><h2 className="text-lg font-bold">A little field note for your inbox.</h2><p className="mt-1 text-xs leading-5 text-white/70">Seasonal growing tips, community stories, and FarmCraft updates.</p></div>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setNewsletterStatus('idle'); }} placeholder="Your email address" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white px-4 py-3 text-sm text-[#26352a] outline-none focus:ring-2 focus:ring-[#c6d99c]" />
            <button type="submit" disabled={newsletterStatus === 'submitting'} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d8e5ad] px-5 py-3 text-sm font-bold text-[#183c28] transition hover:bg-white disabled:cursor-wait disabled:opacity-70">{newsletterStatus === 'submitting' ? 'Joining...' : newsletterStatus === 'success' ? <><Check className="h-4 w-4" /> Subscribed</> : 'Subscribe'}</button>
          </form>
        </div>
        {newsletterStatus === 'success' && <p role="status" className="mx-auto mt-3 max-w-7xl px-2 text-right text-xs font-semibold text-[#416441]">Thanks for joining the FarmCraft community.</p>}
        {newsletterStatus === 'error' && <p role="alert" className="mx-auto mt-3 max-w-7xl px-2 text-right text-xs font-semibold text-[#a34e39]">We couldn’t submit your signup. Please try again shortly.</p>}
      </section>
      <style>{`@keyframes farmcraft-enter { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};
