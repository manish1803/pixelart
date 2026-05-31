"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "../shared/Logo";
import { UserMenu } from "../shared/layout/UserMenu";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  // Smart Hide/Show on Scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Gallery", href: "#gallery" },
    { name: "Roadmap", href: "#roadmap" },
    { name: "GitHub", href: "https://github.com/manish1803/pixel-art" },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 inset-x-0 z-[100] h-16 border-b border-border-subtle bg-background/80 backdrop-blur-md flex items-center"
        >
          <div className="content-container w-full flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="transition-transform hover:scale-105">
                <Logo />
              </Link>
              
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="text-xs font-medium text-text-muted hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4"
            >
              {!session ? (
                <>
                  <Link href="/auth/signin" className="text-xs font-bold text-text-muted hover:text-foreground transition-colors">
                    Sign in
                  </Link>
                  <Link href="/editor" className="btn-primary py-2 px-4 rounded-md">
                    Launch Editor
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-xs font-bold text-text-muted hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                  <UserMenu 
                    onSignIn={() => router.push('/auth/signin')} 
                  />
                </>
              )}
            </motion.div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
