import { CartProvider } from "../components/store/CartProvider";
import { CartDrawer } from "../components/store/CartDrawer";
import { Navbar } from "../components/store/Navbar";
import { Footer } from "../components/store/Footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
