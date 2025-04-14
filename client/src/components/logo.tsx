import { Link } from "wouter";
import logoPath from '@assets/generated-icon.png';

export const Logo = ({ size = "default" }: { size?: "small" | "default" | "large" }) => {
  const sizeClasses = {
    small: "h-8",
    default: "h-10",
    large: "h-12"
  };

  return (
    <Link href="/">
      <div className="flex items-center cursor-pointer">
        <img src={logoPath} alt="Nedaxer logo" className={`${sizeClasses[size]} mr-2`} />
        <span className={`font-bold ${size === "small" ? "text-lg" : size === "large" ? "text-3xl" : "text-2xl"} text-[#0033a0]`}>
          Nedaxer
        </span>
      </div>
    </Link>
  );
};