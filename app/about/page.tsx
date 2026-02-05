import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Enshittification | Enshittification Clock',
  description: 'Learn about enshittification, platform decay, and how online services decline in quality over time.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          What is Enshittification?
        </h1>

        <blockquote className="border-l-4 border-gray-300 pl-6 py-2 mb-6 text-gray-700 italic">
          <p className="text-lg leading-relaxed">
            Enshittification, also known as crapification and platform decay, is a process
            in which two-sided online products and services decline in quality over time.
            Initially, vendors create high-quality offerings to attract users, then they
            degrade those offerings to better serve business customers, and finally degrade
            their services to both users and business customers to maximize short-term
            profits for shareholders.
          </p>
        </blockquote>

        <p className="text-sm text-gray-500">
          Source:{' '}
          <a
            href="https://en.wikipedia.org/wiki/Enshittification"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Wikipedia - Enshittification
          </a>
        </p>
      </div>
    </main>
  );
}
