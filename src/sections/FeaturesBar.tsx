import { Users, DollarSign, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Tour guides in every city',
    description: 'More than 1200 private tour guides',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: DollarSign,
    title: 'Low prices on tours',
    description: 'Book tours directly with tour guides',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: MessageCircle,
    title: 'No booking fees',
    description: 'Talk to the tour guides directly. For free!',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export function FeaturesBar() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`flex-shrink-0 w-14 h-14 ${feature.bgColor} rounded-full flex items-center justify-center`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
