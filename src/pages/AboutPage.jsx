import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Users,
} from 'lucide-react';
import { AutoplayVideo } from '../components/common/AutoplayVideo';
import creatorImage from '../assets/images/farmcraft-creator.png';

const ABOUT_FARM_VIDEO_URL = import.meta.env.VITE_ABOUT_FARM_VIDEO_URL
  || 'https://videos.pexels.com/video-files/35106711/14872785_1920_1080_30fps.mp4';
const ABOUT_FARM_POSTER = 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=2200&q=85';

const VALUES = [
  {
    icon: Sprout,
    title: 'Rooted in real farming',
    description: 'Build useful tools around the people, seasons, and work that make each harvest possible.',
  },
  {
    icon: Users,
    title: 'Stronger local connections',
    description: 'Bring growers, suppliers, and buyers together in one welcoming marketplace.',
  },
  {
    icon: ShieldCheck,
    title: 'Clear and dependable',
    description: 'Make it easier to discover products, understand order details, and shop with confidence.',
  },
];

export const AboutPage = () => (
  <main className="bg-[#f8f9f5] pb-16 text-[#26352a]">
    <section className="relative isolate overflow-hidden bg-[#183c28]">
          <div aria-hidden="true" className="absolute inset-0 z-0">
        <AutoplayVideo
          src={ABOUT_FARM_VIDEO_URL}
          poster={ABOUT_FARM_POSTER}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#102919]/90 via-[#153621]/65 to-[#153621]/25" />
        <div className="absolute inset-0 bg-linear-to-t from-[#102919]/45 via-transparent to-[#102919]/10" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-[#e0ebc7] backdrop-blur">
            <Leaf className="h-4 w-4" /> About FarmCraft
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Growing a more connected farm community.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            FarmCraft brings local growers, farm suppliers, and buyers closer together through a simple, welcoming marketplace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d8e5ad] px-6 py-3 text-sm font-bold text-[#183c28] transition hover:bg-white">
              Explore the marketplace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-12 lg:py-20">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-[#69834b]">
          <Heart className="h-4 w-4" /> Why we are here
        </span>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-[#24392b] sm:text-4xl">
          A better path from the farm to the people who value it.
        </h2>
        <p className="mt-4 text-sm leading-7 text-[#5d685e] sm:text-base">
          Finding the right products, partners, and customers can take time. FarmCraft is designed to make those connections feel more direct and easier to manage—while keeping the farming community at the heart of the experience.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {[
            [ShoppingBag, 'Discover farm goods', 'Browse produce and practical supplies in one place.'],
            [Users, 'Connect with the community', 'Meet the growers and suppliers behind local products.'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-xl border border-[#e2e9dc] bg-white p-4">
              <Icon className="h-5 w-5 text-[#547347]" />
              <h3 className="mt-3 text-sm font-bold text-[#2c3c30]">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-[#69736a]">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <aside className="relative mx-auto w-full max-w-sm rounded-3xl bg-[#e6eddf] p-3 sm:p-4">
        <img
          src={creatorImage}
          alt="Portrait of the FarmCraft creator"
          className="aspect-[4/5] w-full rounded-2xl bg-[#0784ef] object-cover object-top shadow-lg"
          loading="lazy"
        />
        <div className="absolute inset-x-6 bottom-6 rounded-xl border border-white/70 bg-white/95 p-4 shadow-lg backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#69834b]">The person behind the idea</p>
          <p className="mt-1 text-lg font-bold text-[#263c2a]">FarmCraft creator</p>
          <p className="mt-1 text-xs leading-5 text-[#69736a]">Building a more connected experience for the farming community.</p>
        </div>
      </aside>
    </section>

    <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
      <div className="rounded-3xl bg-[#edf2e8] px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold text-[#69834b]">What guides us</span>
          <h2 className="mt-2 text-3xl font-bold text-[#24392b]">Made for people who help things grow.</h2>
          <p className="mt-3 text-sm leading-6 text-[#687269]">A thoughtful marketplace starts with useful details, genuine connections, and respect for the work behind every product.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-[#e2e9dc] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5ecd9] text-[#4e7144]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-[#2c3c30]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#69736a]">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  </main>
);
