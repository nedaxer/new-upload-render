import { learningResources } from "@/lib/constants";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export const LearningResources = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#0033a0]">
          Learn to Trade
        </h2>
        <p className="text-center text-[#666666] mb-10 max-w-3xl mx-auto">
          Access our comprehensive educational resources designed to help traders of all experience levels succeed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningResources.map((resource, index) => (
            <div key={index} className="bg-[#f5f5f5] rounded-lg overflow-hidden">
              <img
                src={resource.image}
                alt={resource.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-[#0033a0]">{resource.title}</h3>
                <p className="mb-4 text-[#666666]">{resource.description}</p>
                <Link
                  href={resource.link.href}
                  className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center"
                >
                  {resource.link.label} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
