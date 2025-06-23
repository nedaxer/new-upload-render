import { Link } from "wouter";

export const Logo = ({ size = "default" }: { size?: "small" | "default" | "large" }) => {
  const sizeClasses = {
    small: "h-8 w-8 text-lg",
    default: "h-10 w-10 text-xl",
    large: "h-12 w-12 text-2xl"
  };

  return (
    <Link href="/">
      <div className="flex items-center cursor-pointer">
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-[#0033a0] to-[#ff5900] rounded-lg flex items-center justify-center text-white font-bold mr-2`}>
          N
        </div>
        <span className={`font-bold ${size === "small" ? "text-lg" : size === "large" ? "text-3xl" : "text-2xl"} text-[#0033a0]`}>
          Nedaxer
        </span>
      </div>
    </Link>
  );
};